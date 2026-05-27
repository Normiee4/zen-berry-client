
### Skill 5: Asset Optimizer (`~/.agents/skills/asset-optimizer/SKILL.md`)

```markdown
---
name: asset-optimizer
description: Optimize and convert digital assets between formats and compress for performance. Trigger for converting image formats or compressing assets.
---

## Instructions

1. Identify input asset and target optimization goal (file size, quality, format).
2. Provide optimization commands using ImageMagick:

```bash
# Convert to WebP
convert input.png -quality 85 output.webp

# Resize to max dimension
convert input.jpg -resize 1920x1080 -quality 80 output.jpg

# Create responsive image set
convert input.png -resize 320x -write image-320.png \
                 -resize 640x -write image-640.png \
                 -resize 1024x image-1024.png