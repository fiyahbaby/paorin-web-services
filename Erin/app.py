import json
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash
import socket
from datetime import datetime
import pytz
from flask_migrate import Migrate
from pymongo import MongoClient
from mongodb_data_retrieval import retrieveDbData

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

    def __str__(self):
        return self.device_name


class Voltages(db.Model):
    __tablename__ = "voltages"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255))
    value = db.Column(db.Float)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))

    def __str__(self):
        return self.name


class Temperatures(db.Model):
    __tablename__ = "temperatures"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255))
    value = db.Column(db.Float)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))

    def __str__(self):
        return str(self.temperature)


class Tests(db.Model):
    __tablename__ = "tests"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    s_suite = db.Column(db.String(255))
    suite = db.Column(db.String(255))
    name = db.Column(db.String(255))
    dc = db.Column(db.String(255))
    remarks = db.Column(db.String(255))
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))
    voltage_id = db.Column(db.Integer, db.ForeignKey("voltages.id"))
    temperature_id = db.Column(db.Integer, db.ForeignKey("temperatures.id"))

    def __str__(self):
        return self.name


class Units(db.Model):
    __tablename__ = "units"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    process_corner = db.Column(db.String(255))
    two_d_name = db.Column(db.String(255))
    remarks = db.Column(db.String(255))
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))

    def __str__(self):
        return self.two_d_name


class BuildIDs(db.Model):
    __tablename__ = "build_ids"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    time_stamp = db.Column(db.String(255))
    voltage_id = db.Column(db.Integer, db.ForeignKey("voltages.id"))
    temperature_id = db.Column(db.Integer, db.ForeignKey("temperatures.id"))
    two_d_name = db.Column(db.String(255))
    test_id = db.Column(db.Integer, db.ForeignKey("tests.id"))
    test_status = db.Column(db.String(255))
    run_time = db.Column(db.String(255))
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))

    def __str__(self):
        return self.time_stamp


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
        print(projects_list)
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
        print(project)
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
    Tests.query.filter_by(project_id=project_id).delete()
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


if __name__ == "__main__":
    app.run(debug=True, host=host_ip, port=port)
