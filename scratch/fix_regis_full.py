from PIL import Image

def remove_all_checkerboard():
    # Load original image afresh if available, or current image
    try:
        img = Image.open('public/regis.webp').convert('RGBA')
    except Exception:
        img = Image.open('public/regis.png').convert('RGBA')

    width, height = img.size
    pixels = img.load()

    cleaned_count = 0
    for x in range(width):
        for y in range(height):
            r, g, b, a = pixels[x, y]

            # The 3D green icon uses strong green/teal hues (G > R and G > B) or darker blue/teal.
            # Light grey/white checkerboard pixels have high RGB (> 180) and low color difference (< 40).
            is_checkerboard = (
                r > 180 and g > 180 and b > 180 and
                (max(r, g, b) - min(r, g, b)) < 40
            )

            # Soft edge smoothing for anti-aliasing near green icon
            if is_checkerboard:
                pixels[x, y] = (255, 255, 255, 0)
                cleaned_count += 1
            elif r > 160 and g > 160 and b > 160 and (max(r, g, b) - min(r, g, b)) < 25:
                # Soft fade for edge anti-aliasing
                alpha = int(a * 0.2)
                pixels[x, y] = (r, g, b, alpha)
                cleaned_count += 1

    img.save('public/regis.webp', 'WEBP', quality=100)
    img.save('public/regis.png', 'PNG')
    print(f"Successfully cleaned regis image! Removed {cleaned_count} background pixels.")

if __name__ == '__main__':
    remove_all_checkerboard()
