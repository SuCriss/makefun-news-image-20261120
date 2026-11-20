// make.fun news-image-20261120 authored PNG encoder.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const W = 1024;
const H = 1024;
const px = new Uint8Array(W * H * 3);

const C = {
  bg: [10, 13, 19],
  panel: [18, 24, 34],
  panelHi: [26, 35, 48],
  border: [42, 54, 72],
  borderHi: [60, 76, 100],
  gold: [224, 179, 65],
  goldDim: [122, 98, 42],
  red: [226, 86, 86],
  teal: [63, 182, 168],
  blue: [91, 141, 239],
  purple: [168, 124, 224],
  text: [240, 244, 250],
  sub: [158, 170, 190],
  muted: [104, 116, 138],
  grid: [28, 40, 56],
  mapFill: [26, 58, 62],
  mapLine: [63, 150, 140]
};

const FONT = {
  'A': ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  'B': ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  'C': ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  'D': ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  'E': ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  'F': ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  'G': ['.####', '#....', '#....', '#..##', '#...#', '#...#', '.###.'],
  'H': ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  'I': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  'J': ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  'K': ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  'L': ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  'M': ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  'N': ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  'O': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  'P': ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  'Q': ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  'R': ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  'S': ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  'T': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  'U': ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  'V': ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  'W': ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  'X': ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  'Y': ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  'Z': ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ',': ['.....', '.....', '.....', '.....', '.##..', '.##..', '.#...'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'],
  '%': ['##..#', '##..#', '...#.', '..#..', '.#...', '#..##', '#..##'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  '&': ['.##..', '#..#.', '#.#..', '.#...', '#.#.#', '#..#.', '.##.#'],
  "'": ['..#..', '..#..', '.....', '.....', '.....', '.....', '.....'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  '(': ['...#.', '..#..', '.#...', '.#...', '.#...', '..#..', '...#.'],
  ')': ['.#...', '..#..', '...#.', '...#.', '...#.', '..#..', '.#...'],
  '_': ['.....', '.....', '.....', '.....', '.....', '.....', '#####'],
  '=': ['.....', '.....', '#####', '.....', '#####', '.....', '.....'],
  '#': ['.#.#.', '.#.#.', '#####', '.#.#.', '#####', '.#.#.', '.#.#.']
};

function setPix(x, y, c) {
  x = x | 0;
  y = y | 0;
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}

function fillRect(x, y, w, h, c) {
  const x0 = Math.max(0, Math.round(x));
  const y0 = Math.max(0, Math.round(y));
  const x1 = Math.min(W, Math.round(x) + Math.round(w));
  const y1 = Math.min(H, Math.round(y) + Math.round(h));
  for (let yy = y0; yy < y1; yy++) {
    let i = (yy * W + x0) * 3;
    for (let xx = x0; xx < x1; xx++) {
      px[i] = c[0];
      px[i + 1] = c[1];
      px[i + 2] = c[2];
      i += 3;
    }
  }
}

function rect(x, y, w, h, c, t = 1) {
  fillRect(x, y, w, t, c);
  fillRect(x, y + h - t, w, t, c);
  fillRect(x, y, t, h, c);
  fillRect(x + w - t, y, t, h, c);
}

function line(x0, y0, x1, y1, c, t = 1) {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  const half = Math.floor(t / 2);
  let err = dx + dy;
  for (;;) {
    fillRect(x0 - half, y0 - half, t, t, c);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function circleFill(cx, cy, r, c) {
  const rr = r * r;
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= rr) setPix(cx + x, cy + y, c);
    }
  }
}

function circleStroke(cx, cy, r, c, t = 1) {
  const ro = (r + t / 2) * (r + t / 2);
  const ri = (r - t / 2) * (r - t / 2);
  for (let y = -r - t; y <= r + t; y++) {
    for (let x = -r - t; x <= r + t; x++) {
      const d = x * x + y * y;
      if (d <= ro && d >= ri) setPix(cx + x, cy + y, c);
    }
  }
}

function fillPoly(points, c) {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p[1] < minY) minY = p[1];
    if (p[1] > maxY) maxY = p[1];
  }
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    const xs = [];
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const a = points[i];
      const b = points[j];
      if ((a[1] > y) !== (b[1] > y)) {
        xs.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.round(xs[k]);
      const xb = Math.round(xs[k + 1]);
      fillRect(xa, y, xb - xa + 1, 1, c);
    }
  }
}

function strokePoly(points, c, t = 1) {
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    line(a[0], a[1], b[0], b[1], c, t);
  }
}

function glyph(ch) {
  return FONT[ch] || FONT['?'];
}

