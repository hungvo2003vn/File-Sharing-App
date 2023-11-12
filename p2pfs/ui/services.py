
def get_paths(input_str):
    if '"' in input_str:
        # Split by double quotes and remove empty entries
        paths = [path.strip() for path in input_str.split('"') if path.strip()]
    else:
        # Split by spaces and remove empty entries
        paths = [path.strip() for path in input_str.split(' ') if path.strip()]

    if len(paths) > 0:
        arg = paths[0]
    else:
        arg = None

    if len(paths) > 1:
        arg1 = paths[1]
        if len(paths) > 2:
            # Join the rest of the paths and remove leading/trailing spaces
            arg1 += ' '.join(paths[2:]).strip()
    else:
        arg1 = None

    return arg, arg1

# input_str = "/Users/hungvo/Documents/CODE/PYTHON/Computer_Network/My_Projects/Main/requirements.txt yeyo.txt"
# arg, arg1 = get_paths(input_str)

# print("arg:", arg)
# print("arg1:", arg1)

def download_path(input_str):
    
    arg0, arg1, arg2, arg3 = None, None, None, None
    if "-ip" not in input_str:
        return False, arg0, arg1, arg2, arg3
    
    path, ip = input_str.split('-ip')
    arg0, arg1 = get_paths(path.strip())
    arg2, arg3 = get_paths(ip.strip())
    
    valid = True
    args = [arg0, arg1, arg2, arg3]
    if None in args: valid = False
    
    return valid, arg0, arg1, arg2, arg3



import socket

# def get_hostname():
#     def is_connected():
#         try:
#             # Check if there is an active internet connection by resolving a known host
#             socket.create_connection(("www.google.com", 80), timeout=1)
#             return True
#         except OSError:
#             pass
#         return False

#     if is_connected():
#         print('Run')
#         return socket.gethostbyname(socket.gethostname())
#     else:
#         return '127.0.0.1' # Localhost
    
def get_hostname():

    try:
        # Use a UDP connection to a public DNS server to determine the local IP address
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.connect(('www.google.com', 80))  # Connect to Google's public DNS server
        local_ip = sock.getsockname()[0]
        return local_ip
    except socket.error:
        return '127.0.0.1'  # Return loopback address if connection fails