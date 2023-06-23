import json
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash
import socket
from datetime import datetime
import pytz
from flask_migrate import Migrate

app = Flask(__name__)
app.secret_key = b'mySecretKey'
CORS(app, origins=["*"])

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///C:/Users/paolodel/Documents/GitHub/paorin-web-services/Erin/sqlite/Databases/testdb2'
db = SQLAlchemy(app)
migrate = Migrate(app, db)

class Projects(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    device_name = db.Column(db.String(255))
    revision_id = db.Column(db.String(255))
    test_type_id = db.Column(db.String(255))
    block_id = db.Column(db.String(255))
    date_created = db.Column(db.String(255))

    def __str__(self):
        return self.device_name

class Voltages(db.Model):
    __tablename__ = 'voltages'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    value = db.Column(db.Float)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))

    def __str__(self):
        return self.name

class Temperatures(db.Model):
    __tablename__ = 'temperatures'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    value = db.Column(db.Float)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))

    def __str__(self):
        return str(self.temperature)

class Tests(db.Model):
    __tablename__ = 'tests'
    id = db.Column(db.Integer, primary_key=True)
    s_suite = db.Column(db.String(255))
    suite = db.Column(db.String(255))
    name = db.Column(db.String(255))
    dc = db.Column(db.String(255))
    remarks = db.Column(db.String(255))
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    voltage_id = db.Column(db.Integer, db.ForeignKey('voltages.id'))
    temperature_id = db.Column(db.Integer, db.ForeignKey('temperatures.id'))

    def __str__(self):
        return self.name

class Units(db.Model):
    __tablename__ = 'units'
    id = db.Column(db.Integer, primary_key=True)
    process_corner = db.Column(db.String(255))
    two_d_name = db.Column(db.String(255))
    remarks = db.Column(db.String(255))
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))

    def __str__(self):
        return self.two_d_name

class BuildIDs(db.Model):
    __tablename__ = 'build_ids'
    id = db.Column(db.Integer, primary_key=True)
    time_stamp = db.Column(db.String(255))
    voltage_id = db.Column(db.Integer, db.ForeignKey('voltages.id'))
    temperature_id = db.Column(db.Integer, db.ForeignKey('temperatures.id'))
    two_d_name = db.Column(db.String(255))
    test_id = db.Column(db.Integer, db.ForeignKey('tests.id'))
    test_status = db.Column(db.String(255))
    run_time = db.Column(db.String(255))

    def __str__(self):
        return self.time_stamp

hostname = socket.gethostname()
ip_address = socket.gethostbyname(hostname)
print(f"Host IP address: {ip_address}")
host_ip = ip_address
port = 5000

@app.route('/api/ip', methods=['GET'])
def get_ip():
    return jsonify(ip=ip_address)

@app.route('/api/accounts', methods=['POST'])
def get_account():
    data = request.get_json()
    with open('assets/backend-data/account.json', 'r') as account:
        accounts = json.load(account)
        for acc in accounts:
            if data['username'] == acc['username'] and data['password'] == acc['password']:
                userType = data['type']
    return jsonify(userType)

@app.route('/api/login', methods=['POST'])
def login():
    flag = False
    data = request.get_json()
    with open('assets/backend-data/account.json', 'r') as account:
        accounts = json.load(account)
        for acc in accounts:
            if data['username'] == acc['username'] and data['password'] == acc['password']:
                session['user_id'] = 1
                return {'type': 'success', 'message': 'Logged in successful', 'userType': acc['type']}
            flag = True
        if flag:
            return {'type': 'error', 'message': 'Invalid username or password'}

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return {'message': 'Logout successful'}

@app.route('/api/projects', methods=['GET'])
def get_projects():
    projects = Projects.query.all()
    projects_list = []
    for project in projects:
        project_dict = {
            'id': project.id,
            'device_name': project.device_name,
            'revision_id': project.revision_id,
            'test_type_id': project.test_type_id,
            'block_id': project.block_id,
            'date_created': project.date_created
        }
        projects_list.append(project_dict)
    return jsonify(projects_list)

@app.route('/api/data', methods=['GET'])
def get_data():
    projectParam = []
    project_id = request.args.get('projectId')
    project = Projects.query.filter_by(id=project_id).first()
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    voltages = Voltages.query.filter_by(project_id=project.id).all()
    voltage_list = [{'name': v.name, 'value': v.value} for v in voltages]
    temperatures = Temperatures.query.filter_by(project_id=project.id).all()
    temperature_list = [{'name': t.name, 'value': t.value} for t in temperatures]
    units = Units.query.filter_by(project_id=project.id).all()
    unit_list = [{'process_corner': u.process_corner, 'two_d_name': u.two_d_name} for u in units]

    for v, t, u in zip(voltage_list, temperature_list, unit_list):
        projectParam.append({'voltage': v, 'temperature': t, 'unit': u})  

    return jsonify(projectParam)


@app.route('/api/createProjects', methods=['POST'])
def create_project():
    project_data = request.json
    project_name = project_data.get('project_name')
    revision_id = project_data.get('revision_name')
    test_type_id = project_data.get('test_type_name')
    block_id = project_data.get('block_name')
    date_created = datetime.now(pytz.timezone('Asia/Singapore')).date()

    project = Projects(
        device_name=project_name,
        revision_id=revision_id,
        test_type_id=test_type_id,
        block_id=block_id,
        date_created=date_created
    )

    db.session.add(project)
    db.session.commit()

    return jsonify({'message': 'Project created successfully'})

@app.route('/api/addProjectParam', methods=['POST'])
def add_project_param():
    project_data = request.json
    project_id = project_data.get('project_id')
    voltages = project_data.get('voltages')
    temperatures = project_data.get('temperatures')
    units = project_data.get('units')
    existing_project = Projects.query.get(project_id)

    if existing_project:
        for voltage in voltages:
            v = Voltages(name=voltage['name'], value=voltage['value'], project_id=project_id)
            db.session.add(v)

        for temperature in temperatures:
            t = Temperatures(name=temperature['name'], value=temperature['value'], project_id=project_id)
            db.session.add(t)

        for unit in units:
            u = Units(process_corner=unit['processCorner'], two_d_name=unit['barcode'], project_id=project_id)
            db.session.add(u)

        db.session.commit()
        return {'message': 'Project data updated successfully'}
    else:
        return {'message': 'Project not found'}


if __name__ == '__main__':
    app.run(debug=True, host=host_ip, port=port)
