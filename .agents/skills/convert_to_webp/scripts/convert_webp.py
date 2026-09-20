import os
import argparse
from pathlib import Path

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

def convert_images(src, dest, quality=80):
    if not HAS_PIL:
        print("Error: PIL (Pillow) library is not installed. Please install it using 'pip install Pillow'")
        return

    src_dir = Path(src)
    dest_dir = Path(dest)
    dest_dir.mkdir(parents=True, exist_ok=True)

    supported_exts = {'.png', '.jpg', '.jpeg'}
    processed = 0

    for file_path in src_dir.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in supported_exts:
            try:
                img = Image.open(file_path)
                dest_path = dest_dir / f"{file_path.stem}.webp"
                # If RGBA, we can save to webp natively, but some modes might need conversion
                if img.mode not in ('RGB', 'RGBA'):
                    img = img.convert('RGBA')
                img.save(dest_path, "WEBP", quality=quality)
                print(f"Converted: {file_path.name} -> {dest_path.name}")
                processed += 1
            except Exception as e:
                print(f"Failed to convert {file_path.name}: {e}")

    print(f"Total processed: {processed}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Convert images to WebP")
    parser.add_argument("src", help="Source directory containing images")
    parser.add_argument("dest", help="Destination directory for WebP images")
    parser.add_argument("--quality", type=int, default=80, help="WebP compression quality (default: 80)")
    
    args = parser.parse_args()
    convert_images(args.src, args.dest, args.quality)
