/**
 * Generates all PWA icons from an inline SVG (dark background, green gamepad).
 * Run with: node scripts/generate-icons.mjs
 * Output goes to /public. Uses sharp, which ships with Next.js.
 */
import sharp from 'sharp';

const GREEN = '#00D084';

// Gamepad glyph from Lucide's gamepad-2 (24x24 viewBox), matching the app logo.
const GLYPH = `
  <line x1="6" x2="10" y1="11" y2="11"/>
  <line x1="8" x2="8" y1="9" y2="13"/>
  <line x1="15" x2="15.01" y1="12" y2="12"/>
  <line x1="18" x2="18.01" y1="10" y2="10"/>
  <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.152A4 4 0 0 0 17.32 5z"/>
`;

function makeSvg({ size, rounded, glyphRatio }) {
  const radius = rounded ? Math.round(size * 0.22) : 0;
  const glyphSize = size * glyphRatio;
  const offset = (size - glyphSize) / 2;
  const scale = glyphSize / 24;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1d211f"/>
      <stop offset="1" stop-color="#0c0e0d"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})"
     fill="none" stroke="${GREEN}" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round">
    ${GLYPH}
  </g>
</svg>`;
}

const targets = [
  // Standard icons (rounded corners baked in)
  { file: 'icon-192.png', size: 192, rounded: true, glyphRatio: 0.62 },
  { file: 'icon-512.png', size: 512, rounded: true, glyphRatio: 0.62 },
  // Maskable: full-bleed background, glyph inside the 80% safe zone
  { file: 'icon-maskable-192.png', size: 192, rounded: false, glyphRatio: 0.52 },
  { file: 'icon-maskable-512.png', size: 512, rounded: false, glyphRatio: 0.52 },
  // iOS home screen (Apple applies its own corner mask)
  { file: 'apple-touch-icon.png', size: 180, rounded: false, glyphRatio: 0.6 },
  // Browser tab favicon
  { file: 'favicon.png', size: 64, rounded: true, glyphRatio: 0.7 },
];

for (const target of targets) {
  const svg = Buffer.from(makeSvg(target));
  await sharp(svg).png().toFile(`public/${target.file}`);
  console.log(`✓ public/${target.file} (${target.size}x${target.size})`);
}

console.log('All icons generated.');
