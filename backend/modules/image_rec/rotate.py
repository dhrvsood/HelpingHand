import math

import cv2
import numpy as np
from deskew import determine_skew

FILE_NAME = 'demo1.jpeg'
FOLDER_PATH = 'text_images'


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


# image = cv2.imread(os.path.join(FOLDER_PATH, FILE_NAME))
grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
angle = determine_skew(grayscale)
rotated = deskew(image, angle, (0, 0, 0))
cv2.imshow('rotated', rotated)
cv2.waitKey()
cv2.imwrite('output.png', rotated)
