import io
import math
import os

import cv2
import numpy as np
import pandas as pd
from deskew import determine_skew
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

bound_text = response.text_annotations[0].bounding_poly
bound_width = bound_text.vertices[2].x - bound_text.vertices[0].x
bound_height = bound_text.vertices[2].y - bound_text.vertices[0].y


def deskew(img, theta, bkg):
    old_w, old_h = img.shape[:2]
    theta_rad = math.radians(theta)
    width = abs(np.sin(theta_rad) * old_h) + abs(np.cos(theta_rad) * old_w)
    height = abs(np.sin(theta_rad) * old_w) + abs(np.cos(theta_rad) * old_h)

    image_center = tuple(np.array(img.shape[1::-1]) / 2)
    rot_mat = cv2.getRotationMatrix2D(image_center, theta, 1.0)
    rot_mat[1, 2] += (width - old_w) / 2
    rot_mat[0, 2] += (height - old_h) / 2
    return cv2.warpAffine(img, rot_mat, (int(
        round(height)), int(round(width))), borderValue=bkg)


img = cv2.imread(os.path.join(FOLDER_PATH, FILE_NAME))
grayscale = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
angle = determine_skew(grayscale)

# Deskewed image
rotated = deskew(img, angle, (0, 0, 0))

if bound_height > bound_width:
    rotated = np.rot90(rotated)

deskewed_fname = os.path.join(FOLDER_PATH, ('deskewed_' + FILE_NAME + '.png'))
cv2.imwrite(deskewed_fname, rotated)

with io.open(deskewed_fname, 'rb') as image_file:
    content = image_file.read()

image = types.Image(content=content)
response = client.text_detection(image=image)

blocks = response.text_annotations[1:]
paras = response.full_text_annotation.pages[0].blocks[0].paragraphs

char_list = []
bound_poly = []
conf_scores = []

is_upper = []
words = []
bound_poly_w = []
conf_scores_w = []

for b in blocks:
    words.append(b.description)
    bound_poly_w.append(b.bounding_poly)
    conf_scores_w.append(b.confidence)

for p in paras:
    for w in p.words:
        for c in w.symbols:
            if 'detected_break' in c.property and \
                    c.property.detected_break.type_.name == 'SPACE':
                char_list.append(c.text)
                char_list.append('SP')
                for i in range(2):
                    bound_poly.append(c.bounding_box)
                for i in range(2):
                    conf_scores.append(c.confidence)
                if c.text.isupper():
                    for i in range(2):
                        is_upper.append(1)
                else:
                    for i in range(2):
                        is_upper.append(0)
            else:
                if c.text.isupper():
                    is_upper.append(1)
                else:
                    is_upper.append(0)
                char_list.append(c.text)
                bound_poly.append(c.bounding_box)
                conf_scores.append(c.confidence)

df = pd.DataFrame({
    'char': char_list,
    'bound_poly': bound_poly,
    'conf': conf_scores,
    'is_upper': is_upper
})

words_df = pd.DataFrame({
    'word': words,
    'bound_poly': bound_poly_w,
    'conf': conf_scores_w
})


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
df = pd.concat([df.char, merged_dicts_df, df.conf, df.is_upper], axis=1)

merged_dicts_w = merge_dicts(words_df)
merged_dicts_w_df = pd.DataFrame(merged_dicts_w)
words_df = pd.concat([words_df.word, merged_dicts_w_df, words_df.conf], axis=1)

df['w'] = df[['x_1', 'x_2']].max(axis=1) - df[['x_3', 'x_4']].min(axis=1)
df['h'] = df[['y_2', 'y_3']].max(axis=1) - df[['y_1', 'y_4']].min(axis=1)
