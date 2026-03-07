import cv2
import numpy as np

def extract_logo(input_path, output_path):
    # Read the image
    img = cv2.imread(input_path)
    if img is None:
        print(f"Failed to load image at {input_path}")
        return

    # Convert to HSV color space
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # Define the color ranges for the logo (blue, green, cyan)
    # The fabric is very dark, so we filter out dark pixels
    lower_color = np.array([30, 40, 40])
    upper_color = np.array([150, 255, 255])
    
    # Create a mask
    mask = cv2.inRange(hsv, lower_color, upper_color)

    # Clean up the mask with morphological operations
    kernel = np.ones((5,5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_DILATE, kernel, iterations=1)
    
    # Find contours to get the exact bounding box
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        print("No logo found!")
        return
        
    # Get the largest contour assuming it's the logo
    c = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(c)

    # Add 5% padding
    pad_w = int(w * 0.05)
    pad_h = int(h * 0.05)
    
    x1 = max(0, x - pad_w)
    y1 = max(0, y - pad_h)
    x2 = min(img.shape[1], x + w + pad_w)
    y2 = min(img.shape[0], y + h + pad_h)

    # Crop the original image and the mask
    cropped_img = img[y1:y2, x1:x2]
    cropped_mask = mask[y1:y2, x1:x2]

    # Add an alpha channel correctly
    b, g, r = cv2.split(cropped_img)
    # Give the mask a soft blur for smooth edges
    alpha = cv2.GaussianBlur(cropped_mask, (5, 5), 0)
    
    rgba = cv2.merge((b, g, r, alpha))
    
    # Make it a perfect square
    h_c, w_c = rgba.shape[:2]
    size = max(h_c, w_c)
    
    square = np.zeros((size, size, 4), dtype=np.uint8)
    y_off = (size - h_c) // 2
    x_off = (size - w_c) // 2
    
    square[y_off:y_off+h_c, x_off:x_off+w_c] = rgba

    # Save to disk
    cv2.imwrite(output_path, square)
    print(f"Successfully saved cleanly cropped logo to {output_path}")

if __name__ == "__main__":
    img_path = r"C:\Users\KIIT\Downloads\WhatsApp Image 2026-03-07 at 12.04.24.jpeg"
    out_path = r"C:\Users\KIIT\OneDrive\Desktop\Antigravity testing\frontend\public\images\custom-logo.png"
    extract_logo(img_path, out_path)
