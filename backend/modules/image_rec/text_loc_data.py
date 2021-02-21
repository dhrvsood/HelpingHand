# how to run locally
# python text_loc_data.py $(cat ../../debugcommand.txt)
import base64
import io
import json
import math
import os
import re
import sys
import warnings

import cv2
import numpy as np
import pandas as pd
from deskew import determine_skew
from google.cloud import vision
from google.cloud.vision_v1 import types

warnings.filterwarnings("ignore")

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = r'ServiceAccountToken.json'

client = vision.ImageAnnotatorClient()

content = ""
img = ""

FILE_NAME = 'debugImage.png'
FOLDER_PATH = 'text_images'


def data_uri_to_cv2_img(uri):
    encoded_data = uri.split(',')[1]
    nparr = np.fromstring(encoded_data.decode('base64'), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def load_in_from_cli():
    raw_data = sys.argv[1]
    image_data = re.sub('^data:image/.+;base64,', '', raw_data)

    with open("debugcommand.txt", "w") as file:
        file.write(raw_data)
    img = data_uri_to_cv2_img(raw_data)
    content = base64.b64decode(image_data)

    with open("debugImage.png", "wb") as fh:  # saves to backend/debugImage.png
        fh.write(content)
    return content


def get_old_content():
    # Read original image
    with io.open(os.path.join(FOLDER_PATH, FILE_NAME), 'rb') as image_file:
        content = image_file.read()
    return content


try:  # ez error handling
    # if we have cli, load it - otherwise use the directories and whatnot
    cli_mode = len(sys.argv) > 1
    if (cli_mode):
        content = load_in_from_cli()
    else:
        content = get_old_content()

    image = types.Image(content=content)

    response = client.text_detection(image=image)

    if not cli_mode:
        print(response)

    with open('debug.txt', 'w') as file:
        file.write(str(response))
        file.close()

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


    # -- WIDTH OF CHARACTERS -- #
    def score_width(df):
        thin_chars = ['!', '(', ')', '[', ']', '-', '=', '+', ',', '.', '|',
                      '{', '}', 't', 'i', 'f', 'l', ';', ':', "'", '"', '*',
                      'I']
        normal_chars = ['@', '#', '$', '%', '^', '&', 'q', 'e', 'r', 'y', 'u',
                        'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'z',
                        'x', 'c', 'v', 'b', 'n', '/', '\\', 'Q', 'E', 'R', 'T',
                        'Y', 'U', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J',
                        'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N']
        wide_chars = ['w', 'm', 'W', 'M']

        df_thin = df[df['char'].isin(thin_chars)]
        df_normal = df[df['char'].isin(normal_chars)]
        df_wide = df[df['char'].isin(wide_chars)]
        thin_w = df_thin.w
        normal_w = df_normal.w
        wide_w = df_wide.w

        def calc_score(srs):
            if len(srs) > 1:
                ideal_width = np.median(srs)
                thresh = 1.5 * np.sqrt(1 / len(srs) * sum(
                    (srs - ideal_width) ** 2))
                neg_thresh, pos_thresh = ideal_width - thresh, ideal_width + thresh
                between = srs.between(neg_thresh, pos_thresh, inclusive=True)
                score = round(len(between[between == True]) / len(srs), 2)
                if score == 0:
                    score += 0.001
                return score
            elif len(srs) == 0:
                return 0
            else:
                return 1

        thin_score = calc_score(thin_w)
        normal_score = calc_score(normal_w)
        wide_score = calc_score(wide_w)

        return round(np.mean([s for s in [
            thin_score, normal_score, wide_score] if s != 0]), 2)


    def eval_lower_letter_width():
        lower_case_width_score = score_width(df[df['is_upper'] == False])
        score_str = f'Your lower-case letter-width consistency ' \
                    f'score is: {lower_case_width_score}.'
        if lower_case_width_score <= 0.4:
            score_str += ' Make the widths of your lower-case letters ' \
                         'more consistent.'
        elif 0.4 < lower_case_width_score <= 0.8:
            score_str += ' Your lower-case width consistency is alright. ' \
                         'Keep improving!'
        else:
            score_str += ' Great lower-case width consistency!'
        return score_str


    def eval_upper_letter_width():
        upper_case_width_score = score_width(df[df['is_upper'] == True])
        score_str = f'Your upper-case letter-width consistency ' \
                    f'score is: {upper_case_width_score}.'
        if upper_case_width_score <= 0.4:
            score_str += ' Make the widths of your upper-case letters ' \
                         'more consistent.'
        elif 0.4 < upper_case_width_score <= 0.8:
            score_str += ' Your upper-case width consistency is alright. ' \
                         'Keep improving!'
        else:
            score_str += ' Great upper-case width consistency!'
        return score_str


    # Make sure defaultValue.responseData matches
    # frontend/src/contexts/InsightContext.js
    res = {
        'status': 'success',
        'lower_eval': eval_lower_letter_width(),
        'upper_eval': eval_upper_letter_width(),
    }
    print(json.dumps(res))

except:
    print(json.dumps({'status': 'failed'}))
