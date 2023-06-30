import pandas as pd
import pymongo
from pymongo import MongoClient
import xlsxwriter


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
        testDict = {
            "buildID": doc["build_id"],
            "deviceDNA": doc["device_dna"],
            "voltage": doc["voltage"],
            "runType": doc["run_type"],
            "skew": doc["skew"],
            "board": doc["board"],
            "run_home": doc["RUN_HOME"],
            "log_dir": doc["log_dir"],
            "ssuite": doc["ssuite"],
            "suite": doc["suite"],
            "testName": doc["test"],
            "testResult": doc["status"],
            "maxTemp": doc["DB_PARAM__device_temp_max"],
            "minTemp": doc["DB_PARAM__device_temp_min"],
            "runTime": doc["run_time"],
            "vcc_batt": doc["DB_PARAM__vcc_batt"],
            "vcc_pmc": doc["DB_PARAM__vcc_pmc"],
            "vcc_psfp": doc["DB_PARAM__vcc_psfp"],
            "vcc_pslp": doc["DB_PARAM__vcc_pslp"],
            "vcc_ram": doc["DB_PARAM__vcc_ram"],
            "vcc_soc": doc["DB_PARAM__vcc_soc"],
            "vccaux": doc["DB_PARAM__vccaux"],
            "vccaux_pmc": doc["DB_PARAM__vccaux_pmc"],
            "vccaux_sysmon": doc["DB_PARAM__vccaux_sysmon"],
            "vccint": doc["DB_PARAM__vccint"],
            "vccint_pmc": doc["DB_PARAM__vccint_pmc"],
            "updated_on": doc["updated_on"],
        }
        testList.append(testDict)

    for test in testList:
        for key, value in test.items():
            if isinstance(value, list):
                test[key] = ", ".join(value)
            elif isinstance(value, str) and "[" in value and "]" in value:
                test[key] = value.replace("[", "").replace("]", "")

    print(testList)

    return testList


def main():
    db = MongoClient(
        "mongodb://vncmgr:vncw0rld19@xsj-pvdbvnc02:27060,xsj-pvdbvnc03:27060,xsj-pvdbvnc04:27060/?replicaSet=acapprd"
    ).vncreg
    build_id = "sival_PS-PVT_xapchar_20230209_18"
    build_id = [build_id] if type(build_id) != list else build_id

    retrieveDbData(db, build_id)


if __name__ == "__main__":
    main()
