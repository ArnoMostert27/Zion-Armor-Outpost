/**
 * Generates placeholder comic covers as SVG files into client/public/covers.
 * Run once after cloning:  npm run covers
 *
 * Swap these out for real artwork later - the filenames match the slugs used
 * in server/data/products.js, so replacing a file is all it takes.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'client', 'public', 'covers');

const PALETTES = [
  ['#12203f', '#e3b93b', '#ff5a2b'],
  ['#2b1440', '#35e7dc', '#e3b93b'],
  ['#3a1414', '#ff5a2b', '#efe3c6'],
  ['#0f2a22', '#4ad991', '#e3b93b'],
  ['#1b1b3a', '#7b6bff', '#35e7dc'],
  ['#2e2410', '#e3b93b', '#ff5a2b'],
];

const COVERS = [
  ['the-action-bible', 'THE ACTION BIBLE', 'Genesis to Revelation'],
  ['action-bible-expanded', 'EXPANDED EDITION', '25 new stories'],
  ['action-bible-new-testament', 'NEW TESTAMENT', 'Gospels to Revelation'],
  ['rise-of-the-prophets', 'RISE OF THE PROPHETS', 'Fire and ink'],
  ['action-storybook-bible', 'ACTION STORYBOOK', 'Fifteen episodes'],
  ['little-shield-daniel', 'DANIEL', 'Little Shield'],
  ['little-shield-david', 'THE STONE', 'Little Shield'],
  ['outpost-junior-first-panels', 'FIRST PANELS', 'Outpost Junior'],
  ['action-bible-study-edition', 'STUDY EDITION', 'Notes and maps'],
  ['action-bible-handbook', 'THE HANDBOOK', 'Visual reference'],
  ['armor-notes-ephesians-six', 'ARMOR NOTES', 'Six weeks'],
  ['maps-of-the-campaign', 'MAPS', 'Of the campaign'],
  ['action-bible-devotional', 'THE DEVOTIONAL', '52 weeks'],
  ['night-watch-30-readings', 'NIGHT WATCH', '30 readings'],
  ['hold-the-line', 'HOLD THE LINE', 'A war journal'],
  ['first-light-morning-panels', 'FIRST LIGHT', 'Morning panels'],
  ['full-armoury-crate', 'THE FULL ARMOURY', 'Six volumes'],
  ['old-testament-campaign-set', 'CAMPAIGN SET', 'Law, kings, exile'],
  ['little-shield-starter-crate', 'STARTER CRATE', 'Four board comics'],
  ['watchman-collector-slipcase', 'WATCHMAN', 'Collector slipcase'],
  ['armor-of-god-poster', 'ARMOR OF GOD', 'A2 poster'],
  ['outpost-satchel-bag', 'THE SATCHEL', 'Canvas bag'],
  ['shield-bookmark-set', 'BOOKMARKS', 'Six brass marks'],
  ['champion-of-zion-tee', 'CHAMPION TEE', 'Heavy cotton'],
];

const PREVIEWS = [
  ['preview-1', 'PANEL ONE', 'The valley goes quiet'],
  ['preview-2', 'PANEL TWO', 'He picks up five stones'],
  ['preview-3', 'PANEL THREE', 'KRA-KOOM'],
];

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Wraps a title onto at most three lines of roughly equal length. */
const wrap = (text, max = 12) => {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > max && line) {
      lines.push(line.trim());
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
};

const cover = (slug, title, kicker, index) => {
  const [bg, accent, accent2] = PALETTES[index % PALETTES.length];
  const lines = wrap(title);
  const startY = 470 - (lines.length - 1) * 46;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#07090f"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="34%" r="60%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.6" fill="${accent}" opacity="0.22"/>
    </pattern>
  </defs>

  <rect width="600" height="900" fill="url(#bg)"/>
  <rect width="600" height="900" fill="url(#dots)"/>
  <rect width="600" height="900" fill="url(#glow)"/>

  <!-- speed lines -->
  <g opacity="0.3" stroke="${accent}" stroke-width="2">
    ${Array.from({ length: 26 }, (_, i) => {
      const a = (i / 26) * Math.PI * 2;
      return `<line x1="${300 + Math.cos(a) * 120}" y1="${300 + Math.sin(a) * 120}" x2="${
        300 + Math.cos(a) * 460
      }" y2="${300 + Math.sin(a) * 460}"/>`;
    }).join('\n    ')}
  </g>

  <!-- armour sigil -->
  <g transform="translate(300 300)" fill="none" stroke="${accent}" stroke-width="9">
    <polygon points="0,-130 112,-66 112,64 0,146 -112,64 -112,-66"/>
    <path d="M0 -92 V104 M-70 -22 H70"/>
  </g>
  <circle cx="300" cy="300" r="26" fill="${accent2}"/>

  <!-- ink slash -->
  <path d="M0 600 L600 540 L600 596 L0 660 Z" fill="#07090f" opacity="0.85"/>

  <!-- title block -->
  <text x="300" y="${startY}" text-anchor="middle" font-family="Impact, Anton, sans-serif"
        font-size="${lines.length > 2 ? 62 : 76}" fill="#efe3c6" letter-spacing="2">
    ${lines
      .map((line, i) => `<tspan x="300" dy="${i === 0 ? 0 : 74}">${escape(line)}</tspan>`)
      .join('\n    ')}
  </text>

  <text x="300" y="720" text-anchor="middle" font-family="Georgia, serif" font-size="30"
        fill="${accent}" font-style="italic">${escape(kicker)}</text>

  <!-- outpost strip -->
  <rect x="0" y="806" width="600" height="94" fill="${accent}"/>
  <text x="300" y="866" text-anchor="middle" font-family="Impact, Anton, sans-serif"
        font-size="34" fill="#07090f" letter-spacing="6">ZION ARMOR OUTPOST</text>

  <rect x="8" y="8" width="584" height="884" fill="none" stroke="#efe3c6" stroke-width="6"/>
</svg>
`;
};

fs.mkdirSync(OUT, { recursive: true });

[...COVERS, ...PREVIEWS].forEach(([slug, title, kicker], index) => {
  fs.writeFileSync(path.join(OUT, `${slug}.svg`), cover(slug, title, kicker, index), 'utf8');
});

console.log(`\x1b[32m[covers] wrote ${COVERS.length + PREVIEWS.length} files to client/public/covers\x1b[0m`);
