import sys
import subprocess
import os

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def remove_background(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # We want to make the dark background transparent.
    # The logo has bright cyan/green colors.
    # We can map the brightness of the pixel to its alpha value.
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Simple luminance
            lum = (0.299 * r + 0.587 * g + 0.114 * b)
            
            # The background is very dark.
            if lum < 40:
                # scale alpha
                alpha = int((lum / 40.0) * 255)
                pixels[x, y] = (r, g, b, min(a, alpha))
            else:
                # keep fully opaque if it's bright
                pass
                
    img.save(out_path, "PNG")
    print(f"Saved transparent image to {out_path}")

if __name__ == "__main__":
    img_path = r"C:\Users\KIIT\OneDrive\Desktop\Antigravity testing\frontend\public\images\custom-logo.png"
    out_path = r"C:\Users\KIIT\OneDrive\Desktop\Antigravity testing\frontend\public\images\custom-logo.png"
    
    # Backup original just in case
    import shutil
    shutil.copy(img_path, img_path + ".bak")
    
    remove_background(img_path, out_path)
