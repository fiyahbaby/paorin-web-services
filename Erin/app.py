import json
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import pytz
from werkzeug.security import check_password_hash
import socket
from datetime import datetime, timezone
from pytz import timezone
from flask_migrate import Migrate
from pymongo import MongoClient
from mongodb_data_retrieval import retrieveDbData
import itertools
from sqlalchemy.exc import IntegrityError

app = Flask(__name__)
app.secret_key = b"mySecretKey"
CORS(app, origins=["*"])

app.config[
    "SQLALCHEMY_DATABASE_URI"
] = "sqlite:///C:/Users/paolodel/Documents/GitHub/paorin-web-services/Erin/sqlite/Databases/testdb3"
db = SQLAlchemy(app)
migrate = Migrate(app, db)

mongoDB = MongoClient(
    "mongodb://vncmgr:vncw0rld19@xsj-pvdbvnc02:27060,xsj-pvdbvnc03:27060,xsj-pvdbvnc04:27060/?replicaSet=acapprd"
).vncreg


class Projects(db.Model):
    __tablename__ = "projects"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    device_name = db.Column(db.String(255))
    revision_id = db.Column(db.String(255))
    test_type_id = db.Column(db.String(255))
    block_id = db.Column(db.String(255))
    date_created = db.Column(db.String(255))

    __table_args__ = (
        db.UniqueConstraint(
            "device_name",
            "revision_id",
            "test_type_id",
            "block_id",
            name="_unique_projects",
        ),
    )

    def __str__(self):
        return self.device_name


class Voltages(db.Model):
    __tablename__ = "voltages"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255))
    value = db.Column(db.Float)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))

    __table_args__ = (
        db.UniqueConstraint("name", "project_id", name="_unique_voltages"),
    )

    def __str__(self):
        return self.name


class Temperatures(db.Model):
    __tablename__ = "temperatures"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255))
    value = db.Column(db.Float)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))

    __table_args__ = (
        db.UniqueConstraint("name", "project_id", name="_unique_temperatures"),
    )

    def __str__(self):
        return str(self.value)


class TestList(db.Model):
    __tablename__ = "tests"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    dc = db.Column(db.String(255), nullable=False)
    s_suite = db.Column(db.String(255), nullable=False)
    suite = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    voltage_id = db.Column(db.Integer, db.ForeignKey("voltages.id"), nullable=False)
    temperature_id = db.Column(
        db.Integer, db.ForeignKey("temperatures.id"), nullable=False
    )

    __table_args__ = (
        db.UniqueConstraint(
            "dc",
            "s_suite",
            "suite",
            "name",
            "project_id",
            "voltage_id",
            "temperature_id",
            name="_unique_test_list",
        ),
    )

    __table_args__ += (db.Index("ix_test_list_name", "name"),)

    def __str__(self):
        return self.name


class Units(db.Model):
    __tablename__ = "units"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    process_corner = db.Column(db.String(255))
    two_d_name = db.Column(db.String(255))
    device_dna = db.Column(db.String(255))
    remarks = db.Column(db.String(255))
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))

    __table_args__ = (
        db.UniqueConstraint(
            "process_corner", "two_d_name", "project_id", name="_unique_units"
        ),
    )

    def __str__(self):
        return self.two_d_name


class BuildIDs(db.Model):
    __tablename__ = "build_ids"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date_created = db.Column(
        db.String(255),
        default=lambda: datetime.now(timezone("Asia/Singapore")).strftime(
            "%Y-%m-%d %H:%M:%S"
        ),
    )
    voltage_id = db.Column(db.Integer, db.ForeignKey("voltages.id"))
    temperature_id = db.Column(db.Integer, db.ForeignKey("temperatures.id"))
    test_id = db.Column(db.Integer, db.ForeignKey("tests.id"))
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))
    unit_id = db.Column(db.Integer, db.ForeignKey("units.id"))

    __table_args__ = (
        db.UniqueConstraint(
            "voltage_id",
            "temperature_id",
            "unit_id",
            "test_id",
            "project_id",
            name="_unique_build_ids",
        ),
    )

    def __str__(self):
        return str(self.id)


class TestInstances(db.Model):
    __tablename__ = "test_instances"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    unit_id = db.Column(db.Integer, db.ForeignKey("units.id"), nullable=False)
    voltage_id = db.Column(db.Integer, db.ForeignKey("voltages.id"), nullable=False)
    temperature_id = db.Column(
        db.Integer, db.ForeignKey("temperatures.id"), nullable=False
    )
    test_id = db.Column(db.Integer, db.ForeignKey("build_ids.id"), nullable=False)
    s_suite = db.Column(db.String(255), nullable=False)
    suite = db.Column(db.String(255), nullable=False)
    test_name = db.Column(db.String(255), nullable=False)
    result = db.Column(db.String(255))
    max_temp = db.Column(db.Float)
    min_temp = db.Column(db.Float)
    run_time = db.Column(db.Integer)
    vcc_int = db.Column(db.Float)
    vcc_pmc = db.Column(db.Float)
    vcc_psfp = db.Column(db.Float)
    vcc_ram = db.Column(db.Float)
    vcc_soc = db.Column(db.Float)
    vcc_batt = db.Column(db.Float)
    vcc_aux = db.Column(db.Float)
    vccaux_pmc = db.Column(db.Float)
    vccaux_sysmon = db.Column(db.Float)

    __table_args__ = (
        db.UniqueConstraint(
            "project_id",
            "unit_id",
            "voltage_id",
            "temperature_id",
            "test_id",
            "s_suite",
            "suite",
            "test_name",
            name="_unique_test_instances",
        ),
    )

    def __str__(self):
        return str(self.id)


