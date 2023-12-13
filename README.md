# File-Sharing-App
## 1. Fetch source code
```
git init
git remote add origin https://github.com/hungvo2003vn/File-Sharing-App.git
git fetch
git checkout P2P-WEB
```
## 2. Download required packages
```
python setup.py install
```
## 3. Run Application
### Run Application Server
```
python -m p2pfs <role>
```
> role can be 'tracker' or 'peer'
### Run Application UI
- Change dir to p2pfe
```
cd p2pfe
npm install
```
- Create an .env file in p2pfe
```
PORT_TRACKER = 8000
PORT_PEER = 8080

# P2P SERVER
TRACKER_SERVER_IP = '127.0.0.1'
TRACKER_SERVER_PORT = <FLASK_APP_PORT_TRACKER>
PEER_SERVER_IP = '127.0.0.1'
PEER_SERVER_PORT = <FLASK_APP_PORT_PEER>
```
- Run command:
```
npm run <role>
```
> role can be 'tracker' or 'peer'
## 4. Application View
- Tracker View:
![image](https://github.com/hungvo2003vn/File-Sharing-App/assets/108314498/75c3c2f1-4db8-4afb-a656-995e94601b73)
- Peer View:
![image](https://github.com/hungvo2003vn/File-Sharing-App/assets/108314498/0af57d3d-98cf-42dd-9cef-df2bf89d82c0)

