/**
 * Generates the preset profile avatars as pixel-art SVGs.
 * Run with: node scripts/generate-avatars.mjs
 * Output goes to /public/avatars.
 *
 * Each design is drawn as a 16x16 grid, but only the left half (8 columns)
 * is written out — the generator mirrors it, which keeps every sprite
 * symmetrical and halves the hand-editing.
 *
 * Characters: '.' transparent, '1'/'2'/'3' the palette entries below.
 * Keep the ids here in sync with src/lib/avatars.ts.
 */
import { mkdir, writeFile } from 'node:fs/promises';

const GRID = 16;
const CELL = 4; // 16 * 4 = 64px artboard

const AVATARS = [
  {
    id: 'invader',
    palette: ['#00D084'],
    rows: [
      '........',
      '........',
      '........',
      '........',
      '....1...',
      '.....1..',
      '....1111',
      '...11.11',
      '..111111',
      '..1.1111',
      '..1.1...',
      '.....11.',
      '........',
      '........',
      '........',
      '........',
    ],
  },
  {
    id: 'skull',
    palette: ['#e8eef2', '#12161a'],
    rows: [
      '........',
      '........',
      '....1111',
      '...11111',
      '..111111',
      '..111111',
      '..122111',
      '..122111',
      '..111111',
      '..111121',
      '...11111',
      '....1111',
      '....1.1.',
      '....1.1.',
      '........',
      '........',
    ],
  },
  {
    id: 'ghost',
    palette: ['#22d3ee', '#f8fafc', '#0b1220'],
    rows: [
      '........',
      '........',
      '........',
      '....1111',
      '...11111',
      '..111111',
      '..112211',
      '..112311',
      '..111111',
      '..111111',
      '..111111',
      '..111111',
      '..111111',
      '..11.11.',
      '........',
      '........',
    ],
  },
  {
    id: 'heart',
    palette: ['#ff4d6d'],
    rows: [
      '........',
      '........',
      '........',
      '...11...',
      '..1111..',
      '..111111',
      '..111111',
      '...11111',
      '....1111',
      '.....111',
      '......11',
      '.......1',
      '........',
      '........',
      '........',
      '........',
    ],
  },
  {
    id: 'cartridge',
    palette: ['#a78bfa', '#2b2140', '#fbbf24'],
    rows: [
      '........',
      '........',
      '...11111',
      '...11111',
      '...12222',
      '...12222',
      '...12222',
      '...11111',
      '...11111',
      '...11111',
      '...13311',
      '...13311',
      '........',
      '........',
      '........',
      '........',
    ],
  },
  {
    id: 'dpad',
    palette: ['#60a5fa', '#0b1220'],
    rows: [
      '........',
      '........',
      '........',
      '......11',
      '......11',
      '......11',
      '...11111',
      '...11122',
      '...11122',
      '...11111',
      '......11',
      '......11',
      '......11',
      '........',
      '........',
      '........',
    ],
  },
  {
    id: 'robot',
    palette: ['#fb923c', '#0b1220', '#fde68a'],
    rows: [
      '........',
      '.......1',
      '.......1',
      '..111111',
      '..111111',
      '..122111',
      '..122111',
      '..111111',
      '..111333',
      '..111111',
      '..111111',
      '....11..',
      '........',
      '........',
      '........',
      '........',
    ],
  },
  {
    id: 'alien',
    palette: ['#a3e635', '#0b1220'],
    rows: [
      '........',
      '........',
      '.....111',
      '...11111',
      '..111111',
      '..111111',
      '..122211',
      '..122211',
      '..122211',
      '..111111',
      '...11111',
      '....1111',
      '.....111',
      '........',
      '........',
      '........',
    ],
  },
  {
    id: 'sword',
    palette: ['#cbd5e1', '#38bdf8', '#78350f'],
    rows: [
      '........',
      '.......1',
      '.......1',
      '.......1',
      '.......1',
      '.......1',
      '.......1',
      '.......1',
      '....2222',
      '.......3',
      '.......3',
      '.......3',
      '......33',
      '........',
      '........',
      '........',
    ],
  },
  {
    id: 'potion',
    palette: ['#94a3b8', '#34d399', '#f87171'],
    rows: [
      '........',
      '........',
      '......33',
      '......33',
      '.......1',
      '......11',
      '.....111',
      '....1222',
      '....1222',
      '....1222',
      '....1222',
      '.....111',
      '........',
      '........',
      '........',
      '........',
    ],
  },
  {
    id: 'coin',
    palette: ['#fbbf24', '#b45309', '#fef3c7'],
    rows: [
      '........',
      '........',
      '.....111',
      '...11222',
      '..122222',
      '..122222',
      '..122233',
      '..122333',
      '..122333',
      '..122233',
      '..122222',
      '...11222',
      '.....111',
      '........',
      '........',
      '........',
    ],
  },
  {
    id: 'visor',
    palette: ['#e879f9', '#22d3ee'],
    rows: [
      '........',
      '........',
      '....1111',
      '..111111',
      '..111111',
      '..222222',
      '..222222',
      '..111111',
      '..111111',
      '...11111',
      '....1111',
      '........',
      '........',
      '........',
      '........',
      '........',
    ],
  },
];

/** Mirror an 8-character left half into a full 16-wide row. */
function expand(half) {
  if (half.length !== GRID / 2) {
    throw new Error(`Row "${half}" must be ${GRID / 2} characters`);
  }
  return half + [...half].reverse().join('');
}

/** Merge runs of the same colour in a row into one rect each. */
function rowRects(row, y, palette) {
  const rects = [];
  let run = null;

  const flush = () => {
    if (!run) return;
    rects.push(
      `<rect x="${run.start * CELL}" y="${y * CELL}" width="${run.length * CELL}" height="${CELL}" fill="${run.fill}"/>`
    );
    run = null;
  };

  [...row].forEach((char, x) => {
    if (char === '.') return flush();
    const fill = palette[Number(char) - 1];
    if (!fill) throw new Error(`Row "${row}" uses colour ${char}, which is not in the palette`);
    if (run && run.fill === fill && run.start + run.length === x) run.length++;
    else {
      flush();
      run = { start: x, length: 1, fill };
    }
  });
  flush();

  return rects;
}

function makeSvg({ palette, rows }) {
  const size = GRID * CELL;
  const art = rows
    .map(expand)
    .flatMap((row, y) => rowRects(row, y, palette))
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">
  <rect width="${size}" height="${size}" fill="#12161a"/>
  ${art}
</svg>
`;
}

await mkdir('public/avatars', { recursive: true });

for (const avatar of AVATARS) {
  if (avatar.rows.length !== GRID) {
    throw new Error(`Avatar "${avatar.id}" has ${avatar.rows.length} rows, expected ${GRID}`);
  }
  await writeFile(`public/avatars/${avatar.id}.svg`, makeSvg(avatar));
  console.log(`✓ public/avatars/${avatar.id}.svg`);
}

console.log(`${AVATARS.length} avatars generated.`);
