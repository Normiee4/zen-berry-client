import sharp from "sharp";
import path from "node:path";

const PUBLIC_DIR = path.resolve("public");
const SOURCE_SVG = path.join(PUBLIC_DIR, "logo.svg");

const SIZES = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon-180.png", size: 180 },
];

async function main() {
  for (const { name, size } of SIZES) {
    const output = path.join(PUBLIC_DIR, name);
    await sharp(SOURCE_SVG, { density: 300 })
      .resize(size, size, { fit: "cover" })
      .png()
      .toFile(output);
    console.log(`Generated ${name} (${size}x${size})`);
  }
}

main().catch(console.error);
