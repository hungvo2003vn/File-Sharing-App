import os
from flask import jsonify
from asyncio import IncompleteReadError
from p2pfs.core.tracker import Tracker
from p2pfs.core.peer import Peer
from p2pfs.core.exceptions import *
from p2pfs.ui.services import get_paths, download_path, get_hostname

class TrackerController():

    def __init__(self, tracker):
        assert isinstance(tracker, Tracker)
        self._tracker = tracker
        super().__init__()

    async def do_start(self, host, port):
        try:
            await self._tracker.start((host, int(port)))

            return jsonify({
                'status': 'success',
                'message': f'Tracker started listening on {self._tracker.address()}'
            
            })
        
        except ServerRunningError:
            return jsonify({
                'status': 'error', 
                'message': 'Tracker is already running.'
            })
        
        except OSError as e:

            if e.errno == 48:
                return jsonify({
                    'status': 'error', 
                    'message': f'Cannot bind on address {host}:{port}.'
                })
            else:
                return jsonify({
                    'status': 'error', 
                    'message': str(e)
                })
    
    async def do_ping(self, host, port):

        try:
            target_address = (host, int(port))
            end_packet = await self._tracker.ping(target_address)
            end_packet_in_ms = round(end_packet * 1000, 3)

            return jsonify({
                'status': 'success',
                'message': f'Received packet from {target_address} in {end_packet_in_ms}ms'
            })
        except ConnectionRefusedError:
            return jsonify({
                'status': 'error',
                'message': f'Hostname with address {target_address} refused to connect!'
            })
        except (ConnectionError, RuntimeError):
            return jsonify({
                'status': 'error',
                'message': f'Error while sending packet to hostname {target_address}'
            })
        except AssertionError:
            return jsonify({
                'status': 'error',
                'message': f'Error while receiving packet from hostname {target_address}'
            })
                

    async def do_list_files(self): #GET

        try:
            file_list_dict = self._tracker.file_list()
            return jsonify({
                'status': 'success',
                'data': file_list_dict
            })
        except Exception as e:
            return jsonify({
                'status': 'error', 
                'message': str(e)
            })
    
    async def do_discover(self, host, port):

        try:
            file_list_dict = await self._tracker.discover((host, int(port)))
            return jsonify({
                'status': 'success',
                'data': file_list_dict
            })
        except Exception as e:
            return jsonify({
                'status': 'error', 
                'message': str(e)
            })


    async def do_list_peers(self, arg):

        try:
            peers = self._tracker.peers()
            return jsonify({
                'status': 'success',
                'data': peers
            })
        except Exception as e:
            return jsonify({
                'status': 'error', 
                'message': str(e)
            })


    async def do_list_chunkinfo(self, arg):

        self._tracker.chunkinfo()
        
    async def do_exit(self, arg):
        await self._tracker.stop()
        return True