import pandas as pd
import pymongo
from pymongo import MongoClient
import xlsxwriter
from datetime import datetime


def retrieveDbData(db, build_id):
    build_id = [build_id] if type(build_id) != list else build_id
    query = [
        {
            # $match: filters the documents in the collection based on the build ID, using the $in
            "$match": {"build_id": {"$in": build_id}}
        },
        {
            # $group: groups the documents by various fields, including ref_id, status, build_id, voltage, temperature, DB_PARAM__temp_root_max, and DB_PARAM__temp_root_min.
            "$group": {
                "_id": {
                    "ref_id": "$ref_id",
                    "status": "$status",
                    "build_id": "$build_id",
                    "voltage": "$voltage",
                    "temperature": "$temperature",
                    "DB_PARAM__device_temp_max": "$DB_PARAM__device_temp_max",
                    "DB_PARAM__device_temp_min": "$DB_PARAM__device_temp_min",
                    "run_time": "$run_time",
                    "DB_PARAM__vcc_batt": "$DB_PARAM__vcc_batt",
                    "DB_PARAM__vcc_pmc": "$DB_PARAM__vcc_pmc",
                    "DB_PARAM__vcc_psfp": "$DB_PARAM__vcc_psfp",
                    "DB_PARAM__vcc_pslp": "$DB_PARAM__vcc_pslp",
                    "DB_PARAM__vcc_ram": "$DB_PARAM__vcc_ram",
                    "DB_PARAM__vcc_soc": "$DB_PARAM__vcc_soc",
                    "DB_PARAM__vccaux": "$DB_PARAM__vccaux",
                    "DB_PARAM__vccaux_pmc": "$DB_PARAM__vccaux_pmc",
                    "DB_PARAM__vccaux_sysmon": "$DB_PARAM__vccaux_sysmon",
                    "DB_PARAM__vccint": "$DB_PARAM__vccint",
                    "DB_PARAM__vccint_pmc": "$DB_PARAM__vccint_pmc",
                    "updated_on": "$updated_on",
                    "RUN_HOME": "$RUN_HOME",
                    "log_dir": "$log_dir",
                }
            },
        },
        # $sort: sorts the results by updated_on field in ascending order
        {"$sort": {"updated_on": 1}},
        {
            # lookup: performs a left outer join with the testcases collection based on the _id.ref_id field, and adds a new array field testcasesObjects to the documents with the matching test cases.
            "$lookup": {
                "from": "testcases",
                "let": {"userRefId": {"$toObjectId": "$_id.ref_id"}},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$_id", "$$userRefId"]}}}],
                "as": "testcasesObjects",
            }
        },
        {
            # lookup: performs another left outer join with the regressions collection based on the _id.build_id field, and adds a new array field regression_list to the documents with the matching regressions
            "$lookup": {
                "from": "regressions",
                "let": {"build_id": "$_id.build_id"},
                "pipeline": [
                    {"$match": {"$expr": {"$eq": ["$build_id", "$$build_id"]}}}
                ],
                "as": "regression_list",
            }
        },
        # deconstructs the regression_list array field to output a separate document for each element of the array
        {"$unwind": "$regression_list"},
        {
            # lookup: performs a left outer join with the zscore collection based on the regression_list.device_dna field, and adds a new array field dna_list to the documents with the matching DNA scores
            "$lookup": {
                "from": "zscore",
                "let": {"device_dna": "$regression_list.device_dna"},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$dna", "$$device_dna"]}}}],
                "as": "dna_list",
            }
        },
        {
            # project: reshapes the documents to include only the required fields and computed fields, and applies some conditional logic to derive a new skew field based on the value of the regression_list.skew field
            "$project": {
                "run_type": "$testcasesObjects.run_type",
                "ssuite": "$testcasesObjects.ssuite",
                "suite": "$testcasesObjects.suite",
                "test": "$testcasesObjects.test_name",
                "status": "$_id.status",
                "run_time": "$_id.run_time",
                "updated_on": "$_id.updated_on",
                "build_id": "$_id.build_id",
                "corner": "$dna_list.corner",
                "device_dna": "$regression_list.device_dna",
                "voltage": {"$ifNull": ["$_id.voltage", 0]},
                "DB_PARAM__device_temp_max": "$_id.DB_PARAM__device_temp_max",
                "DB_PARAM__device_temp_min": "$_id.DB_PARAM__device_temp_min",
                "DB_PARAM__vcc_batt": "$_id.DB_PARAM__vcc_batt",
                "DB_PARAM__vcc_pmc": "$_id.DB_PARAM__vcc_pmc",
                "DB_PARAM__vcc_psfp": "$_id.DB_PARAM__vcc_psfp",
                "DB_PARAM__vcc_pslp": "$_id.DB_PARAM__vcc_pslp",
                "DB_PARAM__vcc_ram": "$_id.DB_PARAM__vcc_ram",
                "DB_PARAM__vcc_soc": "$_id.DB_PARAM__vcc_soc",
                "DB_PARAM__vccaux": "$_id.DB_PARAM__vccaux",
                "DB_PARAM__vccaux_pmc": "$_id.DB_PARAM__vccaux_pmc",
                "DB_PARAM__vccaux_sysmon": "$_id.DB_PARAM__vccaux_sysmon",
                "DB_PARAM__vccint": "$_id.DB_PARAM__vccint",
                "DB_PARAM__vccint_pmc": "$_id.DB_PARAM__vccint_pmc",
                "skew": {
                    "$cond": {
                        "if": {"$eq": ["$regression_list.skew", True]},
                        "then": "Skewed",
                        "else": "Non-Skewed",
                    }
                },
                "updated_on": "$_id.updated_on",
                "RUN_HOME": "$_id.RUN_HOME",
                "log_dir": "$_id.log_dir",
                "board": "$regression_list.board",
            }
        },
    ]
    final_query = db.regression_data.aggregate(query)

    testList = []
    for doc in final_query:
        max_temp_value = doc.get("DB_PARAM__device_temp_max")
        min_temp_value = doc.get("DB_PARAM__device_temp_min")

        # Convert values to float if they are not None
        max_temp = (
            round(float(max_temp_value), 2) if max_temp_value is not None else None
        )
        min_temp = (
            round(float(min_temp_value), 2) if min_temp_value is not None else None
        )
        testDict = {
            "Build ID": doc.get("build_id"),
            "DNA": doc.get("device_dna"),
            "Voltage": doc.get("voltage"),
            "Run Type": doc.get("run_type"),
            "Skew": doc.get("skew"),
            "Board": doc.get("board"),
            "Run Home": doc.get("RUN_HOME"),
            "Log Dir.": doc.get("log_dir"),
            "S-Suite": doc.get("ssuite"),
            "Suite": doc.get("suite"),
            "Test Name": doc.get("test"),
            "Test Result": doc.get("status"),
            "Max. Temp": max_temp,
            "Min. Temp": min_temp,
            "Run Time": doc.get("run_time"),
            "VCC_BATT": doc.get("DB_PARAM__vcc_batt"),
            "VCC_PMC": doc.get("DB_PARAM__vcc_pmc"),
            "VCC_PSFP": doc.get("DB_PARAM__vcc_psfp"),
            "VCC_PSLP": doc.get("DB_PARAM__vcc_pslp"),
            "VCC_RAM": doc.get("DB_PARAM__vcc_ram"),
            "VCC_SOC": doc.get("DB_PARAM__vcc_soc"),
            "VCCAUX": doc.get("DB_PARAM__vccaux"),
            "VCCAUX_PMC": doc.get("DB_PARAM__vccaux_pmc"),
            "VCCAUX_SYSMON": doc.get("DB_PARAM__vccaux_sysmon"),
            "VCCINT": doc.get("DB_PARAM__vccint"),
            "VCCINT_PMC": doc.get("DB_PARAM__vccint_pmc"),
            "Date/Time": doc.get("updated_on"),
        }

        testList.append(testDict)

    time_duration = calculate_time_duration(testList)
    if time_duration is not None:
        for test in testList:
            test["Test Duration"] = time_duration

    for test in testList:
        for key, value in test.items():
            if isinstance(value, list):
                test[key] = ", ".join(value)
            elif isinstance(value, str) and "[" in value and "]" in value:
                test[key] = value.replace("[", "").replace("]", "")

    return testList


