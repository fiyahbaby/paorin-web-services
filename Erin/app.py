import json
import re
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import pytz
from werkzeug.security import check_password_hash
import socket
from datetime import datetime, timedelta, timezone
from pytz import timezone
from flask_migrate import Migrate
from pymongo import MongoClient
from mongodb_data_retrieval import retrieveDbData
import itertools
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_, case, or_, desc, func
from sqlalchemy.sql import func
from sqlalchemy.orm import aliased

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
    target_unit_count = db.Column(db.Integer, nullable=True)

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
            "target_unit_count": project.target_unit_count,
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
    target_unit_count = project_data.get("targetUnitCount")
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
        target_unit_count=target_unit_count,
    )
    db.session.add(project)
    db.session.commit()

    return jsonify({"message": "Project created successfully"})


@app.route("/api/addProjectParam", methods=["POST"])
def add_project_param():
    try:
        db.session.begin()
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
                        name=voltage["name"],
                        value=voltage["value"],
                        project_id=project_id,
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
            print("Project data added successfully")
            return {"message": "Project data updated successfully"}
        else:
            print("Project not found")
            return {"message": "Project not found"}
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}


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
        target_unit_count = project["targetUnitCount"]
        date_created = project["dateCreated"]

        updated_project = Projects.query.get(project_id)
        if updated_project and (
            updated_project.device_name != device_name
            or updated_project.revision_id != revision_id
            or updated_project.test_type_id != test_type_id
            or updated_project.block_id != block_id
            or updated_project.target_unit_count != target_unit_count
            or updated_project.date_created != date_created
        ):
            updated_project.device_name = device_name
            updated_project.revision_id = revision_id
            updated_project.test_type_id = test_type_id
            updated_project.block_id = block_id
            updated_project.target_unit_count = target_unit_count
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


@app.route("/api/recommendData", methods=["POST"])
def recommend_data():
    try:
        build_data = request.json
        device_dna = build_data[0].get("DNA", "")

        voltage_string = build_data[0].get("Voltage", "")
        if voltage_string == "0":
            new_voltage_string = ""  # or set it to some default value
        elif "_" in voltage_string:
            voltage_split = voltage_string.split("_")
            if len(voltage_split) > 1:
                new_voltage_string = voltage_split[1]
        else:
            new_voltage_string = voltage_string

        voltage_match = re.search(r"[\d.]+", voltage_string)
        if voltage_match:
            voltage = float(voltage_match.group())
        else:
            voltage = None

        result = {}
        result["temperatures"] = calculate_temperature_stats(build_data)
        unit_list = Units.query.filter_by(device_dna=device_dna).all()

        if (new_voltage_string is not None) and (voltage is not None):
            voltage_list = Voltages.query.filter(
                Voltages.value == voltage, Voltages.name == new_voltage_string
            ).all()
        else:
            voltage_list = Voltages.query.filter_by(value=voltage).all()

        units = []
        unique_units = set()

        for unit in unit_list:
            if unit.two_d_name not in unique_units:
                unique_units.add(unit.two_d_name)
                unit_dict = {
                    "id": unit.id,
                    "project_id": unit.project_id,
                    "processCorner": unit.process_corner,
                    "two_d_name": unit.two_d_name,
                    "device_dna": unit.device_dna,
                }
                units.append(unit_dict)
        if units:
            result["unit"] = units
        else:
            result["unit"] = None

        voltages = []
        for voltage in voltage_list:
            voltage_dict = {
                "id": voltage.id,
                "project_id": voltage.project_id,
                "name": voltage.name,
                "value": voltage.value,
            }
            voltages.append(voltage_dict)
        unique_voltages = set()
        unique_voltage_dicts = []
        for voltage in voltages:
            voltage_key = (voltage["name"], voltage["value"])
            if voltage_key not in unique_voltages:
                unique_voltages.add(voltage_key)
                unique_voltage_dicts.append(voltage)
        if unique_voltage_dicts:
            result["voltage"] = unique_voltage_dicts
        else:
            result["voltage"] = None

        avg_temp = result["temperatures"]["Average Temp"]
        tolerance = 15.0

        similar_temps = Temperatures.query.filter(
            Temperatures.value >= avg_temp - tolerance,
            Temperatures.value <= avg_temp + tolerance,
        ).all()

        similar_temperatures = []
        unique_temperatures = set()
        for temp in similar_temps:
            if temp.value not in unique_temperatures:
                unique_temperatures.add(temp.value)
                temp_dict = {
                    "id": temp.id,
                    "project_id": temp.project_id,
                    "name": temp.name,
                    "value": temp.value,
                }
                similar_temperatures.append(temp_dict)

        if similar_temperatures:
            result["similar_temp"] = similar_temperatures
        else:
            result["similar_temp"] = None

        common_project_ids = list(
            set(temp["project_id"] for temp in similar_temperatures)
            & set(unit["project_id"] for unit in units)
            & set(voltage["project_id"] for voltage in voltages)
        )

        if common_project_ids:
            project_details = []
            for project_id in common_project_ids:
                project = Projects.query.get(project_id)
                if project:
                    project_dict = {
                        "id": project.id,
                        "device_name": project.device_name,
                        "revision_id": project.revision_id,
                        "test_type_id": project.test_type_id,
                        "block_id": project.block_id,
                        "date_created": project.date_created,
                    }
                    project_details.append(project_dict)
            result["recommended_projects"] = project_details
            result["isRecommendExist"] = True
        else:
            result["recomended_projects"] = None
            result["isRecommendExist"] = False

        return jsonify(result)
    except Exception as e:
        error_message = "Error processing build data: {}".format(str(e))
        return jsonify({"error": error_message})