hostname = socket.gethostname()
ip_address = socket.gethostbyname(hostname)
print(f"Host IP address: {ip_address}")
host_ip = ip_address
port = 5000


@app.route("/api/ip", methods=["GET"])
def get_ip():
    return jsonify(ip=ip_address)


@app.route("/api/accounts", methods=["POST"])
def get_account():
    data = request.get_json()
    with open("assets/backend-data/account.json", "r") as account:
        accounts = json.load(account)
        for acc in accounts:
            if (
                data["username"] == acc["username"]
                and data["password"] == acc["password"]
            ):
                userType = data["type"]
    return jsonify(userType)


@app.route("/api/login", methods=["POST"])
def login():
    flag = False
    data = request.get_json()
    with open("assets/backend-data/account.json", "r") as account:
        accounts = json.load(account)
        for acc in accounts:
            if (
                data["username"] == acc["username"]
                and data["password"] == acc["password"]
            ):
                session["user_id"] = 1
                return {
                    "type": "success",
                    "message": "Logged in successful",
                    "userType": acc["type"],
                }
            flag = True
        if flag:
            return {"type": "error", "message": "Invalid username or password"}


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return {"message": "Logout successful"}


@app.route("/api/projects", methods=["GET"])
def get_projects():
    projects = Projects.query.all()
    projects_list = []
    for project in projects:
        project_dict = {
            "id": project.id,
            "device_name": project.device_name,
            "revision_id": project.revision_id,
            "test_type_id": project.test_type_id,
            "block_id": project.block_id,
            "date_created": project.date_created,
        }
        projects_list.append(project_dict)
    return jsonify(projects_list)


@app.route("/api/data", methods=["GET"])
def get_data():
    project_id = request.args.get("projectId")
    project = Projects.query.filter_by(id=project_id).first()
    project2 = Projects.query.filter_by(id=project_id).all()
    project_list = [
        {
            "device_name": p.device_name,
            "revision_id": p.revision_id,
            "test_type_id": p.test_type_id,
            "block_id": p.block_id,
            "date_created": p.date_created,
        }
        for p in project2
    ]

    if not project:
        return jsonify({"error": "Project not found"}), 404

    voltages = Voltages.query.filter_by(project_id=project.id).all()
    voltage_list = [{"id": v.id, "name": v.name, "value": v.value} for v in voltages]
    temperatures = Temperatures.query.filter_by(project_id=project.id).all()
    temperature_list = [
        {"id": t.id, "name": t.name, "value": t.value} for t in temperatures
    ]
    units = Units.query.filter_by(project_id=project.id).all()
    unit_list = [
        {
            "id": u.id,
            "process_corner": u.process_corner,
            "two_d_name": u.two_d_name,
            "device_dna": u.device_dna,
        }
        for u in units
    ]
    combined_dict = {
        "project": project_list,
        "voltages": voltage_list,
        "temperatures": temperature_list,
        "units": unit_list,
    }
    return jsonify(combined_dict)


@app.route("/api/createProjects", methods=["POST"])
def create_project():
    project_data = request.json
    project_name = project_data.get("project_name")
    revision_id = project_data.get("revision_name")
    test_type_id = project_data.get("test_type_name")
    block_id = project_data.get("block_name")
    date_created = datetime.now(pytz.timezone("Asia/Singapore")).date()

    existing_project = Projects.query.filter_by(
        device_name=project_name,
        revision_id=revision_id,
        test_type_id=test_type_id,
        block_id=block_id,
    ).first()
    if existing_project:
        return jsonify({"message": "Project already exists"})

    project = Projects(
        device_name=project_name,
        revision_id=revision_id,
        test_type_id=test_type_id,
        block_id=block_id,
        date_created=date_created,
    )
    db.session.add(project)
    db.session.commit()

    return jsonify({"message": "Project created successfully"})


@app.route("/api/addProjectParam", methods=["POST"])
def add_project_param():
    project_data = request.json
    project_id = project_data.get("project_id")
    voltages = project_data.get("voltages")
    temperatures = project_data.get("temperatures")
    units = project_data.get("units")
    existing_project = Projects.query.get(project_id)

    if existing_project:
        for voltage in voltages:
            if voltage["name"] and voltage["value"]:
                v = Voltages(
                    name=voltage["name"], value=voltage["value"], project_id=project_id
                )
                db.session.add(v)

        for temperature in temperatures:
            if temperature["name"] and temperature["value"]:
                t = Temperatures(
                    name=temperature["name"],
                    value=temperature["value"],
                    project_id=project_id,
                )
                db.session.add(t)

        for unit in units:
            if unit["processCorner"] and unit["barcode"]:
                u = Units(
                    process_corner=unit["processCorner"],
                    two_d_name=unit["barcode"],
                    device_dna=unit["deviceDNA"],
                    project_id=project_id,
                )
                db.session.add(u)

        db.session.commit()
        return {"message": "Project data updated successfully"}
    else:
        return {"message": "Project not found"}


