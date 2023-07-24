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

    # Unique constraint on dc, s_suite, suite, name, project_id, voltage_id, and temperature_id
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

    # Index on the name column for faster querying
    __table_args__ += (db.Index("ix_test_list_name", "name"),)

    def __str__(self):
        return self.name


class Units(db.Model):
    __tablename__ = "units"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    process_corner = db.Column(db.String(255))
    two_d_name = db.Column(db.String(255))
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
            "date_created",
            "voltage_id",
            "temperature_id",
            "unit_id",
            "test_id",
            "project_id",
            name="_unique_build_ids",
        ),
    )

    def __str__(self):
        return self.id


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
        {"id": u.id, "process_corner": u.process_corner, "two_d_name": u.two_d_name}
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
        updated_unit = Units.query.get(unit_id)
        if updated_unit and (
            updated_unit.process_corner != process_corner
            or updated_unit.two_d_name != barcode
        ):
            updated_unit.process_corner = process_corner
            updated_unit.two_d_name = barcode

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
        return jsonify({"error": "Project not found"}), 404

    Voltages.query.filter_by(project_id=project_id).delete()
    Temperatures.query.filter_by(project_id=project_id).delete()
    Units.query.filter_by(project_id=project_id).delete()
    TestList.query.filter_by(project_id=project_id).delete()
    BuildIDs.query.filter_by(project_id=project_id).delete()

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
        print("Error retrieving data.")
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
            max_temp_item = float(item["Max. Temp"])
            min_temp_item = float(item["Min. Temp"])

            if max_temp_item > max_temp:
                max_temp = max_temp_item

            if min_temp_item < min_temp:
                min_temp = min_temp_item
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


if __name__ == "__main__":
    app.run(debug=True, host=host_ip, port=port)
