import sys
import base64
import re
import json


raw_data = sys.argv[1]
image_data = re.sub('^data:image/.+;base64,', '', raw_data)

image = base64.b64decode(image_data)
# do something with image now (its just an image)

with open("debugcommand.txt", "w") as file:
    file.write(raw_data)

with open("debugImage.png", "wb") as fh: # saves to backend/debugImage.png
    fh.write(image)

responseData = {
    "handwritingScore" : 90,
    "rating" : "not bad, work on dotting your is"
}

print(json.dumps(responseData)) # this is the easiest way for me to parse your data