import base64
from PIL import Image
import io
import os

src_img_path = r'C:\Users\OB5\.gemini\antigravity\brain\460cd199-beba-4a36-bd63-5bb992b4c045\.user_uploaded\media_1791536720234_4d8d65a8.jpg'
dest_dir = r'D:\Desktop\opay\public'
assets_dir = r'D:\Desktop\opay\public\assets'

os.makedirs(assets_dir, exist_ok=True)

# Open the image
img = Image.open(src_img_path)
img = img.convert('RGB')

# Save as PNGs
img.save(f'{dest_dir}/penguinpay-logo.png', 'PNG')
img.save(f'{assets_dir}/penguinpay-logo.png', 'PNG')

img.save(f'{dest_dir}/penguinpay-og.png', 'PNG')
img.save(f'{assets_dir}/penguinpay-og.png', 'PNG')

img.resize((180, 180)).save(f'{dest_dir}/apple-touch-icon.png', 'PNG')
img.resize((32, 32)).save(f'{dest_dir}/favicon.png', 'PNG')

# Save as ICO
img.resize((32, 32)).save(f'{dest_dir}/favicon.ico', format='ICO', sizes=[(32,32)])

# Create base64 for SVG
buffered = io.BytesIO()
img.save(buffered, format='PNG')
img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {img.width} {img.height}">
  <image href="data:image/png;base64,{img_str}" width="{img.width}" height="{img.height}" />
</svg>'''

with open(f'{dest_dir}/penguinpay-logo.svg', 'w') as f:
    f.write(svg_content)
with open(f'{assets_dir}/penguinpay-logo.svg', 'w') as f:
    f.write(svg_content)

print('Done converting and placing logos.')
