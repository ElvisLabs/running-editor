from pathlib import Path

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "poster-original.png"
OUTPUT = ROOT / "assets" / "poster-number-template.png"

# Only these value areas may differ from the supplied screenshot.
VALUE_AREAS = [
    (466, 365, 818, 480),   # 总公里数
    (54, 1352, 432, 1440),  # 总用时
    (697, 1352, 772, 1440), # 总次数（保留“次”）
    (54, 1642, 250, 1730),  # 最远距离（保留“公里”）
    (697, 1642, 1038, 1730) # 平均配速
]


def main():
    image = cv2.imread(str(SOURCE), cv2.IMREAD_COLOR)
    if image is None:
        raise FileNotFoundError(SOURCE)

    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    for x1, y1, x2, y2 in VALUE_AREAS:
        mask[y1:y2, x1:x2] = 255
    template = cv2.inpaint(image, mask, 7, cv2.INPAINT_TELEA)

    if not cv2.imwrite(str(OUTPUT), template):
        raise OSError(f"Could not write {OUTPUT}")

    changed = np.any(template != image, axis=2)
    outside = changed & (mask == 0)
    if np.any(outside):
        raise AssertionError("Template changed pixels outside numeric value areas")

    print(f"{OUTPUT} ({changed.sum()} changed pixels, 0 outside value areas)")


if __name__ == "__main__":
    main()