@app.route("/api/updateProjectData", methods=["PUT"])
def update_project_data():
    modified_data = request.json
    voltages = modified_data.get("voltages")
    temperatures = modified_data.get("temperatures")
    units = modified_data.get("units")
    projects = modified_data.get("project")

    for voltage in voltages:
        voltage_id = voltage.get("id")
        name = voltage.get("name")
        value = voltage.get("value")
        updated_voltage = Voltages.query.get(voltage_id)
        if updated_voltage and (
            updated_voltage.name != name or updated_voltage.value != value
        ):
            updated_voltage.name = name
            updated_voltage.value = value

    for temperature in temperatures:
        temperature_id = temperature.get("id")
        name = temperature.get("name")
        value = temperature.get("value")

        updated_temperature = Temperatures.query.get(temperature_id)
        if updated_temperature and (
            updated_temperature.name != name or updated_temperature.value != value
        ):
            updated_temperature.name = name
            updated_temperature.value = value

    for unit in units:
        unit_id = unit.get("id")
        process_corner = unit.get("processCorner")
        barcode = unit.get("barCode")
        device_dna = unit.get("deviceDNA")
        updated_unit = Units.query.get(unit_id)
        if updated_unit and (
            updated_unit.process_corner != process_corner
            or updated_unit.two_d_name != barcode
            or updated_unit.device_dna != device_dna
        ):
            updated_unit.process_corner = process_corner
            updated_unit.two_d_name = barcode
            updated_unit.device_dna = device_dna

    for project in projects:
        project_id = project["id"]
        device_name = project["name"]
        revision_id = project["revisionId"]
        test_type_id = project["testTypeId"]
        block_id = project["blockId"]
        date_created = project["dateCreated"]

        updated_project = Projects.query.get(project_id)
        if updated_project and (
            updated_project.device_name != device_name
            or updated_project.revision_id != revision_id
            or updated_project.test_type_id != test_type_id
            or updated_project.block_id != block_id
            or updated_project.date_created != date_created
        ):
            updated_project.device_name = device_name
            updated_project.revision_id = revision_id
            updated_project.test_type_id = test_type_id
            updated_project.block_id = block_id
            updated_project.date_created = date_created

    db.session.commit()
    return jsonify({"success": True})


@app.route("/api/deleteProject/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    project = Projects.query.get(project_id)

    if not project:
        return jsonify({"error": "Project not found"})

    Voltages.query.filter_by(project_id=project_id).delete()
    Temperatures.query.filter_by(project_id=project_id).delete()
    Units.query.filter_by(project_id=project_id).delete()
    TestList.query.filter_by(project_id=project_id).delete()
    BuildIDs.query.filter_by(project_id=project_id).delete()
    TestInstances.query.filter_by(project_id=project_id).delete()

    db.session.delete(project)
    db.session.commit()

    return jsonify({"message": "Project deleted successfully"})


@app.route("/api/retrieveDbData/<build_id>", methods=["GET"])
def retrieve_data(build_id):
    if not build_id:
        return jsonify({"message": "Missing 'buildID' parameter"})

    try:
        result = retrieveDbData(mongoDB, build_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"message": "No data found."})


@app.route("/api/processTempLimit", methods=["POST"])
def process_temp_limit():
    try:
        build_data = request.json
        temp = process_ref_temp(build_data)
        return jsonify(temp)
    except Exception as e:
        error_message = "Error processing build data: {}".format(str(e))
        return jsonify({"error": error_message})


def process_ref_temp(data):
    max_temp = float("-inf")
    min_temp = float("inf")

    for item in data:
        if "Max. Temp" in item and "Min. Temp" in item:
            max_temp_item = item["Max. Temp"]
            min_temp_item = item["Min. Temp"]

            if max_temp_item is not None:
                max_temp_item = float(max_temp_item)
                if max_temp_item > max_temp:
                    max_temp = max_temp_item

            if min_temp_item is not None:
                min_temp_item = float(min_temp_item)
                if min_temp_item < min_temp:
                    min_temp = min_temp_item

    # Check if any valid temperatures were found
    if max_temp == float("-inf") or min_temp == float("inf"):
        return {"Max. Temp": None, "Min. Temp": None}

    return {"Max. Temp": max_temp, "Min. Temp": min_temp}


