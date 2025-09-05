# Asset Generation Instructions

## Prerequisites
Install ImageMagick or use an online SVG to PNG converter.

## Icon Generation Commands

### Main App Icon (1024x1024)
```bash
# Convert base icon to PNG
magick icon-base.svg -resize 1024x1024 icon.png

# Generate iOS sizes
magick icon-base.svg -resize 180x180 icon-180.png
magick icon-base.svg -resize 167x167 icon-167.png  
magick icon-base.svg -resize 152x152 icon-152.png
magick icon-base.svg -resize 120x120 icon-120.png
magick icon-base.svg -resize 87x87 icon-87.png
magick icon-base.svg -resize 80x80 icon-80.png
magick icon-base.svg -resize 76x76 icon-76.png
magick icon-base.svg -resize 58x58 icon-58.png
magick icon-base.svg -resize 40x40 icon-40.png
magick icon-base.svg -resize 29x29 icon-29.png
magick icon-base.svg -resize 20x20 icon-20.png

# Generate Android sizes
magick adaptive-icon-foreground.svg -resize 432x432 adaptive-icon.png
magick icon-base.svg -resize 192x192 icon-192.png
magick icon-base.svg -resize 144x144 icon-144.png
magick icon-base.svg -resize 96x96 icon-96.png
magick icon-base.svg -resize 72x72 icon-72.png
magick icon-base.svg -resize 48x48 icon-48.png
magick icon-base.svg -resize 36x36 icon-36.png

# Favicon
magick icon-base.svg -resize 32x32 favicon.png
```

### Splash Screen
```bash
# Main splash screen
magick splash-base.svg -resize 1080x1920 splash.png

# iOS splash sizes
magick splash-base.svg -resize 1242x2688 splash-1242x2688.png
magick splash-base.svg -resize 828x1792 splash-828x1792.png  
magick splash-base.svg -resize 1125x2436 splash-1125x2436.png
magick splash-base.svg -resize 1242x2208 splash-1242x2208.png
magick splash-base.svg -resize 750x1334 splash-750x1334.png
magick splash-base.svg -resize 640x1136 splash-640x1136.png

# Android splash sizes
magick splash-base.svg -resize 480x800 splash-480x800.png
magick splash-base.svg -resize 320x480 splash-320x480.png
magick splash-base.svg -resize 480x320 splash-480x320.png
```

## Alternative: Online Conversion
1. Use https://cloudconvert.com/svg-to-png
2. Upload each SVG file
3. Set the desired dimensions
4. Download and place in assets folder

## Required Files
After conversion, ensure these files exist in /assets/:
- icon.png (1024x1024)
- adaptive-icon.png (432x432)  
- splash.png (1080x1920)
- favicon.png (32x32)