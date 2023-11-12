import os
from flask import jsonify
from asyncio import IncompleteReadError
from p2pfs.core.tracker import Tracker
from p2pfs.core.peer import Peer
from p2pfs.core.exceptions import *
from p2pfs.ui.services import get_paths, download_path, get_hostname
import logging

class TrackerController():

    def __init__(self, tracker):
        assert isinstance(tracker, Tracker)
        self._tracker = tracker

    async def do_start(self, arg = {}): #POST

        recommend = None
        hostname = get_hostname()
        if hostname == '127.0.0.1':
            recommend = 'Recommend running on localhost 127.0.0.1'
        else:
            recommend = 'Recommend running on ip {} or localhost 127.0.0.1'.format(hostname)

        if not arg.get('host') or not arg.get('port'):
            return jsonify({
                'status': 'error',
                'message': f'Missing <host> or <port>',
                'recommend': recommend
            })
        host = arg['host']
        port = arg['port']

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
                    'message': f'Cannot bind on address {host}:{port}.',
                    'recommend': recommend
                })
            else:
                return jsonify({
                    'status': 'error', 
                    'message': str(e)
                })
        except Exception as e:
            
            return jsonify({
                'status': 'error', 
                'message': str(e)
            })
    
    async def do_ping(self, arg = {}): #GET

        if not arg.get('host') or not arg.get('port'):

            return jsonify({
                'status': 'error',
                'message': f'Missing <host> or <port>'
            
            })
        host = arg['host']
        port = arg['port']

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
        
        except Exception as e:
            
            return jsonify({
                'status': 'error', 
                'message': str(e)
            })
                

    async def do_list_files(self, arg={}): #GET

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
    
    async def do_discover(self, arg={}): #GET

        if not arg.get('host') or not arg.get('port'):

            return jsonify({
                'status': 'error',
                'message': f'Missing <host> or <port>'
            
            })
        host = arg['host']
        port = arg['port']

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


    async def do_list_peers(self, arg={}): #GET

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


    async def do_list_chunkinfo(self, arg={}): #GET

        
        try:
            chunkinfo = self._tracker.chunkinfo()
            return jsonify({
                'status': 'success',
                'data': chunkinfo
            })
        except Exception as e:
            return jsonify({
                'status': 'error', 
                'message': str(e)
            })

    async def do_exit(self, arg={}): #POST

        try:
            await self._tracker.stop()

            return jsonify({
                'status': 'success', 
                'message': 'Tracker stopped'
            })
        
        except Exception as e:
            return jsonify({
                'status': 'error', 
                'message': str(e)
            })
    
        # return True