function textWidth(s, scale = 1) {
  return s.length * 6 * scale - scale;
}

function drawText(x, y, s, c, scale = 1) {
  s = String(s).toUpperCase();
  for (let i = 0; i < s.length; i++) {
    const g = glyph(s[i]);
    const ox = x + i * 6 * scale;
    for (let r = 0; r < 7; r++) {
      const row = g[r];
      for (let cc = 0; cc < 5; cc++) {
        if (row[cc] === '#') fillRect(ox + cc * scale, y + r * scale, scale, scale, c);
      }
    }
  }
}

function textRight(xRight, y, s, c, scale = 1) {
  drawText(xRight - textWidth(String(s), scale), y, s, c, scale);
}

function wrapToWidth(s, maxPx, scale) {
  const words = String(s).split(' ');
  const out = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (textWidth(t, scale) <= maxPx || cur === '') cur = t;
    else {
      out.push(cur);
      cur = w;
    }
  }
  if (cur) out.push(cur);
  return out;
}

function pill(x, y, label, c) {
  const w = textWidth(label, 1) + 14;
  fillRect(x, y, w, 18, C.panelHi);
  rect(x, y, w, 18, c);
  drawText(x + 7, y + 5, label, c, 1);
  return w;
}

function drawIcon(id, x, y, c) {
  if (id === 'leaf') {
    circleStroke(x + 11, y + 11, 8, c, 2);
    line(x + 5, y + 17, x + 17, y + 5, c, 2);
    line(x + 11, y + 11, x + 17, y + 12, c, 1);
  } else if (id === 'globe') {
    circleStroke(x + 11, y + 11, 9, c, 2);
    line(x + 2, y + 11, x + 20, y + 11, c, 1);
    line(x + 11, y + 2, x + 11, y + 20, c, 1);
    line(x + 4, y + 6, x + 18, y + 16, c, 1);
  } else if (id === 'people') {
    circleFill(x + 6, y + 8, 4, c);
    circleFill(x + 16, y + 8, 4, c);
    circleFill(x + 11, y + 16, 4, c);
  } else if (id === 'alert') {
    line(x + 11, y + 2, x + 21, y + 20, c, 2);
    line(x + 21, y + 20, x + 1, y + 20, c, 2);
    line(x + 1, y + 20, x + 11, y + 2, c, 2);
    fillRect(x + 10, y + 8, 2, 7, c);
    fillRect(x + 10, y + 17, 2, 2, c);
  } else if (id === 'missile') {
    line(x + 3, y + 19, x + 17, y + 5, c, 2);
    line(x + 17, y + 5, x + 21, y + 2, c, 2);
    line(x + 13, y + 4, x + 20, y + 11, c, 2);
    line(x + 3, y + 19, x + 7, y + 18, c, 2);
  } else if (id === 'chart') {
    fillRect(x + 2, y + 14, 4, 7, c);
    fillRect(x + 9, y + 10, 4, 11, c);
    fillRect(x + 16, y + 6, 4, 15, c);
    line(x + 2, y + 3, x + 21, y + 3, c, 1);
  } else if (id === 'bolt') {
    line(x + 13, y + 1, x + 6, y + 12, c, 2);
    line(x + 6, y + 12, x + 13, y + 12, c, 2);
    line(x + 13, y + 12, x + 9, y + 21, c, 2);
    line(x + 9, y + 21, x + 18, y + 9, c, 2);
    line(x + 18, y + 9, x + 12, y + 9, c, 2);
  } else if (id === 'energy') {
    circleStroke(x + 11, y + 11, 9, c, 2);
    line(x + 5, y + 13, x + 9, y + 13, c, 2);
    line(x + 9, y + 13, x + 12, y + 7, c, 2);
    line(x + 12, y + 7, x + 16, y + 15, c, 2);
    line(x + 16, y + 15, x + 19, y + 11, c, 2);
  }
}

function panel(x, y, w, h) {
  fillRect(x, y, w, h, C.panel);
  rect(x, y, w, h, C.border);
}

