import logging
import json
import asyncio
from p2pfs.core.server import MessageServer
from p2pfs.core.message import MessageType, read_message, write_message
logger = logging.getLogger(__name__)


class Tracker(MessageServer):
    def __init__(self):
        super().__init__()
        # {writer -> address}
        self._peers = {}
        # {primary_key -> fileinfo(size, total_chunknum, author_address, local_file, filename)}
        self._file_list = {}
        # {primary_key -> {(address) -> chunknum}}  :(primary_key = filename + address)
        self._chunkinfo = {}

    def file_list(self):
        return self._file_list
    
    async def discover(self, peer_address):
        
        local_file_peers = {}
        for primary_key in self._file_list.keys():
            target_address = self._file_list[primary_key]['author_address']

            if target_address[0] == peer_address[0] and target_address[1] == peer_address[1]:
                local_file_peers[primary_key] = self._file_list[primary_key]

        return local_file_peers


    def chunkinfo(self):
        return self._chunkinfo

    def peers(self):
        return tuple(self._peers.values())

    def address(self):
        return self._server_address
    
    # def ping(self, hostname):



    def _reset(self):
        self._peers = {}
        self._file_list = {}
        self._chunkinfo = {}

    async def stop(self):
        await super().stop()
        if len(self._peers) != 0:
            logger.warning('Peers dict not fully cleared {}'.format(self._peers))

        self._reset()

    async def _process_connection(self, reader, writer):

        assert isinstance(reader, asyncio.StreamReader) and isinstance(writer, asyncio.StreamWriter)
        logger.info('New connection from {}'.format(writer.get_extra_info('peername')))
        self._peers[writer] = None

        try:
            while not reader.at_eof():
                message = await read_message(reader)
                message_type = MessageType(message['type'])

                if message_type == MessageType.REQUEST_REGISTER:
                    # peer_address is a string, since JSON requires keys being strings
                    self._peers[writer] = json.dumps(message['address'])
                    await write_message(writer, {
                        'type': MessageType.REPLY_REGISTER
                    })
                    logger.debug(self._peers.values())

                elif message_type == MessageType.REQUEST_PUBLISH:
                    if message['primary_key'] in self._file_list:

                        await write_message(writer, {
                            'type': MessageType.REPLY_PUBLISH,
                            'filename': message['fileinfo']['filename'],
                            'result': False
                        })

                    else:
                        self._file_list[message['primary_key']] = message['fileinfo']
                        # add to chunkinfo
                        # TODO: optimize how the chunknums are stored
                        self._chunkinfo[message['primary_key']] = {
                            self._peers[writer]: list(range(0, message['fileinfo']['total_chunknum']))
                        }
                        await write_message(writer, {
                            'type': MessageType.REPLY_PUBLISH,
                            'filename': message['fileinfo']['filename'],
                            'result': True,
                        })
                        logger.info('{} published file {} of {} chunks'
                                    .format(self._peers[writer], message['fileinfo']['filename'], message['fileinfo']['total_chunknum']))
                        
                elif message_type == MessageType.REQUEST_FILE_LIST:
                    await write_message(writer, {
                        'type': MessageType.REPLY_FILE_LIST,
                        'file_list': self._file_list
                    })
                
                elif message_type == MessageType.REQUEST_DISCOVER:
                    await write_message(writer, {
                        'type': MessageType.REPLY_DISCOVER,
                        'file_list': await self.discover(message['address'])
                    })

                elif message_type == MessageType.REQUEST_FILE_LOCATION:
                    await write_message(writer, {
                        'type': MessageType.REPLY_FILE_LOCATION,
                        'fileinfo': self._file_list[message['primary_key']],
                        'chunkinfo': self._chunkinfo[message['primary_key']]
                    })

                elif message_type == MessageType.REQUEST_CHUNK_REGISTER:
                    
                    peer_address = self._peers[writer]

                    if message['primary_key'] not in self._chunkinfo:
                        logger.warning('REQUEST_CHUNK_REGISTER with non-existing file.')
                        continue

                    if peer_address in self._chunkinfo[message['primary_key']]:
                        if message['chunknum'] not in self._chunkinfo[message['primary_key']][peer_address]:
                            self._chunkinfo[message['primary_key']][peer_address].append(message['chunknum'])

                    else:
                        self._chunkinfo[message['primary_key']][peer_address] = [message['chunknum']]

                else:
                    logger.error('Undefined message: {}'.format(message))


        except (asyncio.IncompleteReadError, ConnectionError, RuntimeError):
            # error occurred when reading/writing to peers, log the error and do cleanup
            logger.warning('{} disconnected.'.format(self._peers[writer]))

        finally:
            peer_address = self._peers[writer]
            # iterate over chunkinfo and remove the chunks this peer has
            files_to_remove = []
            for primary_key, peer_possession_dict in self._chunkinfo.items():

                if peer_address in peer_possession_dict:
                    del self._chunkinfo[primary_key][peer_address]
                    if len(self._chunkinfo[primary_key]) == 0:
                        files_to_remove.append(primary_key)

            # remove file on tracker if no peers have that
            for key in files_to_remove:
                del self._chunkinfo[key]
                del self._file_list[key]

            del self._peers[writer]