def calculate_temperature_stats(data):
    total_max_temp = 0
    total_min_temp = 0
    count = 0

    for item in data:
        if "Max. Temp" in item and "Min. Temp" in item:
            max_temp_item = item["Max. Temp"]
            min_temp_item = item["Min. Temp"]

            if max_temp_item is not None and min_temp_item is not None:
                max_temp_item = float(max_temp_item)
                total_max_temp += max_temp_item
                min_temp_item = float(min_temp_item)
                total_min_temp += min_temp_item
                count += 1

    if count > 0:
        avg_max_temp = total_max_temp / count
        avg_min_temp = total_min_temp / count
        avg_temp = (avg_max_temp + avg_min_temp) / 2
    else:
        avg_max_temp = 0
        avg_min_temp = 0
        avg_temp = 0

    result = {
        "Total Max Temp": total_max_temp,
        "Total Min Temp": total_min_temp,
        "Average Max Temp": avg_max_temp,
        "Average Min Temp": avg_min_temp,
        "Average Temp": avg_temp,
    }

    return result


@app.route("/api/addTestList", methods=["POST"])
def addTestList():
    try:
        db.session.begin()
        file_content = request.json
        if file_content:
            file_content = remove_carriage_return(file_content)
            processed_tests, project_details = process_test_list(file_content)

            project_id = project_details.get("id")
            project = Projects.query.filter_by(id=project_id).first()
            if not project:
                return jsonify({"error": "Project not found"})

            TestList.query.filter_by(project_id=project_id).delete()

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
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}


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
        test_id = test_data["Build ID"]
        existing_test_instance = TestInstances.query.filter_by(
            project_id=project_id,
            test_id=test_id,
            unit_id=unit_id,
            voltage_id=voltage_id,
            temperature_id=temperature_id,
            s_suite=test_data["S-Suite"],
            suite=test_data["Suite"],
            test_name=test_data["Test Name"],
        ).first()

        if existing_test_instance:
            if test_data["Test Result"] == "PASS":
                existing_test_instance.result = test_data["Test Result"]
                existing_test_instance.max_temp = test_data["Max. Temp"]
                existing_test_instance.min_temp = test_data["Min. Temp"]
                existing_test_instance.run_time = test_data["Run Time"]

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
                continue
        else:
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

    existing_build_id = BuildIDs.query.filter_by(
        project_id=project_id,
        unit_id=unit_id,
        voltage_id=voltage_id,
        temperature_id=temperature_id,
        test_id=build_data[0]["Build ID"],
    ).first()

    if existing_build_id:
        message = f"{updated_tests} existing tests updated, {new_tests} new tests added, BuildID entry already exists."
    else:
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
        db.session.add(buildID)
        message = (
            f"{updated_tests} existing tests updated, {new_tests} new tests added."
        )
    db.session.commit()

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

        voltage_test_counts = get_proj_total_test_cases(project_id)

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

        voltage_test_counts = get_proj_total_test_cases(project_id)

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


def get_proj_total_test_cases(project_id):
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


def get_total_tests_per_voltage(project_id):
    voltage_list = Voltages.query.filter(Voltages.project_id == project_id).all()

    voltage_test_counts = {}

    for voltage in voltage_list:
        voltage_id = voltage.id
        voltage_name = voltage.name

        test_list = TestList.query.filter(TestList.voltage_id == voltage_id).all()
        voltage_test_count = len(test_list)
        voltage_test_counts[voltage_name] = voltage_test_count

    return voltage_test_counts


@app.route("/api/voltageVsCornerData", methods=["GET"])
def get_voltage_vs_corner():
    project_id = request.args.get("project_id")
    if not project_id:
        jsonify({"message": "No project ID provided."})

    try:
        test_instances = TestInstances.query.filter(
            TestInstances.project_id == project_id
        ).all()

        voltage_test_counts = get_total_tests_per_voltage(project_id)

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


