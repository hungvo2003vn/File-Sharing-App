import asyncio
from p2pfs.ui.services import get_hostname
from flask import Flask, request, jsonify
import sys
import argparse
import logging, json
import coloredlogs
from p2pfs.core.peer import Peer
from p2pfs.core.tracker import Tracker
from p2pfs.ui.terminal import TrackerTerminal, PeerTerminal
from p2pfs.api.Controllers import TrackerController, PeerController 

coloredlogs.install(level='ERROR', fmt='%(levelname)s:%(module)s: %(message)s')

# uvloop does not work on windows, so we will use default loop 
if sys.platform != 'win32':
    import uvloop
    asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

app = Flask(__name__)

obj = None
controller = None
terminal = None

def setup1():
    arg_parser = argparse.ArgumentParser(description=__doc__)
    arg_parser.add_argument('option', metavar='OPTION', type=str, nargs=1)
    results = arg_parser.parse_args()

    loop = asyncio.get_event_loop()
    
    if results.option[0] == 'tracker':

        obj = Tracker()
        terminal = TrackerTerminal(obj)

    elif results.option[0] == 'peer':

        obj = Peer()
        loop.run_until_complete(obj.start((get_hostname(), 0)))
        terminal = PeerTerminal(obj)

    else:
        logging.error('Option must either be \'tracker\' or \'peer\'')
        exit(0)
    try:
        loop.run_until_complete(terminal.cmdloop())

    except (KeyboardInterrupt, EOFError):
        pass
    except Exception as e:
        logging.error('{}:{}'.format(type(e).__name__, e))
    finally:
        loop.run_until_complete(obj.stop())
        loop.close()

#######################################################################################
async def setup2():

    arg_parser = argparse.ArgumentParser(description=__doc__)
    arg_parser.add_argument('option', metavar='OPTION', type=str, nargs=1)
    results = arg_parser.parse_args()

    if results.option[0] == 'tracker':

        obj = Tracker()
        controller = TrackerController(obj)

    elif results.option[0] == 'peer':

        obj = Peer()
        await obj.start((get_hostname(), 0))
        controller = PeerController(obj)

    else:
        logging.error('Option must either be \'tracker\' or \'peer\'')
        exit(0)

@app.route('/<action>', methods=['POST', 'GET'])
def perform_action(action):

    arg = request.json
    arg = json.loads(arg)
    try:

        result = asyncio.run(getattr(controller, f'do_{action}')(arg))
        return result
    
    except Exception as e:
        return jsonify({
            'status': 'error', 
            'message': str(e)
        })

def main(app_options = False, port = 8000):

    if not app_options:
        setup1()
    else:
        asyncio.run(setup2())
        app.run(debug=True, port=port)

if __name__ == '__main__':
    main(app_options=True)
