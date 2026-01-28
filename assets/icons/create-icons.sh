#!/bin/bash
# Create tray icon template images for macOS
# Template images should be black with transparency

# 16x16 tray icon
convert -size 16x16 xc:transparent \
  -fill black \
  -draw "circle 8,8 8,3" \
  -draw "line 12,12 14,14" \
  assets/icons/trayTemplate.png

# 32x32 tray icon @2x
convert -size 32x32 xc:transparent \
  -fill black \
  -draw "circle 16,16 16,6" \
  -draw "line 24,24 28,28" \
  assets/icons/trayTemplate@2x.png

echo "Icons created!"