###############################################################################################################
class PeerController():
    
    def __init__(self, peer):
        assert isinstance(peer, Peer)
        self._peer = peer
    
    async def do_connect(self, arg={}): #POST

        if not arg.get('host') or not arg.get('port'):

            return jsonify({
                'status': 'error',
                'message': f'Missing <host> or <port>'
            
            })
        
        host = arg['host']
        port = arg['port']

        try:
            await self._peer.connect((host, int(port)))
            return jsonify({
                'status': 'success', 
                'message': 'Successfully connected!'
            })
        
        except AlreadyConnectedError as e:

            return jsonify({
                'status': 'error', 
                'message': f'Peer already connected to {e.address}.'
            })
        
        except ConnectionRefusedError:
            return jsonify({
                'status': 'error', 
                'message': 'Cannot connect to tracker.'
            })
        except (ConnectionError, RuntimeError, IncompleteReadError, AssertionError):
            return jsonify({
                'status': 'error', 
                'message': 'Error occurred during communications with tracker.'
            })
        
        except Exception as e:
            return jsonify({
                'status': 'error', 
                'message': str(e)
            })
    

    async def do_set_delay(self, arg={}): #POST

        if not arg.get('delay'):

            return jsonify({
                'status': 'error',
                'message': f'Missing <delay>'
            
            })
        
        delay = arg['delay']

        try:
            self._peer.set_delay(float(arg))
            return jsonify({
                'status': 'success',
                'message': f'Delay {delay} successfully set.'
            })
        except Exception as e:
            return jsonify({
                'status': 'error', 
                'message': str(e)
            })
    
    async def do_list_files(self, arg={}): #GET

        try:
            file_list_dict = await self._peer.list_file()
            return jsonify({
                'status': 'success',
                'data': file_list_dict
            })
        
        except TrackerNotConnectedError:
            return jsonify({
                'status': 'error', 
                'message': 'Tracker is not connected, try \'connect <tracker_ip> <tracker_port>\' to connect.'
            })
        except (ConnectionError, RuntimeError, IncompleteReadError):
            return jsonify({
                'status': 'error', 
                'message': 'Error occurred during communications with tracker, try \'connect <tracker_ip> <tracker_port>\' to re-connect.'
            })
        except Exception as e:
            return jsonify({
                'status': 'error', 
                'message': str(e)
            })
    
    async def do_discover(self, arg={}): #GET

        if not arg.get('host') or not arg.get('port'):

            return jsonify({
                'status': 'error',
                'message': f'Missing <host> or <port>'
            
            })
        host = arg['host']
        port = arg['port']

        try:
            file_list_dict = await self._peer.discover((host, int(port)))
            return jsonify({
                'status': 'success',
                'data': file_list_dict
            })
        
        except TrackerNotConnectedError:
            return jsonify({
                'status': 'error', 
                'message': 'Tracker is not connected, try \'connect <tracker_ip> <tracker_port>\' to connect.'
            })
        except (ConnectionError, RuntimeError, IncompleteReadError):
            return jsonify({
                'status': 'error', 
                'message': 'Error occurred during communications with tracker, try \'connect <tracker_ip> <tracker_port>\' to re-connect.'
            })
        except Exception as e:
            return jsonify({
                'status': 'error', 
                'message': str(e)
            })

    async def do_publish(self, arg={}): #POST

        if not arg.get('lname') or not arg.get('fname'):

            return jsonify({
                'status': 'error',
                'message': f'Missing <lname> or <fname>'
            })
        
        lname = arg['lname']
        fname = arg['fname']

        try:
            await self._peer.publish(lname, fname)
            return jsonify({'status': 'success', 'message': f'File {fname} successfully published on tracker.'})
        except FileNotFoundError:
            return jsonify({'status': 'error', 'message': f'File {fname} doesn\'t exist.'})
        except FileExistsError:
            return jsonify({'status': 'error', 'message': f'File {fname} already registered on tracker, use \'list_files\' to see.'})
        except TrackerNotConnectedError:
            return jsonify({'status': 'error', 'message': 'Tracker is not connected. Use \'connect <tracker_ip> <tracker_port> to connect.\' '})
        except (ConnectionError, RuntimeError, IncompleteReadError):
            return jsonify({'status': 'error', 'message': 'Error occurred during communications with tracker, try to re-connect.'})
        except InProgressError:
            return jsonify({'status': 'error', 'message': f'Publish file {fname} already in progress.'})
        except Exception as e:
            return jsonify({
                'status': 'error', 
                'message': str(e)
            })
        
    async def do_fetch(self, arg={}): #POST

        if not arg.get('fname') or not arg.get('destination') \
            or not arg.get('peer_ip') or not arg.get('peer_port'):

            return jsonify({
                'status': 'error',
                'message': f'Missing <fname>, <destination>, <peer_ip> or <peer_port>'
            })
        
        fname = arg['fname']
        destination = arg['destination']
        peer_ip = arg['peer_ip']
        peer_port = arg['peer_port']
        peer_address = [peer_ip, peer_port]

        from tqdm import tqdm
        def tqdm_hook_wrapper(t):
            last_chunk = [0]

            def update_to(chunknum=1, chunksize=1, tsize=None):
                if tsize is not None:
                    t.total = tsize
                t.update((chunknum - last_chunk[0]) * chunksize)
                last_chunk[0] = chunknum
                
            return update_to #Return function

        try:
            with tqdm(unit='B', unit_scale=True, unit_divisor=1024, miniters=1, desc='Downloading ...') as t:

                hook = tqdm_hook_wrapper(t) if logging.getLogger().getEffectiveLevel() != logging.DEBUG else None
                await self._peer.download(fname, peer_address, destination, reporthook=hook)

            return jsonify({'status': 'success', 'message': 'File {} successfully downloaded to {}.'.format(fname, destination)})
        
        except TrackerNotConnectedError:
            return jsonify({'status': 'error', 'message': 'Tracker not connected, cannot pull initial chunk information.'})
        except FileNotFoundError:
            return jsonify({'status': 'error', 'message': 'File {} doesn\'t exist, please check filename and try again.'.format(fname)})
        except FileExistsError:
            return jsonify({'status': 'error', 'message': 'File {} existed in your repository, please choose another filename and try again.'.format(fname)})
        except (IncompleteReadError, ConnectionError, RuntimeError):
            return jsonify({'status': 'error', 'message': 'Error occurred during transmission.'})
        except DownloadIncompleteError as e:

            try:
                os.remove(destination)
            except FileNotFoundError:
                pass

            return jsonify({'status': 'error', 'message': 'File chunk # {} doesn\'t exist on any peers, download isn\'t completed.'.format(e.chunknum)})
        
        except Exception as e:
            return jsonify({
                'status': 'error', 
                'message': str(e)
            })

    async def do_exit(self, arg): #POST

        try:
            await self._peer.stop()
            return jsonify({
                'status': 'success', 
                'message': 'Peer stopped'
            })
        except Exception as e:
            return jsonify({
                'status': 'error', 
                'message': str(e)
            })
    
        # return True