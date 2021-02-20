import sys

import base64
my_str_as_bytes = str.encode(sys.argv[1])

img_data = my_str_as_bytes

with open("imageToSave.png", "wb") as fh:
    fh.write(base64.decodebytes(img_data))