@app.route("/api/get_test_statistics", methods=["GET"])
def get_test_statistics():
    project_id = request.args.get("project_id")
    if not project_id:
        jsonify({"message": "No project ID provided."})
    try:
        unit_count = Units.query.filter(Units.project_id == project_id).count()
        target_unit_count = Projects.query.get(project_id).target_unit_count
        total_test_count = (
            TestList.query.filter_by(project_id=project_id).count()
        ) * unit_count
        total_target_test_count = (
            TestList.query.filter_by(project_id=project_id).count()
        ) * target_unit_count
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
        total_overall_not_run_count = (
            total_target_test_count - total_pass_count - total_fail_count
        )

        unique_test_count = (
            db.session.query(TestList.dc, TestList.name)
            .filter(TestList.project_id == project_id)
            .distinct()
            .count()
        )

        response = {
            "total_test_count": total_test_count,
            "total_tests_run_count": total_test_instance_count,
            "total_pass_count": total_pass_count,
            "total_fail_count": total_fail_count,
            "total_run_count": total_test_count - total_not_run_count,
            "total_not_run_count": total_not_run_count,
            "project_progress": round((total_pass_count / total_test_count) * 100, 2),
            "project_fail_rate": round((total_fail_count / total_test_count) * 100, 2),
            "project_not_run_rate": round(
                (total_not_run_count / total_test_count) * 100, 2
            ),
            "unique_test_count": unique_test_count,
            "total_target_test_count": total_target_test_count,
            "total_overall_not_run_count": total_overall_not_run_count,
            "target_unit_count": target_unit_count,
            "overall_project_progress": round(
                (total_pass_count / total_target_test_count) * 100, 2
            ),
            "overall_project_fail_rate": round(
                (total_fail_count / total_target_test_count) * 100, 2
            ),
            "overall_project_not_run_rate": round(
                (total_overall_not_run_count / total_target_test_count) * 100, 2
            ),
        }
        return jsonify(response)

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


@app.route("/api/retrieveItemSummary", methods=["GET"])
def retrieve_item_summary():
    project_id = request.args.get("projectID")
    summary_item = request.args.get("summaryItem")
    category_item = request.args.get("category")

    voltage_names, temperature_values, unit_process_corners = get_summary_categories(
        project_id
    )
    categories = {
        "voltage": voltage_names,
        "temperature": temperature_values,
        "unit_process_corner": unit_process_corners,
    }
    category = get_category(summary_item, categories)
    if category is None and category_item is None:
        return jsonify({"error": "Invalid summary item"})
    if category == "voltage":
        (
            units,
            corner_names,
            voltage_test_results,
            corner_vs_voltage_results,
            temperature_results,
            test_instances_data,
        ) = get_category_test_counts(project_id, category, summary_item)

        return jsonify(
            {
                "summary_category": "voltage",
                "summary_item": summary_item,
                "units": units,
                "corner_names": corner_names,
                "voltage_test_results": voltage_test_results,
                "corner_vs_voltage_results": corner_vs_voltage_results,
                "temperature_results": temperature_results,
                "test_instances_data": test_instances_data,
            }
        )
    elif category == "temperature":
        return jsonify(temperature_values)
    elif category == "unit_process_corner":
        corner_test_results, units, unit_test_counts = get_category_test_counts(
            project_id, category, summary_item
        )
        (
            corner_vs_voltage_results,
            unit_vs_voltage_results,
            test_instances_data,
            temperature_results,
        ) = get_corner_summary_item_data(project_id, summary_item)
        return jsonify(
            {
                "summary_category": "corner",
                "summary_item": summary_item,
                "corner_test_results": corner_test_results,
                "units": units,
                "unit_test_counts": unit_test_counts,
                "corner_vs_voltage_results": corner_vs_voltage_results,
                "unit_vs_voltage_per_unit": unit_vs_voltage_results,
                "test_instances_data": test_instances_data,
                "temperature_results": temperature_results,
            }
        )
    elif category_item == "project-result":
        (
            failing_test_count,
            fail_test_instances,
            failures_per_unit,
            failures_per_temperature,
            failures_per_voltage,
            failures_per_corner,
            voltage_test_count,
            corner_test_count,
            unit_test_count,
            temperature_test_count,
        ) = get_category_test_counts(project_id, category_item, summary_item)
        return jsonify(
            {
                "summary_item": "Fail",
                "test_count": failing_test_count,
                "test_instances": fail_test_instances,
                "outcome_per_unit": failures_per_unit,
                "outcome_per_temperature": failures_per_temperature,
                "outcome_per_voltage": failures_per_voltage,
                "outcome_per_corner": failures_per_corner,
                "voltage_test_count": voltage_test_count,
                "corner_test_count": corner_test_count,
                "unit_test_count": unit_test_count,
                "temperature_test_count": temperature_test_count,
            }
        )


def get_summary_categories(project_id):
    voltage_names = [
        name[0]
        for name in Voltages.query.with_entities(Voltages.name)
        .filter_by(project_id=project_id)
        .all()
    ]
    temperature_values = [
        value[0]
        for value in Temperatures.query.with_entities(Temperatures.value)
        .filter_by(project_id=project_id)
        .all()
    ]
    unit_process_corners = [
        corner[0]
        for corner in Units.query.with_entities(Units.process_corner)
        .filter_by(project_id=project_id)
        .all()
    ]
    return voltage_names, temperature_values, unit_process_corners


