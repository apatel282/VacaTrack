#!/usr/bin/env python3
"""Generate PWA icons for VacaTrack"""

from PIL import Image, ImageDraw, ImageFont
import os

# Colors from the app
BG_COLOR = (255, 254, 251)  # #fffefb
PRIMARY_COLOR = (0, 102, 140)  # #00668c
ACCENT_COLOR = (113, 196, 239)  # #71c4ef
WHITE = (255, 255, 255)

def generate_icon(size, filepath):
    """Generate a single icon of given size"""
    # Create image with background
    img = Image.new('RGB', (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Calculate dimensions
    center_x = size // 2
    center_y = size // 2
    radius = int(size * 0.35)

    # Draw primary circle
    draw.ellipse(
        [center_x - radius, center_y - radius,
         center_x + radius, center_y + radius],
        fill=PRIMARY_COLOR
    )

    # Draw accent circle
    inner_radius = int(radius * 0.65)
    draw.ellipse(
        [center_x - inner_radius, center_y - inner_radius,
         center_x + inner_radius, center_y + inner_radius],
        fill=ACCENT_COLOR
    )

    # Draw "V" text
    font_size = int(size * 0.5)
    try:
        # Try to use a nice system font
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()

    # Calculate text position
    text = "V"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = center_x - text_width // 2
    text_y = center_y - text_height // 2 - int(size * 0.05)  # Slight adjustment

    # Draw text
    draw.text((text_x, text_y), text, fill=WHITE, font=font)

    # Save
    img.save(filepath, 'PNG')
    print(f"Generated {filepath}")

def main():
    """Generate all required icons"""
    print("Generating VacaTrack PWA icons...\n")

    # Create public directory if it doesn't exist
    os.makedirs('public', exist_ok=True)

    # Generate icons
    generate_icon(192, 'public/pwa-192x192.png')
    generate_icon(512, 'public/pwa-512x512.png')
    generate_icon(180, 'public/apple-touch-icon.png')
    generate_icon(64, 'public/favicon.png')

    # Also create a 32x32 favicon
    generate_icon(32, 'public/favicon.ico')

    print("\n✅ All icons generated successfully!")
    print("\nNote: These are placeholder icons. Consider replacing them with")
    print("professionally designed icons for production use.")

if __name__ == '__main__':
    try:
        main()
    except ImportError:
        print("Error: PIL (Pillow) library is required.")
        print("Install it with: pip3 install Pillow")
        exit(1)
    except Exception as e:
        print(f"Error: {e}")
        exit(1)
