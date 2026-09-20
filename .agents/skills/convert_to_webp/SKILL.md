---
name: Convert Images to WebP
description: A tool to batch convert images (JPG/PNG) in a directory to WebP format using Python and Pillow to optimize assets for web usage.
---

# Convert Images to WebP

Use this skill whenever you need to batch convert existing images (JPG/PNG) into lightweight WebP format for web optimization. 
The conversion relies on the Python `Pillow` library.

## Usage

You can use the provided Python script located at `scripts/convert_webp.py`.

### Prerequisites
Make sure the user has `Pillow` installed in their Python environment:
`pip install Pillow`

### Running the script
Run the script using python by specifying the source directory and the destination directory:

```bash
python .agents/skills/convert_to_webp/scripts/convert_webp.py <source_directory> <destination_directory> [--quality 80]
```

**Example:**
```bash
python .agents/skills/convert_to_webp/scripts/convert_webp.py ./assets/img/raw ./assets/img/optimized
```