def get_category(summary_item, categories):
    for category, values in categories.items():
        if summary_item in values:
            return category
    return None


def get_category_test_counts(project_id, category, summary_item):
    total_corner_test_count = 0
    unit_list = []

    if category == "unit_process_corner":
        # get list of units
        unit_list = Units.query.filter_by(
            project_id=project_id, process_corner=summary_item
        ).all()
        units = []
        for unit in unit_list:
            units.append(
                {
                    "id": unit.id,
                    "process_corner": unit.process_corner,
                    "two_d_name": unit.two_d_name,
                    "device_dna": unit.device_dna,
                }
            )

        # get total corner test counts
        corner_test_results = {}
        project_test_count = TestList.query.filter_by(project_id=project_id).count()
        unit_count = Units.query.filter_by(
            project_id=project_id, process_corner=summary_item
        ).count()
        total_corner_test_count = project_test_count * unit_count
        corner_test_results = {
            "total_corner_test_count": total_corner_test_count,
            "pass_count": 0,
            "fail_count": 0,
            "not_run_count": 0,
        }

        # Get total pass/fail/not-run test counts
        unit_test_counts = {}
        unit_test_counts = {}
        for unit in unit_list:
            pass_count = TestInstances.query.filter(
                TestInstances.project_id == project_id,
                TestInstances.unit_id == unit.id,
                TestInstances.result == "PASS",
            ).count()
            fail_count = TestInstances.query.filter(
                TestInstances.project_id == project_id,
                TestInstances.unit_id == unit.id,
                TestInstances.result == "FAIL",
            ).count()
            not_run_count = project_test_count - pass_count - fail_count
            unit_test_counts[unit.two_d_name] = {
                "PASS": pass_count,
                "FAIL": fail_count,
                "NOT-RUN": not_run_count,
            }
            corner_test_results["pass_count"] += pass_count
            corner_test_results["fail_count"] += fail_count
            corner_test_results["not_run_count"] += not_run_count
        return corner_test_results, units, unit_test_counts
    elif category == "voltage":
        # get list of units
        unit_list = Units.query.filter_by(project_id=project_id).all()
        unit_count = Units.query.filter_by(project_id=project_id).count()
        units = []
        for unit in unit_list:
            units.append(
                {
                    "id": unit.id,
                    "process_corner": unit.process_corner,
                    "two_d_name": unit.two_d_name,
                    "device_dna": unit.device_dna,
                }
            )

        # get voltage detail
        voltage = Voltages.query.filter_by(
            project_id=project_id, name=summary_item
        ).first()
        voltage_id = voltage.id

        # get total voltage test counts
        voltage_test_count = TestList.query.filter_by(
            project_id=project_id, voltage_id=voltage_id
        ).count()
        total_voltage_test_count = voltage_test_count * unit_count

        # get total pass/fail/not-run test counts
        total_voltage_pass_count = TestInstances.query.filter(
            TestInstances.project_id == project_id,
            TestInstances.voltage_id == voltage_id,
            TestInstances.result == "PASS",
        ).count()
        total_voltage_fail_count = TestInstances.query.filter(
            TestInstances.project_id == project_id,
            TestInstances.voltage_id == voltage_id,
            TestInstances.result == "FAIL",
        ).count()
        total_voltage_not_run_count = (
            total_voltage_test_count
            - total_voltage_pass_count
            - total_voltage_fail_count
        )
        voltage_test_results = {
            "total_voltage_test_count": total_voltage_test_count,
            "total_voltage_pass_count": total_voltage_pass_count,
            "total_voltage_fail_count": total_voltage_fail_count,
            "total_voltage_not_run_count": total_voltage_not_run_count,
        }

        # Get total pass/fail/not-run test counts per corner
        corner_names = [
            corner[0]
            for corner in Units.query.with_entities(Units.process_corner)
            .filter_by(project_id=project_id)
            .distinct()
            .all()
        ]

        corner_vs_voltage_results = {
            "corner_results": {},
            "unit_results": {},
        }

        for unit in unit_list:
            unit_id = unit.id
            corner = unit.process_corner

            corner_pass_count = TestInstances.query.filter_by(
                project_id=project_id,
                unit_id=unit_id,
                voltage_id=voltage_id,
                result="PASS",
            ).count()

            corner_fail_count = TestInstances.query.filter_by(
                project_id=project_id,
                unit_id=unit_id,
                voltage_id=voltage_id,
                result="FAIL",
            ).count()

            units_in_corner = len([u for u in unit_list if u.process_corner == corner])
            corner_not_run_count = (
                units_in_corner * voltage_test_count
                - corner_pass_count
                - corner_fail_count
            )
            unit_not_run_count = (
                voltage_test_count - corner_pass_count - corner_fail_count
            )

            if corner not in corner_vs_voltage_results["corner_results"]:
                corner_vs_voltage_results["corner_results"][corner] = {
                    "PASS": corner_pass_count,
                    "FAIL": corner_fail_count,
                    "NOT-RUN": corner_not_run_count,
                }

            if unit.two_d_name not in corner_vs_voltage_results["unit_results"]:
                corner_vs_voltage_results["unit_results"][unit.two_d_name] = {
                    "PASS": 0,
                    "FAIL": 0,
                    "NOT-RUN": 0,
                }

            corner_vs_voltage_results["unit_results"][unit.two_d_name][
                "PASS"
            ] += corner_pass_count
            corner_vs_voltage_results["unit_results"][unit.two_d_name][
                "FAIL"
            ] += corner_fail_count
            corner_vs_voltage_results["unit_results"][unit.two_d_name][
                "NOT-RUN"
            ] += unit_not_run_count

        # get temperature results
        temperature_list = Temperatures.query.filter(
            Temperatures.project_id == project_id
        ).all()
        temperature_count = len(temperature_list)
        test_count_per_temp = int(
            (
                TestList.query.filter_by(
                    project_id=project_id, voltage_id=voltage_id
                ).count()
            )
            / temperature_count
        )

        temperature_results = {}
        for temperature in temperature_list:
            temperature_value = temperature.value
            pass_count_per_temp = 0
            fail_count_per_temp = 0
            not_run_count_per_temp = 0
            for unit in unit_list:
                unit_id = unit.id
                pass_count_per_temp_unit = TestInstances.query.filter(
                    TestInstances.project_id == project_id,
                    TestInstances.unit_id == unit_id,
                    TestInstances.temperature_id == temperature.id,
                    TestInstances.voltage_id == voltage_id,
                    TestInstances.result == "PASS",
                ).count()
                fail_count_per_temp_unit = TestInstances.query.filter(
                    TestInstances.project_id == project_id,
                    TestInstances.unit_id == unit_id,
                    TestInstances.temperature_id == temperature.id,
                    TestInstances.voltage_id == voltage_id,
                    TestInstances.result == "FAIL",
                ).count()
                not_run_count_per_temp_unit = (
                    test_count_per_temp
                    - pass_count_per_temp_unit
                    - fail_count_per_temp_unit
                )

                pass_count_per_temp += pass_count_per_temp_unit
                fail_count_per_temp += fail_count_per_temp_unit
                not_run_count_per_temp += not_run_count_per_temp_unit

            temperature_results[temperature_value] = {
                "PASS": pass_count_per_temp,
                "FAIL": fail_count_per_temp,
                "NOT-RUN": not_run_count_per_temp,
            }

        # Fetch recent build IDs with passing percentage
        unit_ids = [
            unit.id for unit in Units.query.filter(Units.project_id == project_id).all()
        ]

        # Query to retrieve the last 10 test instances with passing percentage
        test_instances = (
            db.session.query(
                TestInstances.test_id,
                Units.two_d_name.label("unit_name"),
                Voltages.name.label("voltage_name"),
                Temperatures.value.label("temperature_value"),
                func.sum(case((TestInstances.result == "PASS", 1), else_=0)).label(
                    "pass_count"
                ),
                func.count(TestInstances.id).label("total_count"),
            )
            .join(Units, TestInstances.unit_id == Units.id)
            .join(Voltages, TestInstances.voltage_id == Voltages.id)
            .join(Temperatures, TestInstances.temperature_id == Temperatures.id)
            .filter(
                TestInstances.voltage_id == voltage_id,
                TestInstances.project_id == project_id,
                TestInstances.unit_id.in_(unit_ids),
            )
            .group_by(
                TestInstances.test_id,
                Units.two_d_name,
                Voltages.value,
                Temperatures.value,
            )
            .order_by(desc(TestInstances.id))
            .limit(30)
            .all()
        )

        test_instances_data = []
        for test_instance in test_instances:
            test_id = test_instance.test_id
            unit_name = test_instance.unit_name
            voltage_value = test_instance.voltage_name
            temperature_value = test_instance.temperature_value
            pass_count = test_instance.pass_count
            total_count = test_instance.total_count
            passing_percentage = (
                (pass_count / total_count) * 100 if total_count > 0 else 0
            )

            test_instance_data = {
                "Build ID": test_id,
                "Unit": unit_name,
                "Voltage": voltage_value,
                "Temp": temperature_value,
                "Passing Percentage": f"{passing_percentage:.2f}%",
            }
            test_instances_data.append(test_instance_data)

        return (
            units,
            corner_names,
            voltage_test_results,
            corner_vs_voltage_results,
            temperature_results,
            test_instances_data,
        )
    elif category == "project-result":
        if summary_item == "FAIL":
            # get list of units, temperatures and voltages
            unit_list = Units.query.filter_by(project_id=project_id).all()
            temperature_list = Temperatures.query.filter(
                Temperatures.project_id == project_id
            ).all()
            voltage_list = Voltages.query.filter(
                Voltages.project_id == project_id
            ).all()

            # get failing test cases
            failing_test_cases = TestInstances.query.filter(
                TestInstances.project_id == project_id, TestInstances.result == "FAIL"
            ).all()
            failing_test_count = len(failing_test_cases)
            test_instance_data = []
            for test_instance in failing_test_cases:
                test_id = test_instance.test_id
                unit_id = test_instance.unit_id
                voltage_id = test_instance.voltage_id
                temperature_id = test_instance.temperature_id
                result = test_instance.result
                max_temp = test_instance.max_temp
                min_temp = test_instance.min_temp
                run_time = test_instance.run_time
                vcc_int = test_instance.vcc_int
                vcc_pmc = test_instance.vcc_pmc
                vcc_psfp = test_instance.vcc_psfp
                vcc_ram = test_instance.vcc_ram
                vcc_soc = test_instance.vcc_soc
                vcc_batt = test_instance.vcc_batt
                vcc_aux = test_instance.vcc_aux
                vccaux_pmc = test_instance.vccaux_pmc
                vccaux_sysmon = test_instance.vccaux_sysmon
                s_suite = test_instance.s_suite
                suite = test_instance.suite
                test_name = test_instance.test_name

                unit = next((u for u in unit_list if u.id == unit_id), None)
                voltage = next((v for v in voltage_list if v.id == voltage_id), None)
                temperature = next(
                    (t for t in temperature_list if t.id == temperature_id), None
                )

                test_data = {
                    "Build ID": test_id,
                    "Unit": unit.two_d_name if unit else None,
                    "Voltage": voltage.name if voltage else None,
                    "Temperature": temperature.value if temperature else None,
                    "S-Suite": s_suite,
                    "Suite": suite,
                    "Test Name": test_name,
                    "Result": result,
                    "Max. Temp": max_temp,
                    "Min. Temp": min_temp,
                    "Run Time": run_time,
                    "VCCINT": vcc_int,
                    "VCC_PMC": vcc_pmc,
                    "VCC_PSFP": vcc_psfp,
                    "VCC_RAM": vcc_ram,
                    "VCC_SOC": vcc_soc,
                    "VCC_BATT": vcc_batt,
                    "VCCAUX": vcc_aux,
                    "VCCAUX_PMC": vccaux_pmc,
                    "VCCAUX_SYSMON": vccaux_sysmon,
                }
                test_instance_data.append(test_data)

            # get breakdown of failures per unit, temperature and voltage
            failures_per_unit = {}
            failures_per_temperature = {}
            failures_per_voltage = {}
            failures_per_corner = {}
            for test_instance in test_instance_data:
                unit_name = test_instance["Unit"]
                temperature_value = test_instance["Temperature"]
                voltage_name = test_instance["Voltage"]

                if unit_name:
                    if unit_name not in failures_per_unit:
                        failures_per_unit[unit_name] = []
                    failures_per_unit[unit_name].append(test_instance)

                if temperature_value is not None:
                    if temperature_value not in failures_per_temperature:
                        failures_per_temperature[temperature_value] = []
                    failures_per_temperature[temperature_value].append(test_instance)

                if voltage_name:
                    if voltage_name not in failures_per_voltage:
                        failures_per_voltage[voltage_name] = []
                    failures_per_voltage[voltage_name].append(test_instance)

                unit_id = next(
                    (u.id for u in unit_list if u.two_d_name == unit_name), None
                )
                if unit_id is not None:
                    unit = next((u for u in unit_list if u.id == unit_id), None)
                    if unit:
                        corner = unit.process_corner
                        if corner not in failures_per_corner:
                            failures_per_corner[corner] = []
                        failures_per_corner[corner].append(test_instance)

            # retrieve failure to total count ratio per voltage
            voltage_test_count = {}
            for voltage in voltage_list:
                voltage_test_count[voltage.name] = {}
                voltage_name = voltage.name
                voltage_id = voltage.id
                total_voltage_test_count = TestInstances.query.filter(
                    TestInstances.project_id == project_id,
                    TestInstances.voltage_id == voltage.id,
                ).count()
                voltage_test_count[voltage_name]["TOTAL"] = total_voltage_test_count

                total_voltage_fail_count = TestInstances.query.filter(
                    TestInstances.project_id == project_id,
                    TestInstances.voltage_id == voltage.id,
                    TestInstances.result == "FAIL",
                ).count()
                voltage_test_count[voltage_name]["FAIL"] = total_voltage_fail_count

            # retrieve failure to total count ratio per corner
            corner_test_count = {}
            unit_id_to_corner = {unit.id: unit.process_corner for unit in unit_list}
            for unit_id, corner in unit_id_to_corner.items():
                corner_test_count[corner] = {}
                corner_name = corner

                total_corner_test_count = TestInstances.query.filter(
                    TestInstances.project_id == project_id,
                    TestInstances.unit_id == unit_id,
                ).count()
                corner_test_count[corner_name]["TOTAL"] = total_corner_test_count

                total_corner_fail_count = TestInstances.query.filter(
                    TestInstances.project_id == project_id,
                    TestInstances.unit_id == unit_id,
                    TestInstances.result == "FAIL",
                ).count()
                corner_test_count[corner_name]["FAIL"] = total_corner_fail_count

            # retrieve failure to total count ratio per unit
            unit_test_count = {}
            for unit in unit_list:
                unit_name = unit.two_d_name
                unit_test_count[unit_name] = {}
                unit_id = unit.id
                total_unit_test_count = TestInstances.query.filter(
                    TestInstances.project_id == project_id,
                    TestInstances.unit_id == unit.id,
                ).count()
                unit_test_count[unit_name]["TOTAL"] = total_unit_test_count

                total_unit_fail_count = TestInstances.query.filter(
                    TestInstances.project_id == project_id,
                    TestInstances.unit_id == unit.id,
                    TestInstances.result == "FAIL",
                ).count()
                unit_test_count[unit_name]["FAIL"] = total_unit_fail_count

            # retrieve failure to total count ratio per temperature
            temperature_test_count = {}
            for temperature in temperature_list:
                temperature_test_count[temperature.value] = {}
                temperature_value = temperature.value
                total_temperature_test_count = TestInstances.query.filter(
                    TestInstances.project_id == project_id,
                    TestInstances.temperature_id == temperature.id,
                ).count()
                temperature_test_count[temperature_value][
                    "TOTAL"
                ] = total_temperature_test_count

                total_temperature_fail_count = TestInstances.query.filter(
                    TestInstances.project_id == project_id,
                    TestInstances.temperature_id == temperature.id,
                    TestInstances.result == "FAIL",
                ).count()
                temperature_test_count[temperature_value][
                    "FAIL"
                ] = total_temperature_fail_count

            return (
                failing_test_count,
                test_instance_data,
                failures_per_unit,
                failures_per_temperature,
                failures_per_voltage,
                failures_per_corner,
                voltage_test_count,
                corner_test_count,
                unit_test_count,
                temperature_test_count,
            )