function drawMap() {
  panel(32, 132, 438, 240);
  drawText(44, 142, 'WORLD AT A GLANCE', C.teal, 2);
  textRight(458, 144, '06 REGIONS', C.muted, 1);
  const mx = 44;
  const my = 168;
  const mw = 414;
  const mh = 160;
  fillRect(mx, my, mw, mh, C.grid);
  rect(mx, my, mw, mh, C.border);
  for (let k = 1; k < 8; k++) line(mx + (mw * k) / 8, my, mx + (mw * k) / 8, my + mh, C.border);
  for (let k = 1; k < 4; k++) line(mx, my + (mh * k) / 4, mx + mw, my + (mh * k) / 4, C.border);
  const continents = [
    [[0.05,0.12],[0.16,0.08],[0.26,0.10],[0.30,0.16],[0.25,0.22],[0.28,0.28],[0.22,0.34],[0.20,0.42],[0.15,0.40],[0.12,0.30],[0.07,0.24],[0.04,0.16]],
    [[0.22,0.46],[0.28,0.45],[0.32,0.50],[0.30,0.58],[0.27,0.68],[0.24,0.80],[0.20,0.90],[0.18,0.78],[0.18,0.62],[0.19,0.52]],
    [[0.46,0.18],[0.54,0.16],[0.57,0.20],[0.54,0.26],[0.49,0.28],[0.45,0.24]],
    [[0.46,0.34],[0.56,0.32],[0.60,0.40],[0.58,0.52],[0.54,0.64],[0.50,0.72],[0.46,0.60],[0.44,0.46]],
    [[0.58,0.12],[0.72,0.08],[0.86,0.10],[0.94,0.18],[0.90,0.26],[0.82,0.30],[0.78,0.38],[0.70,0.36],[0.64,0.30],[0.58,0.26],[0.56,0.18]],
    [[0.82,0.62],[0.90,0.60],[0.94,0.68],[0.90,0.76],[0.84,0.74],[0.80,0.68]],
    [[0.30,0.04],[0.40,0.02],[0.42,0.10],[0.34,0.14],[0.29,0.10]]
  ];
  for (const c of continents) {
    const pts = c.map((p) => [mx + p[0] * mw, my + p[1] * mh]);
    fillPoly(pts, C.mapFill);
    strokePoly(pts, C.mapLine, 1);
  }
  const marks = [[0.18,0.30],[0.50,0.22],[0.60,0.34],[0.76,0.24],[0.86,0.66],[0.26,0.58]];
  for (const m of marks) {
    circleFill(mx + m[0] * mw, my + m[1] * mh, 3, C.gold);
    circleStroke(mx + m[0] * mw, my + m[1] * mh, 5, C.goldDim, 1);
  }
  const tags = ['AMERICAS', 'EUROPE', 'MIDDLE EAST', 'AFRICA', 'ASIA', 'PACIFIC'];
  let tx = 44;
  for (const t of tags) {
    const w = pill(tx, 338, t, C.teal);
    tx += w + 8;
  }
}

function drawPulse() {
  panel(486, 132, 506, 240);
  drawText(498, 142, 'MARKET PULSE', C.red, 2);
  textRight(980, 144, 'EQUITY SNAPSHOT / 20 NOV', C.muted, 1);
  const base = 198;
  const left = 498;
  const right = 978;
  for (let v = 0; v <= 3; v++) {
    const yy = base + v * 34;
    line(left, yy, right, yy, v === 0 ? C.borderHi : C.border, 1);
    drawText(left + 4, yy - 4, v === 0 ? '0%' : '-' + v + '%', C.muted, 1);
  }
  const bars = [
    { l: 'WALL ST', v: 2.1, c: C.red },
    { l: 'NASDAQ', v: 2.6, c: C.red },
    { l: 'NIKKEI', v: 1.8, c: C.blue },
    { l: 'HANG SENG', v: 1.5, c: C.blue },
    { l: 'STOXX', v: 1.2, c: C.purple }
  ];
  const slot = 88;
  const start = left + 62;
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const bx = start + i * slot;
    const bh = Math.round(b.v * 34);
    fillRect(bx, base, 54, bh, b.c);
    fillRect(bx, base, 54, 3, C.text);
    drawText(bx, base + bh + 5, '-' + b.v.toFixed(1) + '%', b.c, 1);
    drawText(bx, base + 86, b.l, C.sub, 1);
  }
  fillRect(498, 330, 482, 1, C.border);
  drawText(498, 340, 'DRIVER: AI VALUATION WORRIES SPREAD FROM WALL STREET', C.sub, 1);
  fillRect(498, 359, 6, 6, C.gold);
}