@app.route("/api/addTestList", methods=["POST"])
def addTestList():
    file_content = request.json
    if file_content:
        file_content = remove_carriage_return(file_content)
        processed_tests, project_details = process_test_list(file_content)

        project_id = project_details.get("id")
        project = Projects.query.filter_by(id=project_id).first()
        if not project:
            return jsonify({"error": "Project not found"})

        error_set = set()

        processed_tests = processed_tests[1:]
        for test in processed_tests:
            voltage_name = test["voltage"]
            temperature_name = test["temperature"]

            # Fetch the voltage and temperature objects by searching for the exact matching names
            voltage = Voltages.query.filter_by(
                name=voltage_name, project_id=project_id
            ).first()
            temperature = Temperatures.query.filter_by(
                value=temperature_name, project_id=project_id
            ).first()

            if not voltage:
                error_set.add(f"Invalid voltage: {voltage_name}")
            if not temperature:
                error_set.add(f"Invalid temperature: {temperature_name}")

        errors = list(error_set)

        if errors:
            return jsonify({"errors": errors})
        else:
            # All data is valid, now commit to the database
            for test in processed_tests:
                voltage_name = test["voltage"]
                temperature_name = test["temperature"]
                voltage = Voltages.query.filter_by(
                    name=voltage_name, project_id=project_id
                ).first()
                temperature = Temperatures.query.filter_by(
                    value=temperature_name, project_id=project_id
                ).first()

                new_test = TestList(
                    dc=test["dc"],
                    s_suite=test["ssuite"],
                    suite=test["suite"],
                    name=test["Testname"],
                    project_id=project_id,
                    voltage_id=voltage.id if voltage else None,
                    temperature_id=temperature.id if temperature else None,
                )
                db.session.add(new_test)

            db.session.commit()
            return {"success": "File content uploaded without errors."}
    else:
        return {"error": "No file content uploaded."}


def remove_carriage_return(data_list):
    processed_data = [
        {
            key: value.rstrip("\r") if isinstance(value, str) else value
            for key, value in item.items()
        }
        for item in data_list
    ]
    processed_data = [item for item in processed_data if any(item.values())]
    return processed_data


def process_test_list(test_list):
    processed_tests = []
    project_details = {}

    for test in test_list:
        if "id" in test:
            project_details = test
        else:
            voltages = test.get("voltage", "").split("/")
            temperatures = test.get("temperature", "").split("/")

            voltage_temperature_combinations = list(
                itertools.product(voltages, temperatures)
            )

            for voltage, temperature in voltage_temperature_combinations:
                processed_test = {
                    "dc": test["dc"],
                    "voltage": voltage,
                    "temperature": temperature,
                    "ssuite": test["ssuite"],
                    "suite": test["suite"],
                    "Testname": test["Testname"],
                }
                processed_tests.append(processed_test)

    return processed_tests, project_details


@app.route("/api/processed_tests", methods=["GET"])
def get_processed_tests():
    project_id = request.args.get("project_id")

    test_entries = TestList.query.filter_by(project_id=project_id).all()

    processed_data = {}
    for entry in test_entries:
        # Combine the test name, voltage, and temperature into a single string key
        voltage = Voltages.query.get(entry.voltage_id)
        temperature = Temperatures.query.get(entry.temperature_id)
        key = f"{entry.dc}/{entry.s_suite}/{entry.suite}/{entry.name}"

        # Check if the key is already in the processed_data dictionary
        if key in processed_data:
            processed_data[key]["voltage"].add(voltage.name)
            processed_data[key]["temperature"].add(temperature.value)
        else:
            processed_data[key] = {
                "dc": entry.dc,
                "s_suite": entry.s_suite,
                "suite": entry.suite,
                "Testname": entry.name,
                "voltage": {voltage.name},
                "temperature": {temperature.value},
            }

    result = [
        {
            "dc": entry["dc"],
            "s_suite": entry["s_suite"],
            "suite": entry["suite"],
            "Testname": entry["Testname"],
            "voltage": ", ".join(entry["voltage"]),
            "temperature": ", ".join(map(str, entry["temperature"])),
        }
        for entry in processed_data.values()
    ]

    return jsonify(result)


@app.route("/api/getVoltagesAndTemperatures", methods=["GET"])
def get_voltages_and_temperatures():
    project_id = request.args.get("projectId")
    if not project_id:
        return jsonify({"error": "Missing 'projectId' parameter"})

    project = Projects.query.filter_by(id=project_id).first()

    if not project:
        return jsonify({"error": "Project not found"})

    voltages = Voltages.query.filter_by(project_id=project_id).all()
    temperature_list = Temperatures.query.filter_by(project_id=project_id).all()
    units = Units.query.filter_by(project_id=project_id).all()

    # Convert the SQLAlchemy objects to dictionaries
    voltages_list = [
        {"id": voltage.id, "name": voltage.name, "value": voltage.value}
        for voltage in voltages
    ]
    temperatures_list = [
        {"id": temperature.id, "name": temperature.name, "value": temperature.value}
        for temperature in temperature_list
    ]

    unit_list = [
        {
            "id": unit.id,
            "process_corner": unit.process_corner,
            "two_d_name": unit.two_d_name,
        }
        for unit in units
    ]

    result = {
        "project": {
            "id": project.id,
            "device_name": project.device_name,
            "revision_id": project.revision_id,
            "test_type_id": project.test_type_id,
            "block_id": project.block_id,
            "date_created": project.date_created,
        },
        "voltages": voltages_list,
        "temperatures": temperatures_list,
        "units": unit_list,
    }

    return jsonify(result)