def get_corner_summary_item_data(project_id, corner_name):
    # get corner results per voltage
    unit_count = Units.query.filter(
        Units.project_id == project_id, Units.process_corner == corner_name
    ).count()
    unit_ids = [
        unit.id
        for unit in Units.query.filter(
            Units.project_id == project_id, Units.process_corner == corner_name
        ).all()
    ]
    voltage_list = Voltages.query.filter(Voltages.project_id == project_id).all()
    voltage_test_count = get_total_tests_per_voltage(project_id)
    corner_vs_voltage_results = {}

    for voltage in voltage_list:
        voltage_name = voltage.name
        unit_pass_count_per_voltage = TestInstances.query.filter(
            TestInstances.project_id == project_id,
            TestInstances.voltage_id == voltage.id,
            TestInstances.result == "PASS",
            TestInstances.unit_id.in_(unit_ids),
        ).count()
        fail_count_per_voltage = TestInstances.query.filter(
            TestInstances.project_id == project_id,
            TestInstances.voltage_id == voltage.id,
            TestInstances.result == "FAIL",
            TestInstances.unit_id.in_(unit_ids),
        ).count()
        not_run_count_per_voltage = (
            (voltage_test_count[voltage_name] * unit_count)
            - unit_pass_count_per_voltage
            - fail_count_per_voltage
        )

        corner_vs_voltage_map = {
            "PASS": unit_pass_count_per_voltage,
            "FAIL": fail_count_per_voltage,
            "NOT-RUN": not_run_count_per_voltage,
        }
        corner_vs_voltage_results[voltage_name] = corner_vs_voltage_map

    # get per corner unit stats
    unit_vs_voltage_results = {}
    unit_list = Units.query.filter(
        Units.project_id == project_id, Units.process_corner == corner_name
    )

    for unit in unit_list:
        unit_id = unit.id
        unit_name = unit.two_d_name
        unit_results_per_voltage = {}

        for voltage in voltage_list:
            voltage_id = voltage.id
            voltage_name = voltage.name
            unit_pass_count_per_voltage = TestInstances.query.filter(
                TestInstances.project_id == project_id,
                TestInstances.unit_id == unit_id,
                TestInstances.voltage_id == voltage_id,
                TestInstances.result == "PASS",
            ).count()
            unit_fail_count_per_voltage = TestInstances.query.filter(
                TestInstances.project_id == project_id,
                TestInstances.unit_id == unit_id,
                TestInstances.voltage_id == voltage_id,
                TestInstances.result == "FAIL",
            ).count()
            unit_not_run_count_per_voltage = (
                voltage_test_count[voltage_name]
                - unit_pass_count_per_voltage
                - unit_fail_count_per_voltage
            )
            unit_results_per_voltage[voltage_name] = {
                "PASS": unit_pass_count_per_voltage,
                "FAIL": unit_fail_count_per_voltage,
                "NOT-RUN": unit_not_run_count_per_voltage,
            }

        unit_vs_voltage_results[unit_name] = unit_results_per_voltage

    # Fetch recent build IDs with passing percentage
    test_instances = (
        db.session.query(
            TestInstances.test_id,
            Units.two_d_name.label("unit_name"),
            Voltages.name.label("voltage_name"),
            Temperatures.value.label("temperature_value"),
            func.sum(case((TestInstances.result == "PASS", 1), else_=0)).label(
                "pass_count"
            ),
            func.count(TestInstances.id).label("total_count"),
        )
        .join(Units, TestInstances.unit_id == Units.id)
        .join(Voltages, TestInstances.voltage_id == Voltages.id)
        .join(Temperatures, TestInstances.temperature_id == Temperatures.id)
        .filter(
            TestInstances.project_id == project_id, TestInstances.unit_id.in_(unit_ids)
        )
        .group_by(
            TestInstances.test_id, Units.two_d_name, Voltages.name, Temperatures.value
        )
        .order_by(desc(TestInstances.id))
        .all()
    )

    test_instances_data = []
    for test_instance in test_instances:
        test_id = test_instance.test_id
        unit_name = test_instance.unit_name
        voltage_value = test_instance.voltage_name
        temperature_value = test_instance.temperature_value
        pass_count = test_instance.pass_count
        total_count = test_instance.total_count
        passing_percentage = (pass_count / total_count) * 100 if total_count > 0 else 0

        test_instance_data = {
            "Build ID": test_id,
            "Unit": unit_name,
            "Voltage": voltage_value,
            "Temp": temperature_value,
            "Passing Percentage": f"{passing_percentage:.2f}%",
        }
        test_instances_data.append(test_instance_data)

    # Fetch PASS/FAIL/NOT-RUN counts based on all temperatures
    temperature_list = Temperatures.query.filter(
        Temperatures.project_id == project_id
    ).all()
    temperature_count = len(temperature_list)
    test_count_per_temp = int(
        (TestList.query.filter_by(project_id=project_id).count()) / temperature_count
    )

    temperature_results = {}
    for temperature in temperature_list:
        temperature_value = temperature.value
        pass_count_per_temp = 0
        fail_count_per_temp = 0
        not_run_count_per_temp = 0
        for unit in unit_list:
            unit_id = unit.id
            pass_count_per_temp_unit = TestInstances.query.filter(
                TestInstances.project_id == project_id,
                TestInstances.unit_id == unit_id,
                TestInstances.temperature_id == temperature.id,
                TestInstances.result == "PASS",
            ).count()
            fail_count_per_temp_unit = TestInstances.query.filter(
                TestInstances.project_id == project_id,
                TestInstances.unit_id == unit_id,
                TestInstances.temperature_id == temperature.id,
                TestInstances.result == "FAIL",
            ).count()
            not_run_count_per_temp_unit = (
                test_count_per_temp
                - pass_count_per_temp_unit
                - fail_count_per_temp_unit
            )

            pass_count_per_temp += pass_count_per_temp_unit
            fail_count_per_temp += fail_count_per_temp_unit
            not_run_count_per_temp += not_run_count_per_temp_unit

        temperature_results[temperature_value] = {
            "PASS": pass_count_per_temp,
            "FAIL": fail_count_per_temp,
            "NOT-RUN": not_run_count_per_temp,
        }

    return (
        corner_vs_voltage_results,
        unit_vs_voltage_results,
        test_instances_data,
        temperature_results,
    )