function drawViz(viz, label, x, y, c) {
  if (viz === 'progress') {
    fillRect(x + 12, y + 6, 207, 12, C.border);
    fillRect(x + 12, y + 6, 149, 12, c);
    for (let i = 0; i < 10; i++) fillRect(x + 12 + i * 21, y + 6, 1, 12, C.panel);
    drawText(x + 12, y + 26, label, C.sub, 1);
  } else if (viz === 'nodes') {
    const pts = [[x + 36, y + 14], [x + 96, y + 8], [x + 160, y + 18], [x + 112, y + 38]];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) line(pts[i][0], pts[i][1], pts[j][0], pts[j][1], C.borderHi, 1);
    }
    for (const p of pts) {
      circleFill(p[0], p[1], 6, c);
      circleStroke(p[0], p[1], 9, c, 1);
    }
    drawText(x + 12, y + 46, label, C.sub, 1);
  } else if (viz === 'faces') {
    const initials = ['XI', 'DT', 'PP'];
    for (let i = 0; i < 3; i++) {
      const cx = x + 44 + i * 72;
      circleStroke(cx, y + 18, 13, c, 2);
      drawText(cx - textWidth(initials[i], 1) / 2, y + 14, initials[i], c, 1);
      if (i < 2) line(cx + 18, y + 18, cx + 50, y + 18, C.borderHi, 1);
    }
    drawText(x + 12, y + 44, label, C.sub, 1);
  } else if (viz === 'alert') {
    fillRect(x + 12, y + 8, 207, 16, C.border);
    fillRect(x + 12, y + 8, 164, 16, c);
    for (let i = 0; i < 14; i++) fillRect(x + 12 + i * 15, y + 8, 2, 16, C.panel);
    drawText(x + 12, y + 30, label, C.sub, 1);
    circleFill(x + 216, y + 16, 4, c);
  } else if (viz === 'arcs') {
    for (let k = 0; k < 3; k++) {
      const ox = x + 20 + k * 70;
      line(ox, y + 34, ox + 44, y + 12 - k * 3, c, 2);
      line(ox + 44, y + 12 - k * 3, ox + 52, y + 8 - k * 3, c, 2);
      circleFill(ox, y + 34, 3, C.text);
    }
    line(x + 12, y + 42, x + 219, y + 42, C.borderHi, 1);
    drawText(x + 12, y + 46, label, C.sub, 1);
  } else if (viz === 'spark') {
    const vals = [8, 14, 11, 22, 19, 30, 27, 38, 34, 46];
    for (let i = 0; i + 1 < vals.length; i++) {
      line(x + 14 + i * 22, y + vals[i], x + 14 + (i + 1) * 22, y + vals[i + 1], i > 6 ? C.red : c, 2);
    }
    line(x + 12, y + 2, x + 12, y + 48, C.border, 1);
    drawText(x + 12, y + 50, label, C.sub, 1);
  } else if (viz === 'barsUp') {
    const hs = [8, 12, 17, 24, 32, 40];
    for (let i = 0; i < hs.length; i++) {
      fillRect(x + 14 + i * 34, y + 44 - hs[i], 22, hs[i], i === 5 ? C.gold : c);
    }
    line(x + 12, y + 45, x + 219, y + 45, C.border, 1);
    drawText(x + 12, y + 50, label, C.sub, 1);
  } else if (viz === 'stats') {
    const items = [['EU', 'METHANE'], ['1.5C', 'PACIFIC'], ['195KM', 'H2 PIPE']];
    for (let i = 0; i < 3; i++) {
      const bx = x + 12 + i * 71;
      fillRect(bx, y + 6, 65, 40, C.panelHi);
      rect(bx, y + 6, 65, 40, c);
      drawText(bx + 6, y + 12, items[i][0], c, 1);
      drawText(bx + 6, y + 30, items[i][1], C.muted, 1);
    }
    drawText(x + 12, y + 50, label, C.sub, 1);
  }
}

function drawCard(card, x, y, index) {
  panel(x, y, 231, 268);
  fillRect(x, y, 231, 4, card.color);
  rect(x, y, 231, 268, C.border);
  pill(x + 12, y + 16, card.region, card.color);
  drawIcon(card.icon, x + 231 - 40, y + 14, card.color);
  let hy = y + 46;
  const headLines = wrapToWidth(card.title, 207, 2);
  for (const l of headLines) {
    drawText(x + 12, hy, l, C.text, 2);
    hy += 18;
  }
  const sepY = Math.max(hy + 4, y + 92);
  fillRect(x + 12, sepY, 207, 1, C.borderHi);
  let dy = sepY + 10;
  const descLines = wrapToWidth(card.desc, 207, 2);
  for (const l of descLines) {
    drawText(x + 12, dy, l, C.sub, 2);
    dy += 16;
  }
  drawViz(card.viz, card.vizLabel, x, y + 200, card.color);
  drawText(x + 206, y + 252, String(index + 1).padStart(2, '0'), C.borderHi, 1);
}