def calculate_time_duration(test_list):
    min_datetime = None
    max_datetime = None

    for test in test_list:
        date_time = test.get("Date/Time")
        if date_time and isinstance(date_time, datetime):
            if min_datetime is None or date_time < min_datetime:
                min_datetime = date_time
            if max_datetime is None or date_time > max_datetime:
                max_datetime = date_time

    if min_datetime and max_datetime:
        duration = max_datetime - min_datetime

        # Calculate hours, minutes, and seconds
        hours = duration.seconds // 3600
        minutes = (duration.seconds // 60) % 60
        seconds = duration.seconds % 60

        if duration.days > 0:
            hours += duration.days * 24

        # Construct the formatted time duration string
        if hours >= 1:
            time_duration_str = f"{hours} hours, {minutes} mins, {seconds} secs"
        elif minutes >= 1:
            time_duration_str = f"{minutes} mins, {seconds} secs"
        else:
            time_duration_str = f"{seconds} secs"

        return time_duration_str
    else:
        return None


def main():
    db = MongoClient(
        "mongodb://vncmgr:vncw0rld19@xsj-pvdbvnc02:27060,xsj-pvdbvnc03:27060,xsj-pvdbvnc04:27060/?replicaSet=acapprd"
    ).vncreg
    build_id = "sival_PS-PVT_xapchar_20230113_22"
    build_id = [build_id] if type(build_id) != list else build_id

    retrieveDbData(db, build_id)


if __name__ == "__main__":
    main()