@app.route("/api/get_project_test_durations", methods=["GET"])
def get_project_test_durations():
    project_id = request.args.get("project_id")

    all_passing_test_instances = (
        TestInstances.query.filter_by(project_id=project_id, result="PASS")
        .order_by(TestInstances.id.desc())
        .all()
    )

    test_duration = {}
    passing_test_durations = []
    total_passing_test_duration = 0
    test_instances = {}

    for test_instance in all_passing_test_instances:
        identifier = (
            f"{test_instance.s_suite}-{test_instance.suite}-{test_instance.test_name}"
        )

        if identifier not in test_instances:
            test_instances[identifier] = test_instance
            total_passing_test_duration += test_instance.run_time
            passing_test_durations.append(test_instance.run_time)

    svf_multipler = 0.8
    total_passing_test_duration = round(total_passing_test_duration / svf_multipler)
    total_passing_test_duration = seconds_to_hms(total_passing_test_duration)
    test_duration["total_run_time"] = total_passing_test_duration
    test_duration["passing_test_durations"] = passing_test_durations

    return test_duration


def seconds_to_hms(seconds):
    duration = timedelta(seconds=seconds)
    formatted_duration = str(duration)

    return formatted_duration


if __name__ == "__main__":
    app.run(debug=True, host=host_ip, port=port)
