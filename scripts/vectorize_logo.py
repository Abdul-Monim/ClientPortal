import cv2
import numpy as np

im = cv2.imread(r'c:/Users/User/Documents/Obsidian/ASE/Brain/11_Side_Proj/ClientPortal/public/brand-logo-dark-cropped.png', cv2.IMREAD_UNCHANGED)
alpha = (im[:, :, 3] > 128).astype(np.uint8)

contours, hierarchy = cv2.findContours(alpha, cv2.RETR_TREE, cv2.CHAIN_APPROX_TC89_KCOS)

svg_paths = []
for i, c in enumerate(contours):
    pts = c.reshape(-1, 2)
    path_data = f'M {pts[0][0]} {pts[0][1]} ' + ' '.join([f'L {p[0]} {p[1]}' for p in pts[1:]]) + ' Z'
    svg_paths.append(path_data)

full_d = ' '.join(svg_paths)
svg_str = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 274 274" fill="currentColor" fill-rule="evenodd">
  <path d="{full_d}" />
</svg>'''

with open(r'c:/Users/User/Documents/Obsidian/ASE/Brain/11_Side_Proj/ClientPortal/public/brand-logo.svg', 'w') as f:
    f.write(svg_str)

print('SVG written to public/brand-logo.svg, length:', len(svg_str))