@app.route("/api/addToProject", methods=["POST"])
def add_to_project():
    data = request.json

    build_data = data.get("buildData", [])
    selected_project = data.get("project", {})
    selected_voltage = data.get("voltage", {})
    selected_temperature = data.get("temperature", {})
    selected_unit = data.get("unit", {})
    project_id = selected_project.get("id")
    voltage_id = selected_voltage.get("id")
    temperature_id = selected_temperature.get("id")
    unit_id = selected_unit.get("id")

    updated_tests = 0
    new_tests = 0
    for test_data in build_data:
        existing_test_instance = TestInstances.query.filter_by(
            project_id=project_id,
            unit_id=unit_id,
            voltage_id=voltage_id,
            temperature_id=temperature_id,
            test_id=test_data["Build ID"],
            s_suite=test_data["S-Suite"],
            suite=test_data["Suite"],
            test_name=test_data["Test Name"],
        ).first()

        if existing_test_instance:
            # If the entry exists, update the values with the new data
            existing_test_instance.project_id = test_data["Test Result"]
            existing_test_instance.result = test_data["Test Result"]
            existing_test_instance.result = test_data["Test Result"]
            existing_test_instance.result = test_data["Test Result"]
            existing_test_instance.max_temp = test_data["Max. Temp"]
            existing_test_instance.min_temp = test_data["Min. Temp"]
            existing_test_instance.run_time = test_data["Run Time"]

            # Check and assign float values, handling None and 0 cases
            existing_test_instance.vcc_int = (
                float(test_data["VCCINT"])
                if test_data["VCCINT"] not in (None, 0)
                else None
            )
            existing_test_instance.vcc_pmc = (
                float(test_data["VCC_PMC"])
                if test_data["VCC_PMC"] not in (None, 0)
                else None
            )
            existing_test_instance.vcc_psfp = (
                float(test_data["VCC_PSFP"])
                if test_data["VCC_PSFP"] not in (None, 0)
                else None
            )
            existing_test_instance.vcc_ram = (
                float(test_data["VCC_RAM"])
                if test_data["VCC_RAM"] not in (None, 0)
                else None
            )
            existing_test_instance.vcc_soc = (
                float(test_data["VCC_SOC"])
                if test_data["VCC_SOC"] not in (None, 0)
                else None
            )
            existing_test_instance.vcc_batt = (
                float(test_data["VCC_BATT"])
                if test_data["VCC_BATT"] not in (None, 0)
                else None
            )
            existing_test_instance.vcc_aux = (
                float(test_data["VCCAUX"])
                if test_data["VCCAUX"] not in (None, 0)
                else None
            )
            existing_test_instance.vccaux_pmc = (
                float(test_data["VCCAUX_PMC"])
                if test_data["VCCAUX_PMC"] not in (None, 0)
                else None
            )
            existing_test_instance.vccaux_sysmon = (
                float(test_data["VCCAUX_SYSMON"])
                if test_data["VCCAUX_SYSMON"] not in (None, 0)
                else None
            )

            updated_tests += 1
        else:
            # If the entry does not exist, create a new one
            test_instance = TestInstances(
                project_id=project_id,
                unit_id=unit_id,
                voltage_id=voltage_id,
                temperature_id=temperature_id,
                test_id=test_data["Build ID"],
                s_suite=test_data["S-Suite"],
                suite=test_data["Suite"],
                test_name=test_data["Test Name"],
                result=test_data["Test Result"],
                max_temp=test_data["Max. Temp"],
                min_temp=test_data["Min. Temp"],
                run_time=test_data["Run Time"],
                vcc_int=float(test_data["VCCINT"])
                if test_data["VCCINT"] not in (None, 0)
                else None,
                vcc_pmc=float(test_data["VCC_PMC"])
                if test_data["VCC_PMC"] not in (None, 0)
                else None,
                vcc_psfp=float(test_data["VCC_PSFP"])
                if test_data["VCC_PSFP"] not in (None, 0)
                else None,
                vcc_ram=float(test_data["VCC_RAM"])
                if test_data["VCC_RAM"] not in (None, 0)
                else None,
                vcc_soc=float(test_data["VCC_SOC"])
                if test_data["VCC_SOC"] not in (None, 0)
                else None,
                vcc_batt=float(test_data["VCC_BATT"])
                if test_data["VCC_BATT"] not in (None, 0)
                else None,
                vcc_aux=float(test_data["VCCAUX"])
                if test_data["VCCAUX"] not in (None, 0)
                else None,
                vccaux_pmc=float(test_data["VCCAUX_PMC"])
                if test_data["VCCAUX_PMC"] not in (None, 0)
                else None,
                vccaux_sysmon=float(test_data["VCCAUX_SYSMON"])
                if test_data["VCCAUX_SYSMON"] not in (None, 0)
                else None,
            )
            db.session.add(test_instance)
            new_tests += 1

    buildID = BuildIDs(
        project_id=project_id,
        unit_id=unit_id,
        voltage_id=voltage_id,
        temperature_id=temperature_id,
        test_id=build_data[0]["Build ID"],
        date_created=datetime.now(timezone("Asia/Singapore")).strftime(
            "%Y-%m-%d %H:%M:%S"
        ),
    )

    try:
        db.session.add(buildID)
        db.session.commit()
        message = f"{updated_tests} existing tests updated, {new_tests} new tests added, and BuildID entry added."
    except IntegrityError:
        db.session.rollback()
        message = f"{updated_tests} existing tests updated, {new_tests} new tests added, but BuildID entry already exists."

    return jsonify({"message": message})


