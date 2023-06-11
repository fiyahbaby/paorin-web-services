import json
from flask import Flask, jsonify, request, session, make_response
from flask_cors import CORS
from flask_login import login_user, login_required, logout_user, current_user
from werkzeug.security import check_password_hash
import socket

app = Flask(__name__)
app.secret_key = b'mySecretKey'
CORS(app, origins=["*"])

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

if __name__ == '__main__':
    app.run(debug=True, host=host_ip, port=port)
