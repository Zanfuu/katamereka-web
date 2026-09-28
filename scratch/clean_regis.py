import collections
from PIL import Image

def remove_checkerboard():
    img = Image.open('public/regis.webp').convert('RGBA')
    width, height = img.size
    pixels = img.load()

    # Function to check if a pixel is part of the white/light grey checkerboard background
    def is_checkerboard_bg(r, g, b):
        if r > 210 and g > 210 and b > 210:
            color_range = max(r, g, b) - min(r, g, b)
            if color_range < 25:
                return True
        return False

    bg_mask = set()
    queue = collections.deque()

    # Seed floodfill from outer borders
    for x in range(width):
        for y in [0, height - 1]:
            r, g, b, a = pixels[x, y]
            if is_checkerboard_bg(r, g, b):
                queue.append((x, y))
                bg_mask.add((x, y))

    for y in range(height):
        for x in [0, width - 1]:
            if (x, y) not in bg_mask:
                r, g, b, a = pixels[x, y]
                if is_checkerboard_bg(r, g, b):
                    queue.append((x, y))
                    bg_mask.add((x, y))

    # BFS Floodfill to only remove connected background
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    while queue:
        cx, cy = queue.popleft()
        for dx, dy in directions:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in bg_mask:
                    r, g, b, a = pixels[nx, ny]
                    if is_checkerboard_bg(r, g, b):
                        bg_mask.add((nx, ny))
                        queue.append((nx, ny))

    # Make background pixels transparent (alpha = 0)
    for x, y in bg_mask:
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)

    # Save cleaned transparent image
    img.save('public/regis.webp', 'WEBP', quality=100)
    print(f"Successfully processed public/regis.webp: removed {len(bg_mask)} background pixels.")

if __name__ == '__main__':
    remove_checkerboard()
