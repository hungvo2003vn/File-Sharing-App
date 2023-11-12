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
loop = None

def setup1():

    global obj, terminal, loop
    
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
@app.route('/<action>', methods=['POST', 'GET'])
def perform_action(action):

    arg = request.json

    try:
        # result = asyncio.run(getattr(controller, f'do_{action}')(arg))
        result = loop.run_until_complete(getattr(controller, f'do_{action}')(arg))
        return result
    
    except Exception as e:
        return jsonify({
            'status': 'error', 
            'message': str(e)
        })
    
def setup2():

    global obj, controller, loop

    arg_parser = argparse.ArgumentParser(description=__doc__)
    arg_parser.add_argument('option', metavar='OPTION', type=str, nargs=1)
    results = arg_parser.parse_args()

    loop = asyncio.get_event_loop()

    if results.option[0] == 'tracker':

        obj = Tracker()
        controller = TrackerController(obj)

    elif results.option[0] == 'peer':

        obj = Peer()
        loop.run_until_complete(obj.start((get_hostname(), 0)))
        print("Peer Address: ", obj._server_address)
        controller = PeerController(obj)

    else:
        logging.error('Option must either be \'tracker\' or \'peer\'')
        exit(0)
    
    try:
        loop.run_until_complete(app.run(debug=True, port=0))

    except (KeyboardInterrupt, EOFError):
        pass
    except Exception as e:
        logging.error('{}:{}'.format(type(e).__name__, e))
    # finally:
    #     loop.run_until_complete(obj.stop())
    #     loop.close()
    

#######################################################################################
tracker_obj = None
peer_obj = None
tracker_controller = None
peer_controller = None

@app.route('/<option>/<action>', methods=['POST', 'GET'])
def perform_action2(option, action):

    arg = request.json

    try:

        if option == 'tracker':
            runner = tracker_controller
        elif option == 'peer':
            runner = peer_controller
        else:
            raise ResourceWarning
        
        result = loop.run_until_complete(getattr(runner, f'do_{action}')(arg))
        
        return result
    
    except Exception as e:
        return jsonify({
            'status': 'error', 
            'message': str(e)
        })

def setup3():

    global tracker_obj, peer_obj, tracker_controller, peer_controller, loop

    arg_parser = argparse.ArgumentParser(description=__doc__)
    arg_parser.add_argument('option', metavar='OPTION', type=str, nargs=1)
    results = arg_parser.parse_args()

    loop = asyncio.get_event_loop()

    if results.option[0] == 'all':

        tracker_obj = Tracker()
        tracker_controller = TrackerController(tracker_obj)

        peer_obj = Peer()
        loop.run_until_complete(peer_obj.start((get_hostname(), 0)))
        print("Peer Address: ", peer_obj._server_address)
        peer_controller = PeerController(peer_obj)

    else:
        logging.error('Option must be \'all\'')
        exit(0)
    
    try:
        loop.run_until_complete(app.run(debug=True, port=0))

    except (KeyboardInterrupt, EOFError):
        pass
    except Exception as e:
        logging.error('{}:{}'.format(type(e).__name__, e))
#######################################################################################
from aiohttp import web

app_aio = web.Application()
# Create a Flask app for the application context
flask_app = Flask(__name__)

# Custom middleware to set up Flask's application context
async def flask_middleware(app, handler):
    async def middleware_handler(request):
        with flask_app.app_context():
            return await handler(request)
    return middleware_handler

# Apply the middleware to the aiohttp app
app_aio.middlewares.append(flask_middleware)

async def perform_action4(arg):
    print(arg)
    args = await arg.json()

    try:
        with flask_app.app_context():
            result = await getattr(controller, f'do_{arg.match_info["action"]}')(args)
            result = result.get_json()
            return web.json_response(result)

    except Exception as e:
        return web.json_response({
            'status': 'error', 
            'message': str(e)
        })

async def setup4():
    global obj, controller, loop

    arg_parser = argparse.ArgumentParser(description=__doc__)
    arg_parser.add_argument('option', metavar='OPTION', type=str, nargs=1)
    results = arg_parser.parse_args()


    if results.option[0] == 'tracker':
        obj = Tracker()
        controller = TrackerController(obj)
    elif results.option[0] == 'peer':
        obj = Peer()
        await obj.start((get_hostname(), 0))
        print("Peer Address: ", obj._server_address)
        controller = PeerController(obj)
    else:
        logging.error('Option must either be \'tracker\' or \'peer\'')
        exit(0)

    app_aio.router.add_post('/{action}', perform_action4)

    runner = web.AppRunner(app_aio)
    await runner.setup()
    site = web.TCPSite(runner, '127.0.0.1', 0)
    await site.start()
    
    print(f"Server started at http://{site._server.sockets[0].getsockname()[0]}:{site._server.sockets[0].getsockname()[1]}")

    try:
        await asyncio.Event().wait()
    except asyncio.CancelledError:
        await runner.cleanup()
        pass

#######################################################################################
def main(app_options = False):

    if not app_options:
        setup1()
    else:
        # setup2()
        # setup3()
        asyncio.run(setup4())

if __name__ == '__main__':
    main(app_options=True)