function drawFooter() {
  fillRect(32, 948, 960, 1, C.goldDim);
  drawText(32, 962, 'MAKEFUN DAILY BRIEF  /  WORLD EDITION  /  20 NOV 2026', C.muted, 1);
  textRight(992, 962, 'PAGE 01  /  01', C.muted, 1);
  const cols = [C.teal, C.blue, C.gold, C.red, C.red, C.purple, C.teal, C.blue];
  for (let i = 0; i < cols.length; i++) fillRect(32 + i * 10, 984, 6, 6, cols[i]);
  drawText(150, 982, 'SOURCES: GLOBAL WIRE REPORTS  /  COMPILED FOR MAKEFUN', C.borderHi, 1);
  fillRect(32, 1000, 960, 1, C.border);
}

fillRect(0, 0, W, H, C.bg);
fillRect(0, 0, 4, H, C.goldDim);
fillRect(32, 32, 960, 2, C.gold);
drawText(32, 48, 'THE WORLD BRIEF', C.text, 4);
drawText(32, 92, 'A DAILY VISUAL SUMMARY OF GLOBAL AFFAIRS', C.sub, 2);
textRight(992, 50, 'FRIDAY 20 NOVEMBER 2026', C.gold, 2);
textRight(992, 78, 'EDITION 2026.11.20  /  MAKEFUN NEWSROOM', C.muted, 1);
fillRect(32, 118, 960, 1, C.borderHi);

drawMap();
drawPulse();

const cards = [
  { region: 'EUROPE', color: C.teal, icon: 'leaf', title: 'COP31 FINAL DAY', desc: 'ANTALYA TALKS ON FOSSIL-FUEL PHASE-OUT AND CLIMATE FINANCE ENTER THEIR LAST DAY.', viz: 'progress', vizLabel: 'PHASE-OUT 72%' },
  { region: 'ASIA', color: C.blue, icon: 'globe', title: 'APEC SHENZHEN', desc: 'LEADERS PUSH TRADE COOPERATION AND EMERGING TECHNOLOGY ACROSS THE PACIFIC.', viz: 'nodes', vizLabel: 'TRADE / TECH' },
  { region: 'AMERICAS', color: C.gold, icon: 'people', title: 'TRILATERAL TALKS', desc: 'XI, TRUMP AND PUTIN SET OUT A JOINT PEACE DECLARATION IN HIGH-STAKES TALKS.', viz: 'faces', vizLabel: 'XI  TRUMP  PUTIN' },
  { region: 'MIDDLE EAST', color: C.red, icon: 'alert', title: 'IRAN AND HORMUZ', desc: 'TRUMP WAITS ON IRAN ACTION AS TANKER INCIDENTS ARE REPORTED NEAR THE STRAIT.', viz: 'alert', vizLabel: 'HORMUZ  ALERT' },
  { region: 'MIDDLE EAST', color: C.red, icon: 'missile', title: 'YEMEN AND RED SEA', desc: 'AIRSTRIKES CONTINUE AND INTERCEPTED MISSILES RAISE SHIPPING RISK IN THE RED SEA.', viz: 'arcs', vizLabel: 'RED SEA  WATCH' },
  { region: 'AMERICAS', color: C.red, icon: 'chart', title: 'MARKETS DOWN', desc: 'WALL STREET FALLS OVER 2 PERCENT AS ASIAN SHARES SLIDE ON AI VALUATION WORRIES.', viz: 'spark', vizLabel: '-2.1%  WALL ST' },
  { region: 'AMERICAS', color: C.purple, icon: 'bolt', title: 'ANTHROPIC IPO', desc: 'LIVELY DEBUT FOR THE AI GROUP DESPITE THE WIDER TECHNOLOGY SELLOFF.', viz: 'barsUp', vizLabel: 'IPO  DEBUT' },
  { region: 'PACIFIC', color: C.teal, icon: 'energy', title: 'CLIMATE AND ENERGY', desc: 'EU METHANE RULES DELAYED; PACIFIC STATES PRESS 1.5C; CHINA STARTS A 195 KM HYDROGEN PIPELINE.', viz: 'stats', vizLabel: 'EU  1.5C  195KM' }
];

const gx = [32, 275, 518, 761];
const gy = [388, 668];
for (let i = 0; i < cards.length; i++) {
  drawCard(cards[i], gx[i % 4], gy[Math.floor(i / 4)], i);
}

drawFooter();

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;
ihdr[9] = 2;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const stride = W * 3;
const raw = Buffer.alloc((stride + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (stride + 1)] = 0;
  Buffer.from(px.buffer, px.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
}

const idat = zlib.deflateSync(raw, { level: 9, strategy: 0 });
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0))
]);

const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'entry.png'), png);