@app.route("/api/searchBuildID/<string:build_id>", methods=["GET"])
def search_build_id(build_id):
    test_instances = TestInstances.query.filter(TestInstances.test_id == build_id).all()
    build_id = BuildIDs.query.filter_by(test_id=build_id).first()

    if not test_instances and not build_id:
        return jsonify({"message": "No data found for the given build ID"})

    # Convert the SQLAlchemy objects to dictionaries
    test_instances_list = [
        {
            "id": instance.id,
            "project_id": instance.project_id,
            "unit_id": instance.unit_id,
            "voltage_id": instance.voltage_id,
            "temperature_id": instance.temperature_id,
            "test_id": instance.test_id,
            "s_suite": instance.s_suite,
            "suite": instance.suite,
            "test_name": instance.test_name,
            "result": instance.result,
            "max_temp": instance.max_temp,
            "min_temp": instance.min_temp,
            "run_time": instance.run_time,
            "vcc_int": instance.vcc_int,
            "vcc_pmc": instance.vcc_pmc,
            "vcc_psfp": instance.vcc_psfp,
            "vcc_ram": instance.vcc_ram,
            "vcc_soc": instance.vcc_soc,
            "vcc_batt": instance.vcc_batt,
            "vcc_aux": instance.vcc_aux,
            "vccaux_pmc": instance.vccaux_pmc,
            "vccaux_sysmon": instance.vccaux_sysmon,
        }
        for instance in test_instances
    ]

    build_id_data = {}
    if build_id:
        project = Projects.query.get(build_id.project_id)
        voltage = Voltages.query.get(build_id.voltage_id)
        temperature = Temperatures.query.get(build_id.temperature_id)
        unit = Units.query.get(build_id.unit_id)

    build_id_data["project"] = {
        "device_name": project.device_name,
        "revision_id": project.revision_id,
        "test_type_id": project.test_type_id,
        "block_id": project.block_id,
        "date_created": project.date_created,
    }

    build_id_data["voltage"] = {
        "name": voltage.name,
        "value": voltage.value,
    }

    build_id_data["temperature"] = {
        "name": temperature.name,
        "value": temperature.value,
    }

    build_id_data["unit"] = {
        "process_corner": unit.process_corner,
        "two_d_name": unit.two_d_name,
    }

    return jsonify(
        {"test_instances": test_instances_list, "build_id_data": build_id_data}
    )


@app.route("/api/deleteTestData/<string:test_id>", methods=["DELETE"])
def delete_test_data(test_id):
    try:
        test_instances = TestInstances.query.filter(
            TestInstances.test_id == test_id
        ).all()
        for instance in test_instances:
            db.session.delete(instance)

        build_id = BuildIDs.query.filter_by(test_id=test_id).first()
        if build_id:
            db.session.delete(build_id)

        db.session.commit()
        return jsonify({"message": "Data deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to delete data"})


@app.route("/api/voltageVsBlockData", methods=["GET"])
def get_voltage_vs_block():
    project_id = request.args.get("project_id")
    if not project_id:
        jsonify({"message": "No project ID provided."})

    try:
        test_instances = TestInstances.query.filter(
            TestInstances.project_id == project_id
        ).all()

        voltage_test_counts = calculate_total_test_cases(project_id)

        voltage_results = {}
        voltage_list = Voltages.query.filter(Voltages.project_id == project_id).all()

        for voltage in voltage_list:
            voltage_name = voltage.name

            result_map = {
                "PASS": 0,
                "FAIL": 0,
                "NOT-RUN": voltage_test_counts[voltage_name],
            }
            for test in test_instances:
                if test.voltage_id == voltage.id:
                    if test.result == "PASS":
                        result_map["PASS"] += 1
                        result_map["NOT-RUN"] -= 1
                    elif test.result == "FAIL":
                        result_map["FAIL"] += 1
                        result_map["NOT-RUN"] -= 1

            total_tests = sum(result_map.values())
            passing_rate = (
                (result_map["PASS"] / total_tests) * 100 if total_tests > 0 else 0
            )
            failing_rate = (
                (result_map["FAIL"] / total_tests) * 100 if total_tests > 0 else 0
            )
            not_run = (
                (result_map["NOT-RUN"] / total_tests) * 100 if total_tests > 0 else 0
            )
            result_map["PASSING_RATE"] = round(passing_rate, 2)
            result_map["FAILING_RATE"] = round(failing_rate, 2)
            result_map["NOT_RUN"] = round(not_run, 2)

            voltage_results[voltage_name] = result_map

        return jsonify(voltage_results)

    except Exception as e:
        return jsonify({"message": "Failed to fetch data"})


