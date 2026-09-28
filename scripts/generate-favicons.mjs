import sharp from "sharp";
import fs from "fs";

/**
 * Generates all favicon assets from the official Agnipankh Labs logo.
 * Source: public/images/logo-full.png (white-bg, full logo with phoenix + text)
 *
 * For small sizes (16, 32, 48) we crop to the phoenix+AL mark (top portion)
 * to keep it recognizable. Larger sizes use the full logo.
 *
 * Run: node scripts/generate-favicons.mjs
 */
async function generateFaviconAssets() {
  const sourceFull = "public/images/logo-full.png";

  // Get metadata of source image
  const meta = await sharp(sourceFull).metadata();
  const { width, height } = meta;

  // The phoenix + AL mark occupies roughly the top 72% of the logo-full image
  // Crop to square around the phoenix mark for small sizes
  const markSize = Math.min(width, Math.round(height * 0.72));
  const markLeft = Math.round((width - markSize) / 2);

  /**
   * Returns a sharp instance:
   * - useMark=true  → cropped to phoenix mark (for small favicons)
   * - useMark=false → full logo (for large icons)
   */
  function source(useMark = false) {
    if (useMark) {
      return sharp(sourceFull).extract({
        left: markLeft,
        top: 0,
        width: markSize,
        height: markSize,
      });
    }
    return sharp(sourceFull);
  }

  // 1. PNG icons
  const sizes = [
    // Small favicons: use cropped phoenix mark
    { file: "public/favicon-16x16.png", size: 16, mark: true },
    { file: "public/favicon-32x32.png", size: 32, mark: true },
    // Apple touch icon: full logo on square, padded
    { file: "public/apple-touch-icon.png", size: 180, mark: false },
    { file: "app/apple-icon.png", size: 180, mark: false },
    // PWA / Android: full logo
    { file: "public/android-chrome-192x192.png", size: 192, mark: false },
    { file: "public/android-chrome-512x512.png", size: 512, mark: false },
    { file: "app/icon.png", size: 512, mark: false },
  ];

  for (const item of sizes) {
    await source(item.mark)
      .resize(item.size, item.size, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png({ compressionLevel: 9 })
      .toFile(item.file);
    console.log("Generated:", item.file);
  }

  // 2. Multi-resolution favicon.ico (16, 32, 48) using phoenix mark crop
  const icoSizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    icoSizes.map((size) =>
      source(true)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
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
  console.log("Generated: app/favicon.ico");

  // 3. favicon.svg — wraps the 256px phoenix mark PNG as embedded base64 SVG
  const b64 = await source(true)
    .resize(256, 256, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer()
    .then((buf) => buf.toString("base64"));

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256"><image href="data:image/png;base64,${b64}" width="256" height="256"/></svg>\n`;
  fs.writeFileSync("public/favicon.svg", svgContent);
  console.log("Generated: public/favicon.svg");

  console.log("\n✅ All favicon assets generated successfully.");
}

generateFaviconAssets().catch((err) => {
  console.error("Error generating favicons:", err);
  process.exit(1);
});
