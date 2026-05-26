---
name: favicon-factory
description: Generate complete favicon sets for modern websites. Trigger when user needs favicon.ico, apple-touch-icon, or web app manifest icons.
---

## Instructions

1. Accept a source image (logo, icon, or simple design) and target dimensions.
2. For DeepSeek V4: leverage its million-token context to process multiple image references simultaneously.
3. Generate standard favicon sizes: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256.
4. Generate apple-touch-icon sizes: 57x57, 60x60, 72x72, 76x76, 114x114, 120x120, 144x144, 152x152, 180x180.
5. Create site.webmanifest file:

```json
{
  "name": "Application Name",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

