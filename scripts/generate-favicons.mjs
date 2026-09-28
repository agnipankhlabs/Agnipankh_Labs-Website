import sharp from "sharp";
import fs from "fs";

async function generateFaviconAssets() {
  const source = "public/images/logo-mark.png";

  // 1. Generate PNG sizes
  const sizes = [
    { file: "public/favicon-16x16.png", size: 16 },
    { file: "public/favicon-32x32.png", size: 32 },
    { file: "public/apple-touch-icon.png", size: 180 },
    { file: "app/apple-icon.png", size: 180 },
    { file: "public/android-chrome-192x192.png", size: 192 },
    { file: "public/android-chrome-512x512.png", size: 512 },
    { file: "app/icon.png", size: 512 },
  ];

  for (const item of sizes) {
    await sharp(source)
      .resize(item.size, item.size)
      .png({ compressionLevel: 9 })
      .toFile(item.file);
    console.log("Generated:", item.file);
  }

  // 2. Generate multi-resolution favicon.ico (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    icoSizes.map((size) => sharp(source).resize(size, size).png().toBuffer())
  );

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(icoSizes.length, 4); // count

  let currentOffset = 6 + icoSizes.length * 16;
  const dirEntries = [];

  for (let i = 0; i < icoSizes.length; i++) {
    const size = icoSizes[i];
    const pngBuf = pngBuffers[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(pngBuf.length, 8);
    entry.writeUInt32LE(currentOffset, 12);
    dirEntries.push(entry);
    currentOffset += pngBuf.length;
  }

  const finalIco = Buffer.concat([header, ...dirEntries, ...pngBuffers]);
  fs.writeFileSync("public/favicon.ico", finalIco);
  fs.writeFileSync("app/favicon.ico", finalIco);
  console.log("Generated: public/favicon.ico & app/favicon.ico");

  // 3. Generate favicon.svg
  const b64 = (await sharp(source).resize(256, 256).png().toBuffer()).toString("base64");
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256"><image href="data:image/png;base64,${b64}" width="256" height="256"/></svg>\n`;
  fs.writeFileSync("public/favicon.svg", svgContent);
  console.log("Generated: public/favicon.svg");
}

generateFaviconAssets().catch((err) => {
  console.error("Error generating favicons:", err);
  process.exit(1);
});
