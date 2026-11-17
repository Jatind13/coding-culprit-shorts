// The style sheet: the whole look of Blueprint in one 1080x1920 image, drawn by the style's own kit (so it can never drift from the code).
import { ctx, C, W, H, rr, circle, line, txt, fillAll } from './core/lib.js';
import * as K from './core/kit.js';

export function drawStyleSheet() {
  K.stage();
  txt('BLUEPRINT', 60, 110, 84, C.white, 'Inter', 'left'); txt('dark diagram-first software explainers', 60, 176, 34, C.dim, 'Mono', 'left');
  line([[60, 214], [W - 60, 214]], C.stroke, 4);

  // 1 · palette
  txt('1  PALETTE   one accent = one concept', 60, 262, 30, C.mint, 'Mono', 'left');
  const base = [['bg', C.bg], ['card', C.card], ['card2', C.card2], ['stroke', C.stroke], ['dim', C.dim], ['white', C.white]];
  base.forEach(([n, c], i) => { rr(60 + i * 160, 296, 144, 96, 18); ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.stroke; ctx.stroke(); txt(n, 132 + i * 160, 418, 22, C.dim, 'Mono'); });
  const acc = [['mint', 'request · ok · keyword'], ['amber', 'data · records'], ['cyan', 'network · clients'], ['violet', 'services · cache'], ['coral', 'problem · miss · stale']];
  acc.forEach(([n, role], i) => { const x = 60 + i * 192; rr(x, 448, 176, 96, 18); ctx.fillStyle = C[n]; ctx.fill(); txt(n, x + 88, 496, 28, C.ink, 'Mono'); txt(role.split(' · ')[0], x + 88, 570, 20, C.dim, 'Mono'); });

  // 2 · type
  txt('2  TYPE', 60, 640, 30, C.mint, 'Mono', 'left');
  txt('Inter Black: titles + captions', 60, 704, 56, C.white, 'Inter', 'left');
  txt('JetBrains Mono Bold: labels, code, data', 60, 770, 40, C.cyan, 'Mono', 'left');
  txt('Caveat Brush: handwritten annotations', 60, 838, 56, C.amber, 'Scrawl', 'left');

  // 3 · components
  txt('3  COMPONENTS', 60, 920, 30, C.mint, 'Mono', 'left');
  K.node(170, 1040, 'user', 'user', 'cyan'); K.node(400, 1040, 'app', 'server', 'cyan'); K.node(630, 1040, 'cache', 'cache', 'violet'); K.node(860, 1040, 'database', 'db', 'amber');
  K.wire([[270, 1040], [300, 1040]], 'stroke'); K.wire([[500, 1040], [530, 1040]], 'stroke'); K.wire([[730, 1040], [760, 1040]], 'stroke');
  K.dot([[170, 1160], [900, 1160]], 0.62, {}); line([[170, 1160], [900, 1160]], C.stroke, 4); K.dot([[170, 1160], [900, 1160]], 0.62, {});
  txt('the request dot', 960, 1160, 22, C.mint, 'Mono', 'right');
  K.badge('HIT', 120, 1250, 'mint', { size: 36 }); K.badge('MISS', 270, 1250, 'coral', { size: 36 }); K.badge('SAVED', 440, 1250, 'amber', { size: 36 }); K.badge('CACHE', 620, 1250, 'violet', { size: 36 }); K.badge('GET /x', 840, 1250, 'cyan', { size: 36, solid: false });
  K.record(170, 1340, 'prod:42'); K.record(400, 1340, 'price=10', { stale: true }); K.check(560, 1340, 1, 'mint'); K.cross(650, 1340, 1, 'coral');
  K.focus(860, 1340, 220, 90, 0.3, 1); txt('focus', 860, 1340, 26, C.white, 'Mono');
  K.stamp('STALE', 250, 1470, 'coral', 1, -0.1, 64); K.ring(520, 1465, 52, 0.7, 'amber', '42'); K.meter(640, 1480, 340, 0.8, 'mint', 'HIT RATE', '80%');
  K.note('handwritten note', 760, 1555, C.violet, 1, 46);

  // 4 · safe zones (a phone frame)
  txt('4  SAFE ZONES  1080 x 1920', 60, 1600, 30, C.mint, 'Mono', 'left');
  const fx = 60, fy = 1632, fw = 160, fh = 284, sc = fh / 1920;
  rr(fx, fy, fw, fh, 10); ctx.fillStyle = C.bgDeep; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.stroke; ctx.stroke();
  const zone = (y0, y1, col, a) => { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C[col]; ctx.fillRect(fx + 3, fy + y0 * sc, fw - 6, (y1 - y0) * sc); ctx.restore(); };
  zone(0, 150, 'dim', 0.35); zone(330, 1180, 'cyan', 0.28); zone(1230, 1480, 'mint', 0.4); zone(1560, 1920, 'coral', 0.25);
  const lab = [['top chrome  y 0-150   progress + handle', 'dim'], ['stage  y 330-1180   diagram, cards, nodes', 'cyan'], ['caption band  y 1230-1480   one mint word', 'mint'], ['dead zone  y 1560+   Shorts UI, keep empty', 'coral']];
  lab.forEach(([s, c], i) => { circle(270, 1672 + i * 62, 11, C[c]); txt(s, 296, 1672 + i * 62, 25, C.white, 'Mono', 'left'); });
  txt('no hard cuts · crossfade 0.2 s · dim non-focus', 270, 1898, 22, C.dim, 'Mono', 'left');
}
