import json
from flask import Flask, jsonify, request, session, make_response
from flask_cors import CORS
from flask_login import login_user, login_required, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash
import socket

app = Flask(__name__)
app.secret_key = b'mySecretKey'
CORS(app, origins=["*"])

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///C:/Users/paolodel/sqlite/Databases/charfuncdb'
db = SQLAlchemy(app)

class Projects(db.Model):
    project_id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.String(255))
    revision_id = db.Column(db.Integer)
    test_type_id = db.Column(db.Integer)
    block_id = db.Column(db.Integer)

    def __init__(self, project_name, revision_id, test_type_id, block_id):
        self.project_name = project_name
        self.revision_id = revision_id
        self.test_type_id = test_type_id
        self.block_id = block_id

class DeviceFamilies(db.Model):
    device_family_id = db.Column(db.Integer, primary_key=True)
    device_family_name = db.Column(db.String(255))

    def __init__(self, device_family_name):
        self.device_family_name = device_family_name

class Revisions(db.Model):
    revision_id = db.Column(db.Integer, primary_key=True)
    revision_name = db.Column(db.String(255))

    def __init__(self, revision_name):
        self.revision_name = revision_name

class TestTypes(db.Model):
    test_type_id = db.Column(db.Integer, primary_key=True)
    test_type = db.Column(db.String(255))

    def __init__(self, test_type):
        self.test_type = test_type

class Blocks(db.Model):
    block_id = db.Column(db.Integer, primary_key=True)
    block_name = db.Column(db.String(255))

    def __init__(self, block_name):
        self.block_name = block_name


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
                return { 'type': 'success', 'message': 'Logged in successful', 'userType': acc['type'] }
            flag = True
        if (flag):
            return {'type': 'error', 'message': 'Invalid username or password'}
        
@app.route('/api/logout', methods=['POST'])    
def logout():
    session.clear()
    return {'message': 'Logout successful'}

@app.route('/api/projects', methods=['GET'])
def get_projects():
    with open('assets/backend-data/projects.json', 'r') as projects_file:
        projects = json.load(projects_file)
    return jsonify(projects)

@app.route('/api/createProjects', methods=['POST'])
def create_project():
    project_data = request.json
    print('Received project data:', project_data)

    project_name = project_data.get('project_name')
    revision_id = project_data.get('revision_name')
    test_type_id = project_data.get('test_type_name')
    block_id = project_data.get('block_name')

    project = Projects(
        project_name=project_name,
        revision_id=revision_id,
        test_type_id=test_type_id,
        block_id=block_id
    )
    db.session.add(project)

    revision = Revisions(revision_name=revision_id) 
    db.session.add(revision)

    test_type = TestTypes(test_type=test_type_id)
    db.session.add(test_type)

    # block_name = project_data.get('block_name')
    # block = Blocks(block_name=block_name)
    # db.session.add(block)

    # device_family_name = project_data.get('project_name')
    # device_family = DeviceFamilies(
    #     device_family_name=device_family_name,
    # )
    # db.session.add(device_family)

    db.session.commit()
    print('Project created successfully')

    return jsonify({'message': 'Project created successfully'})

if __name__ == '__main__':
    app.run(debug=True, host=host_ip, port=port)
