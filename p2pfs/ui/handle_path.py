
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

