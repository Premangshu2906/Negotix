import sys
import subprocess
import os

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def process_logo(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # 1. Remove dark background by mapping luminance to alpha
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            lum = (0.299 * r + 0.587 * g + 0.114 * b)
            if lum < 50:
                alpha = int((lum / 50.0) * 255)
                pixels[x, y] = (r, g, b, min(a, alpha))
    
    # 2. Find bounding box of visible logo pixels
    min_x = width
    min_y = height
    max_x = 0
    max_y = 0
    
    # We define visible as having an alpha > 50 and green/blue color dominance
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 80:
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                
    if min_x < max_x and min_y < max_y:
        # Add a small 2% padding
        pad_x = int((max_x - min_x) * 0.02)
        pad_y = int((max_y - min_y) * 0.02)
        min_x = max(0, min_x - pad_x)
        min_y = max(0, min_y - pad_y)
        max_x = min(width, max_x + pad_x)
        max_y = min(height, max_y + pad_y)
        
        # Crop to the tightly bounded box
        img = img.crop((min_x, min_y, max_x, max_y))
        
        # 3. Make the cropped image a perfect square so it rotates beautifully around its center
        crop_w, crop_h = img.size
        size = max(crop_w, crop_h)
        new_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        offset = ((size - crop_w) // 2, (size - crop_h) // 2)
        new_img.paste(img, offset)
        img = new_img

    img.save(out_path, "PNG")
    print(f"Saved processed square logo to {out_path}")

if __name__ == "__main__":
    img_path = r"C:\Users\KIIT\Downloads\WhatsApp Image 2026-03-07 at 12.04.24.jpeg"
    out_path = r"C:\Users\KIIT\OneDrive\Desktop\Antigravity testing\frontend\public\images\custom-logo.png"
    
    process_logo(img_path, out_path)