@app.route("/api/getBlockPercentages", methods=["GET"])
def get_block_percentages():
    project_id = request.args.get("project_id")
    if not project_id:
        jsonify({"message": "No project ID provided."})

    try:
        test_instances = TestInstances.query.filter(
            TestInstances.project_id == project_id
        ).all()

        voltage_test_counts = calculate_total_test_cases(project_id)

        passing_data = {}
        failing_data = {}
        not_run_data = {}
        voltage_list = Voltages.query.filter(Voltages.project_id == project_id).all()

        for voltage in voltage_list:
            voltage_name = voltage.name

            result_map = {
                "PASS": 0,
                "FAIL": 0,
                "NOT-RUN": voltage_test_counts[voltage_name],
            }
            for test in test_instances:
                if test.voltage_id == voltage.id:
                    if test.result == "PASS":
                        result_map["PASS"] += 1
                        result_map["NOT-RUN"] -= 1
                    elif test.result == "FAIL":
                        result_map["FAIL"] += 1
                        result_map["NOT-RUN"] -= 1

            total_tests = sum(result_map.values())
            passing_rate = (
                (result_map["PASS"] / total_tests) * 100 if total_tests > 0 else 0
            )
            failing_rate = (
                (result_map["FAIL"] / total_tests) * 100 if total_tests > 0 else 0
            )
            not_run = (
                (result_map["NOT-RUN"] / total_tests) * 100 if total_tests > 0 else 0
            )
            passing_data[voltage_name] = round(passing_rate, 2)
            failing_data[voltage_name] = round(failing_rate, 2)
            not_run_data[voltage_name] = round(not_run, 2)

        response_data = {
            "passing_data": passing_data,
            "failing_data": failing_data,
            "not_run_data": not_run_data,
        }

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"message": "Failed to fetch data"})


def calculate_total_test_cases(project_id):
    unit_count = Units.query.filter(Units.project_id == project_id).count()
    voltage_test_counts = {}

    voltage_list = Voltages.query.filter(Voltages.project_id == project_id).all()
    for voltage in voltage_list:
        voltage_id = voltage.id
        voltage_name = voltage.name

        voltage_test_count = TestList.query.filter(
            TestList.voltage_id == voltage_id
        ).count()
        total_test_count = voltage_test_count * unit_count
        voltage_test_counts[voltage_name] = total_test_count

    return voltage_test_counts


def calculate_total_test_cases2(project_id):
    unit_list = Units.query.filter(Units.project_id == project_id).all()
    voltage_list = Voltages.query.filter(Voltages.project_id == project_id).all()

    voltage_test_counts = {}

    for voltage in voltage_list:
        voltage_id = voltage.id
        voltage_name = voltage.name

        test_list = TestList.query.filter(TestList.voltage_id == voltage_id).all()
        voltage_test_count = len(test_list)
        total_test_count = voltage_test_count
        voltage_test_counts[voltage_name] = total_test_count

    return voltage_test_counts


@app.route("/api/get_test_statistics", methods=["GET"])
def get_test_statistics():
    project_id = request.args.get("project_id")
    if not project_id:
        jsonify({"message": "No project ID provided."})
    try:
        unit_count = Units.query.filter(Units.project_id == project_id).count()
        total_test_count = (
            TestList.query.filter_by(project_id=project_id).count()
        ) * unit_count
        total_test_instance_count = TestInstances.query.filter_by(
            project_id=project_id
        ).count()

        total_pass_count = TestInstances.query.filter_by(
            project_id=project_id, result="PASS"
        ).count()
        total_fail_count = TestInstances.query.filter_by(
            project_id=project_id, result="FAIL"
        ).count()
        total_not_run_count = total_test_count - total_pass_count - total_fail_count

        response = {
            "total_test_count": total_test_count,
            "total_tests_run_count": total_test_instance_count,
            "total_pass_count": total_pass_count,
            "total_fail_count": total_fail_count,
            "total_not_run_count": total_not_run_count,
            "project_progress": round((total_pass_count / total_test_count) * 100, 2),
            "project_fail_rate": round((total_fail_count / total_test_count) * 100, 2),
            "project_not_run_rate": round(
                (total_not_run_count / total_test_count) * 100, 2
            ),
        }
        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/api/voltageVsCornerData", methods=["GET"])
