import type { MeshBuilder, Vec3 } from './world3d';

function wheel(p: MeshBuilder, x: number, y: number, z: number, radius = 0.24) {
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2, b = (i + 1) / 16 * Math.PI * 2;
    const at = (angle: number, side: number): Vec3 => [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, z + side];
    p.quad(at(a, -0.09), at(b, -0.09), at(b, 0.09), at(a, 0.09), i % 2 ? '#202e39' : '#15232e');
    for (const side of [-0.095, 0.095]) {
      p.triangle([x, y, z + side], at(a, side), at(b, side), '#283b4a');
      p.triangle([x, y, z + side + Math.sign(side) * 0.006], [x + Math.cos(a) * radius * 0.55, y + Math.sin(a) * radius * 0.55, z + side + Math.sign(side) * 0.006], [x + Math.cos(b) * radius * 0.55, y + Math.sin(b) * radius * 0.55, z + side + Math.sign(side) * 0.006], '#c3d1d8');
    }
  }
}
export function roadCar(p: MeshBuilder, x: number, z: number, color = '#6bdcc2', truck = false) {
  p.box(x, 0.075, z, truck ? 3.25 : 2.06, 0.025, 1.16, '#233744');
  p.box(x, 0.29, z, 1.95, 0.36, 0.96, color);
  p.box(x + 0.58, 0.65, z, 0.7, 0.1, 0.93, color);
  p.box(x - 0.67, 0.65, z, 0.5, 0.07, 0.93, color);
  p.box(x - 0.18, 0.73, z, 0.82, 0.37, 0.83, color);
  p.box(x - 0.18, 1.1, z, 0.85, 0.045, 0.86, '#c2f4e9');
  p.quad([x + 0.46, 0.75, z - 0.4], [x + 0.23, 1.08, z - 0.4], [x + 0.23, 1.08, z + 0.4], [x + 0.46, 0.75, z + 0.4], '#90c7e0');
  for (const side of [-1, 1]) {
    p.box(x - 0.18, 0.8, z + side * 0.425, 0.65, 0.22, 0.018, '#7ca6c2');
    p.box(x - 0.14, 0.78, z + side * 0.44, 0.04, 0.27, 0.025, '#254350');
    p.box(x + 0.36, 0.73, z + side * 0.54, 0.16, 0.09, 0.15, color);
    p.box(x - 0.45, 0.65, z + side * 0.49, 0.14, 0.035, 0.025, '#d4e6e8');
    for (const axle of [-0.61, 0.61]) wheel(p, x + axle, 0.32, z + side * 0.51);
    p.box(x + 0.99, 0.48, z + side * 0.29, 0.04, 0.13, 0.22, '#fff3bd');
    p.box(x - 0.99, 0.49, z + side * 0.3, 0.04, 0.14, 0.18, '#ff8077');
  }
  p.box(x + 1.015, 0.32, z, 0.035, 0.1, 0.82, '#a8becb');
  p.box(x + 1.04, 0.48, z, 0.02, 0.14, 0.3, '#344c5b');
  if (truck) {
    p.box(x - 1.1, 0.48, z, 1.65, 1.35, 1.04, '#a3c1d0');
    p.box(x - 1.1, 1.83, z, 1.7, 0.05, 1.08, '#d7e6eb');
    for (const side of [-1, 1]) { wheel(p, x - 1.55, 0.32, z + side * 0.55); p.box(x - 1.1, 0.83, z + side * 0.53, 1.5, 0.05, 0.025, '#f5c184'); }
  }
}
const glyphs: Record<string, string[]> = {
  S: ['111','100','111','001','111'], T: ['111','010','010','010','010'], O: ['111','101','101','101','111'], P: ['110','101','110','100','100'],
  '2': ['111','001','111','100','111'], '5': ['111','100','111','001','111'], '0': ['111','101','101','101','111'],
};
function signText(p: MeshBuilder, text: string, x: number, y: number, z: number, scale: number, color: string) {
  const width = (text.length * 4 - 1) * scale;
  for (const [letter, char] of [...text].entries()) for (const [row, pixels] of (glyphs[char] || []).entries()) for (const [col, bit] of [...pixels].entries()) if (bit === '1') p.box(x - width / 2 + (letter * 4 + col) * scale, y + (4 - row) * scale, z, scale * 0.9, scale * 0.9, 0.012, color);
}
function stopSign(p: MeshBuilder, x: number, z: number) {
  p.box(x, 0.1, z, 0.065, 1.84, 0.065, '#b1c5cc');
  for (const [radius, depth, color] of [[0.43, 0, '#f5f0df'], [0.385, 0.014, '#c64c48']] as const) for (let i = 0; i < 8; i++) {
    const point = (n: number): Vec3 => [x + Math.sin((n + 0.5) / 8 * Math.PI * 2) * radius, 1.91 + Math.cos((n + 0.5) / 8 * Math.PI * 2) * radius, z + depth];
    p.triangle([x, 1.91, z + depth], point(i), point(i + 1), color);
  }
  signText(p, 'STOP', x + 0.017, 1.83, z + 0.03, 0.035, '#fff8e9');
}
function tree(p: MeshBuilder, x: number, z: number, height = 1.5) {
  p.cylinder(x, 0.08, z, 0.09, height * 0.6, '#8d684d', 8);
  p.orb(x, height, z, height * 0.43, '#4f9d79'); p.orb(x - 0.2, height * 0.88, z + 0.12, height * 0.3, '#75ba87'); p.orb(x + 0.14, height * 1.15, z, height * 0.3, '#a0c985');
}
function person(p: MeshBuilder, x: number, z: number) {
  p.box(x - 0.08, 0.12, z, 0.08, 0.36, 0.1, '#334b6b'); p.box(x + 0.08, 0.12, z, 0.08, 0.36, 0.1, '#334b6b');
  p.box(x, 0.48, z, 0.29, 0.37, 0.18, '#ffb872'); p.orb(x, 0.99, z, 0.15, '#e6b38b');
  for (const side of [-1, 1]) p.box(x + side * 0.19, 0.45, z, 0.075, 0.33, 0.09, '#e6b38b');
}
export function drawRoad(p: MeshBuilder, data: Record<string, number>, time = 0) {
  const scene = data.scene ?? 3, wet = scene === 6, night = scene === 7;
  p.box(0, -0.4, 0, 9.6, 0.35, 7.1, '#304c4d');
  p.box(0, -0.05, 0, 9.4, 0.07, 6.9, night ? '#3a635d' : '#649b79');
  p.box(0, 0.02, 0, 9.35, 0.055, 2.8, wet ? '#345666' : '#354650');
  for (const z of [-1.58, 1.58]) { p.box(0, 0.02, z, 9.35, 0.13, 0.3, '#c1c5b6'); p.box(0, 0.03, z + Math.sign(z) * 0.5, 9.35, 0.08, 0.7, '#a9b5a4'); }
  for (let x = -4.2; x < 4.5; x += 0.9) {
    p.box(x, 0.085, 0, 0.5, 0.012, 0.045, '#f3d996');
    for (const z of [-1.7, 1.7]) p.box(x, 0.165, z, 0.015, 0.012, 0.4, '#899e98');
  }
  for (const z of [-1.3, 1.3]) p.box(0, 0.083, z, 9.3, 0.012, 0.035, '#e9e8cb');
  if ([1, 2, 4, 11].includes(scene)) {
    p.box(1.5, 0.05, 0, 2.5, 0.04, 6.7, '#354650');
    for (let i = 0; i < 7; i++) p.box(1.95, 0.099, -1.12 + i * 0.36, 0.63, 0.012, 0.18, '#eee9cf');
    p.box(0.72, 0.1, 0.69, 0.13, 0.014, 1.1, '#f1ead5'); person(p, 2.12, 1.8);
  }
  for (const [x, z, h] of [[-3.8, -2.65, 1.6], [-1, -2.9, 1.9], [3.8, -2.7, 1.7], [-3.7, 2.8, 1.2], [3.6, 2.7, 1.4]]) tree(p, x, z, h);
  p.box(-2.6, 0.12, -2.65, 1.45, 0.9, 0.8, '#cfb795');
  p.box(-2.6, 1.02, -2.65, 1.62, 0.1, 0.96, '#d17f6c');
  for (const x of [-2.98, -2.52]) p.box(x, 0.45, -2.235, 0.26, 0.35, 0.022, '#b1dfdf');
  p.box(-2.15, 0.14, -2.235, 0.27, 0.68, 0.024, '#3c6a75');
  for (let i = 0; i < 7; i++) { const x = -2.8 + i * 0.4; p.cylinder(x, 0.12, 2.65, 0.015, 0.16, '#3d7e64', 5); p.orb(x, 0.31, 2.65, 0.065, i % 2 ? '#ffe1a6' : '#d9b0d8'); }
  roadCar(p, scene === 5 ? -1.2 : -1.5 + Math.max(0, Math.min(1, data.progress || 0)) * 3.6, scene === 5 ? 0.92 : 0.67, '#8aead0', data.truck === 1);
  if (scene === 3) roadCar(p, 2.3, -0.65, '#e4b77a');
  if (scene === 2 || scene === 0 || scene === 4) stopSign(p, 0.45, 1.85);
  if (scene === 1 || scene === 7) {
    p.box(0.4, 0.1, 1.86, 0.07, 2.3, 0.07, '#9fb8bc'); p.box(0.4, 1.7, 1.86, 0.4, 0.98, 0.2, '#263d46');
    for (let i = 0; i < 3; i++) { const colors = ['#ff837a', '#ffe199', '#a5e9ac']; p.orb(0.4, 2.47 - i * 0.29, 1.995, 0.112, (data.signal ?? 0) === i ? colors[i] : '#344e51'); }
  }
  if (scene === 4 || scene === 3) {
    p.box(3.5, 0.15, 1.94, 0.06, 1.45, 0.06, '#a8c0c6'); p.box(3.5, 1.46, 1.94, 0.67, 0.88, 0.04, '#eef0dc');
    signText(p, scene === 4 ? '25' : '55', 3.52, 1.72, 1.974, 0.065, '#263d47');
    if (scene === 4) { person(p, 2.75, -1.95); person(p, 3.1, -2.1); }
  }
  if (scene === 5) {
    p.box(-1.2, 0.115, 1.42, 2.45, 0.03, 0.15, '#da9e93'); p.box(2.6, 0.1, 0.63, 2.7, 0.012, 1.15, '#5476a4');
    for (const x of [1.2, 3.95]) p.box(x, 0.12, 0.63, 0.04, 0.012, 1.2, '#f0f0d9');
    p.box(2.6, 0.125, 0.63, 0.6, 0.012, 0.05, '#eef0dc'); p.box(2.6, 0.125, 0.63, 0.05, 0.012, 0.6, '#eef0dc');
  }
  if (scene === 8) {
    for (let i = 0; i < 13; i++) p.box(2.65, 0.095, -2.6 + i * 0.42, 1.35, 0.05, 0.17, '#8c7257');
    for (const x of [2.2, 3.1]) p.box(x, 0.15, 0, 0.065, 0.075, 5.9, '#b7cbd0');
    p.box(1.6, 0.1, 1.8, 0.09, 1.9, 0.09, '#bdc8bc'); p.box(2.3, 0.95, 1.8, 1.55, 0.12, 0.1, '#f0ddd0');
    for (let i = 0; i < 5; i++) p.box(1.67 + i * 0.3, 0.94, 1.87, 0.13, 0.15, 0.025, '#d56560');
    p.orb(1.6, 1.72, 1.9, 0.14, '#ff887b');
  }
  if (scene === 9 || scene === 10) {
    for (let i = 0; i < 4; i++) {
      const x = 0.5 + i * 0.85;
      p.box(x, 0.08, -0.6, 0.4, 0.035, 0.4, '#293d47');
      p.cylinder(x, 0.12, -0.6, 0.15, 0.32, '#f5a06c', 8); p.cylinder(x, 0.32, -0.6, 0.12, 0.08, '#f6eddb', 8); p.cylinder(x, 0.4, -0.6, 0.08, 0.13, '#f5a06c', 8);
    }
    if (scene === 10) { roadCar(p, 2.6, -0.68, '#d9e6df'); p.box(2.4, 1.17, -0.68, 0.48, 0.08, 0.6, '#7bbcdc'); p.box(2.4, 1.17, -0.44, 0.48, 0.1, 0.2, '#ec8f89'); }
    else person(p, 2.8, -1.96);
  }
  if (scene === 11) {
    p.box(0, 0.105, 1.1, 8.9, 0.012, 0.35, '#639b78');
    wheel(p, 2.3, 0.3, 1.12, 0.22); wheel(p, 3.05, 0.3, 1.12, 0.22);
    p.quad([2.3, 0.3, 1.12], [2.67, 0.8, 1.12], [3.05, 0.3, 1.12], [2.65, 0.4, 1.12], '#e9ba7d'); person(p, 2.65, 1.12);
  }
  if (wet) {
    for (let i = 0; i < 8; i++) p.box(-3.8 + i * 1.1, 0.087, -0.95 + (i % 3) * 0.85, 0.5, 0.007, 0.3, '#6b9ca7');
    for (let i = 0; i < 30; i++) p.box(-4.1 + (i * 7 % 81) / 10, 0.35 + (i * 0.23 - time * 1.3 + 100) % 2.4, -2.9 + (i * 17 % 59) / 10, 0.014, 0.15, 0.014, '#b6d5df');
  }
  if (night) for (const x of [-3.2, 3.2]) {
    p.box(x, 0.12, -1.95, 0.07, 2.7, 0.07, '#9eb4bd'); p.box(x, 2.8, -1.72, 0.1, 0.07, 0.55, '#9eb4bd'); p.orb(x, 2.79, -1.45, 0.14, '#ffe4a7');
  }
  if (scene === 0) {
    p.box(2.3, 0.15, -1.9, 1.05, 1.25, 0.12, '#d9e6de'); p.box(2.3, 1.4, -1.9, 1.1, 0.08, 0.17, '#7bd9c1');
    for (let i = 0; i < 4; i++) p.box(2.35, 0.4 + i * 0.2, -1.825, 0.62 - (i % 2) * 0.12, 0.035, 0.018, '#597c85');
  }
}
