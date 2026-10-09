import base64
from PIL import Image
import os
import glob
import re

src_img_path = r'C:\Users\OB5\.gemini\antigravity\brain\460cd199-beba-4a36-bd63-5bb992b4c045\.user_uploaded\media_1791536720234_4d8d65a8.jpg'
dest_dir = r'D:\Desktop\opay\public'
assets_dir = r'D:\Desktop\opay\public\assets'

img = Image.open(src_img_path)
img = img.convert('RGB')

# Google Search requires a multiple of 48px, let's use 192x192
img.resize((192, 192)).save(f'{dest_dir}/favicon-192x192.png', 'PNG')
img.resize((512, 512)).save(f'{dest_dir}/favicon-512x512.png', 'PNG')
img.resize((48, 48)).save(f'{dest_dir}/favicon-48x48.png', 'PNG')

# Let's replace the link rel="icon" in all HTML files
html_files = glob.glob('D:/Desktop/opay/**/*.html', recursive=True)
for file_path in html_files:
    if 'node_modules' in file_path:
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the existing icon tag with a more standard one
    # Assuming it has <link rel="icon" type="image/png" href="/penguinpay-logo.png" />
    content = re.sub(
        r'<link rel="icon" type="image/png" href=".*?" />',
        '<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />',
        content
    )
    # Also if it's using favicon.ico in shortcut icon, keep it or standardise it
    content = re.sub(
        r'<link rel="shortcut icon" href=".*?" />',
        '<link rel="icon" href="/favicon.ico" type="image/x-icon" />',
        content
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print('Done fixing favicons for Google.')