def get_voltage_vs_corner():
    project_id = request.args.get("project_id")
    if not project_id:
        jsonify({"message": "No project ID provided."})

    try:
        test_instances = TestInstances.query.filter(
            TestInstances.project_id == project_id
        ).all()

        voltage_test_counts = calculate_total_test_cases2(project_id)

        # Retrieve all unique process corners available for the project
        units = Units.query.filter(Units.project_id == project_id).all()
        unique_corners = set(unit.process_corner for unit in units)

        voltage_vs_corner_results = {}
        for corner_name in unique_corners:
            voltage_vs_corner_results[corner_name] = {}
            total_tests_for_corner = 0
            total_passing_tests_for_corner = 0
            total_failing_tests_for_corner = 0
            total_not_run_tests_for_corner = 0

            voltage_list = Voltages.query.filter(
                Voltages.project_id == project_id
            ).all()

            unit_count = Units.query.filter(
                Units.project_id == project_id, Units.process_corner == corner_name
            ).count()

            for voltage in voltage_list:
                voltage_name = voltage.name

                result_map = {
                    "PASS": 0,
                    "FAIL": 0,
                    "NOT-RUN": (voltage_test_counts[voltage_name]) * unit_count,
                }

                for test in test_instances:
                    # Check if the unit belongs to the current corner
                    unit = Units.query.get(test.unit_id)
                    if (
                        unit.process_corner == corner_name
                        and test.voltage_id == voltage.id
                    ):
                        if test.result == "PASS":
                            result_map["PASS"] += 1
                            result_map["NOT-RUN"] -= 1
                        elif test.result == "FAIL":
                            result_map["FAIL"] += 1
                            result_map["NOT-RUN"] -= 1

                total_tests = sum(result_map.values())
                total_tests_for_corner += total_tests
                total_passing_tests_for_corner += result_map[
                    "PASS"
                ]  # Increment passing tests count for the corner
                total_failing_tests_for_corner += result_map[
                    "FAIL"
                ]  # Increment failing tests count for the corner
                total_not_run_tests_for_corner += result_map[
                    "NOT-RUN"
                ]  # Increment not_run tests count for the corner

                passing_rate = (
                    (result_map["PASS"] / total_tests) * 100 if total_tests > 0 else 0
                )
                failing_rate = (
                    (result_map["FAIL"] / total_tests) * 100 if total_tests > 0 else 0
                )
                not_run = (
                    (result_map["NOT-RUN"] / total_tests) * 100
                    if total_tests > 0
                    else 0
                )
                result_map["PASSING_RATE"] = round(passing_rate, 2)
                result_map["FAILING_RATE"] = round(failing_rate, 2)
                result_map["NOT_RUN"] = round(not_run, 2)

                voltage_vs_corner_results[corner_name][voltage_name] = result_map

            total_passing_percentage = (
                (total_passing_tests_for_corner / total_tests_for_corner) * 100
                if total_tests_for_corner > 0
                else 0
            )
            total_failing_percentage = (
                (total_failing_tests_for_corner / total_tests_for_corner) * 100
                if total_tests_for_corner > 0
                else 0
            )
            total_not_run_percentage = (
                (total_not_run_tests_for_corner / total_tests_for_corner) * 100
                if total_tests_for_corner > 0
                else 0
            )

            voltage_vs_corner_results[corner_name][
                "TOTAL_TESTS"
            ] = total_tests_for_corner
            voltage_vs_corner_results[corner_name][
                "TOTAL_PASSING_TESTS"
            ] = total_passing_tests_for_corner
            voltage_vs_corner_results[corner_name][
                "TOTAL_FAILING_TESTS"
            ] = total_failing_tests_for_corner
            voltage_vs_corner_results[corner_name][
                "TOTAL_NOT_RUN_TESTS"
            ] = total_not_run_tests_for_corner
            voltage_vs_corner_results[corner_name]["TOTAL_PASSING_PERCENTAGE"] = round(
                total_passing_percentage, 2
            )
            voltage_vs_corner_results[corner_name]["TOTAL_FAILING_PERCENTAGE"] = round(
                total_failing_percentage, 2
            )
            voltage_vs_corner_results[corner_name]["TOTAL_NOT_RUN_PERCENTAGE"] = round(
                total_not_run_percentage, 2
            )
        return jsonify(voltage_vs_corner_results)

    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/api/get_unit_statistics", methods=["GET"])
def get_unit_statistics():
    project_id = request.args.get("project_id")
    try:
        unit_list = (
            db.session.query(
                Units.id, Units.process_corner, Units.two_d_name, Units.device_dna
            )
            .filter_by(project_id=project_id)
            .all()
        )

        total_test_count_per_unit = TestList.query.filter_by(
            project_id=project_id
        ).count()

        unit_statistics = []
        for unit in unit_list:
            unit_id, process_corner, two_d_name, device_dna = unit
            total_pass_count = (
                db.session.query(db.func.count(TestInstances.id))
                .filter(
                    TestInstances.unit_id == unit_id, TestInstances.result == "PASS"
                )
                .scalar()
            )
            total_fail_count = (
                db.session.query(db.func.count(TestInstances.id))
                .filter(
                    TestInstances.unit_id == unit_id, TestInstances.result == "FAIL"
                )
                .scalar()
            )
            total_not_run_count = (
                total_test_count_per_unit - total_pass_count - total_fail_count
            )
            pass_rate = round((total_pass_count / total_test_count_per_unit) * 100, 2)
            fail_rate = round((total_fail_count / total_test_count_per_unit) * 100, 2)
            not_run_rate = round(
                (total_not_run_count / total_test_count_per_unit) * 100, 2
            )

            unit_data = {
                "unit_id": unit_id,
                "process_corner": process_corner,
                "two_d_name": two_d_name,
                "device_dna": device_dna,
                "data": {
                    "total_test_count": total_test_count_per_unit,
                    "total_pass_count": total_pass_count,
                    "total_fail_count": total_fail_count,
                    "total_not_run_count": total_not_run_count,
                    "pass_rate": pass_rate,
                    "fail_rate": fail_rate,
                    "not_run_rate": not_run_rate,
                },
            }
            unit_statistics.append(unit_data)

        return jsonify(unit_statistics)

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True, host=host_ip, port=port)
