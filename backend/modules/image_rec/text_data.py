import io
import os

import pandas as pd
from google.cloud import vision
from google.cloud.vision_v1 import types

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = r'ServiceAccountToken.json'

client = vision.ImageAnnotatorClient()

FILE_NAME = 'demo1.jpeg'
FOLDER_PATH = 'text_images'

with io.open(os.path.join(FOLDER_PATH, FILE_NAME), 'rb') as image_file:
    content = image_file.read()


image = types.Image(content=content)

response = client.text_detection(image=image)
paras = response.full_text_annotation.pages[
    0].blocks[
    0].paragraphs

char_list = []
bound_poly = []

for p in paras:
    for w in p.words:
        for c in w.symbols:
            if 'detected_break' in c.property and \
                    c.property.detected_break.type_.name == 'SPACE':
                char_list.append(c.text)
                char_list.append('SP')
                bound_poly.append(c.bounding_box)
                bound_poly.append(c.bounding_box)
            else:
                char_list.append(c.text)
                bound_poly.append(c.bounding_box)


df = pd.DataFrame({'char': char_list, 'bound_poly': bound_poly})
# for t in text:
#     df = df.append(
#         dict(
#             char=char_list,
#             bounding_poly=bound_poly
#         ),
#         ignore_index=True
#     )
