
import sharp from "sharp";
import fs from "fs";

/**
 * Generates all favicon assets from the Agnipankh Labs dark-background logo.
 * Source: public/images/logo-mark-dark.png (black bg, phoenix + AL mark + text)
 *
 * For small sizes (16, 32, 48) we crop to the phoenix+AL mark (top ~75%)
 * to keep it recognizable without the text. Larger sizes use the full logo.
 *
 * Run: node scripts/generate-favicons.mjs
 */
async function generateFaviconAssets() {
  const source = "public/images/logo-mark-dark.png";

  // Get metadata of source image
  const meta = await sharp(source).metadata();
  const { width, height } = meta;
  console.log(`Source: ${source} (${width}x${height})`);

  // The phoenix + AL mark occupies roughly the top 75% of the image
  // (the bottom 25% is the "Agnipankh Labs" text which is unreadable at small sizes)
  const markHeight = Math.round(height * 0.75);
  const markWidth = width;
  // Make it square by using the smaller dimension
  const markSquare = Math.min(markWidth, markHeight);
  const markLeft = Math.round((markWidth - markSquare) / 2);

  /**
   * Returns a sharp instance:
   * - useMark=true  → cropped to phoenix+AL mark only (for small favicons)
   * - useMark=false → full logo including text (for large icons)
   */
  function getSource(useMark = false) {
    if (useMark) {
      return sharp(source)
        .extract({
          left: markLeft,
          top: 0,
          width: markSquare,
          height: markSquare,
        })
        .ensureAlpha();
    }
    return sharp(source).ensureAlpha();
  }

  // 1. PNG icons
  const sizes = [
    // Small favicons: use cropped phoenix mark (no text)
    { file: "public/favicon-16x16.png", size: 16, mark: true },
    { file: "public/favicon-32x32.png", size: 32, mark: true },
    // Apple touch icon: full logo
    { file: "public/apple-touch-icon.png", size: 180, mark: false },
    { file: "app/apple-icon.png", size: 180, mark: false },
    // PWA / Android: full logo
    { file: "public/android-chrome-192x192.png", size: 192, mark: false },
    { file: "public/android-chrome-512x512.png", size: 512, mark: false },
    { file: "app/icon.png", size: 512, mark: false },
  ];

  for (const item of sizes) {
    await getSource(item.mark)
      .resize(item.size, item.size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      })
      .ensureAlpha()
      .png({ compressionLevel: 9 })
      .toFile(item.file);
    console.log("Generated:", item.file, `(${item.size}x${item.size})`);
  }

  // 2. Multi-resolution favicon.ico (16, 32, 48) using phoenix mark crop
  const icoSizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    icoSizes.map((size) =>
      getSource(true)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 1 },
        })
        .ensureAlpha()
        .png()
        .toBuffer()
    )
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
  // NOTE: Only write to app/favicon.ico — Next.js App Router serves it as /favicon.ico.
  // DO NOT write to public/favicon.ico — it conflicts with the app/ route and causes 500 errors.
  fs.writeFileSync("app/favicon.ico", finalIco);
  console.log("Generated: app/favicon.ico (multi-res: 16, 32, 48)");

  // 3. favicon.svg — wraps the 256px phoenix mark PNG as embedded base64 SVG
  const b64 = await getSource(true)
    .resize(256, 256, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .png()
    .toBuffer()
    .then((buf) => buf.toString("base64"));

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256"><image href="data:image/png;base64,${b64}" width="256" height="256"/></svg>\n`;
  fs.writeFileSync("public/favicon.svg", svgContent);
  console.log("Generated: public/favicon.svg (256x256)");

  console.log("\n✅ All favicon assets generated successfully from dark-background logo.");
}

generateFaviconAssets().catch((err) => {
  console.error("Error generating favicons:", err);
  process.exit(1);
});
