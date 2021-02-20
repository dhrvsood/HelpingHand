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


def split_str(text):
    str_list = text.split('\n')
    x_points = []
    y_points = []
    for s in str_list:
        if 'x: ' in s:
            x_points.append(s.strip())
        elif 'y: ' in s:
            y_points.append(s.strip())

    x_dict = {}
    y_dict = {}
    for i, x in enumerate(x_points):
        x_dict['x_' + str(i + 1)] = [
            int(s) for s in x.split() if s.isdigit()
        ][0]

    for i, y in enumerate(y_points):
        y_dict['y_' + str(i + 1)] = [
            int(s) for s in y.split() if s.isdigit()
        ][0]

    x_dict.update(y_dict)
    return x_dict


def merge_dicts(df):
    pos_dicts = []
    for idx, row in df['bound_poly'].iteritems():
        pos_dicts.append(split_str(str(row)))

    d_keys = list(pos_dicts[0].keys())
    final_dict = {k: [] for k in d_keys}

    for d in pos_dicts:
        for k in d_keys:
            final_dict[k].append(d[k])

    return final_dict


merged_dicts = merge_dicts(df)
merged_dicts_df = pd.DataFrame(merged_dicts)
df = pd.concat([df.char, merged_dicts_df], axis=1)
