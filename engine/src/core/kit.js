// Blueprint kit: the component zoo for dark, diagram-first software explainers.
// All functions draw immediately with the shared ctx (1080x1920). `dim` 0..1 fades a component back (focus/dim is the style's main tool).
import { ctx, C, W, H, TAU, lerp, clamp, seg, eo, eob, rr, circle, line, fillAll, txt, tw } from './lib.js';

const A = (c) => C[c] || c;
const withAlpha = (a, fn) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); fn(); ctx.restore(); };

// ═════════════ SCREEN FURNITURE ═════════════
/** background: flat bg + faint blueprint grid */
export function stage() {
  fillAll(C.bg);
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 2;
  for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();
}
/** top chrome, drawn by main.js on every frame: mint progress bar (y 118) + channel handle (top right, y 78). Safe zone: nothing else above y 150. */
export function chrome(t, dur, script) {
  ctx.save(); ctx.globalAlpha = 1;
  rr(60, 114, 960, 8, 4); ctx.fillStyle = C.card2; ctx.fill();
  const w = 960 * clamp(t / dur); if (w > 8) { rr(60, 114, w, 8, 4); ctx.fillStyle = C.mint; ctx.fill(); }
  const h = (script && script.handle) || ''; if (h) txt(h, 1020, 74, 30, C.dim, 'Mono', 'right');
  ctx.restore();
}
/** big title block at the top of the stage: title (Inter 64) + optional handwritten sub-line */
export function title(text, sub, a = 1, color = C.white) {
  withAlpha(a, () => { txt(text, 540, 235, 66, color, 'Inter'); if (sub) txt(sub, 540, 305, 46, C.dim, 'Scrawl'); });
}
/** handwritten annotation with a squiggle underline */
export function note(text, x, y, color = C.amber, a = 1, size = 52, rot = -0.03) {
  withAlpha(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); txt(text, 0, 0, size, color, 'Scrawl');
    const w = tw(text, size, 'Scrawl'); ctx.beginPath(); ctx.moveTo(-w / 2, size * 0.62);
    for (let i = 0; i <= 12; i++) ctx.lineTo(-w / 2 + (w * i) / 12, size * 0.62 + (i % 2 ? 7 : -3));
    ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
  });
}

// ═════════════ CONTAINERS ═════════════
/** card: dark rounded panel with a small mono title and an accent dot. (x, y) = top-left */
export function card(x, y, w, h, o = {}) {
  withAlpha(o.a ?? 1, () => {
    rr(x, y, w, h, 28); ctx.fillStyle = C.card; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = o.stroke ? A(o.stroke) : C.stroke; ctx.stroke();
    if (o.title) { circle(x + 38, y + 42, 9, A(o.accent || 'dim')); txt(o.title, x + 62, y + 42, 30, C.dim, 'Mono', 'left'); }
  });
}
/** terminal window. lines = [{ t, c }] ; typed = chars revealed (all if omitted) */
export function terminal(x, y, w, h, lines, typed = 1e9, a = 1) {
  withAlpha(a, () => {
    rr(x, y, w, h, 24); ctx.fillStyle = C.bgDeep; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.stroke; ctx.stroke();
    [C.coral, C.amber, C.mint].forEach((c, i) => circle(x + 34 + i * 30, y + 34, 8, c));
    let left = typed, yy = y + 90;
    for (const ln of lines) {
      if (left <= 0) break; const s = ln.t.slice(0, left); left -= ln.t.length;
      txt(s, x + 30, yy, 36, A(ln.c || 'white'), 'Mono', 'left'); yy += 56;
    }
    if (typed < 1e8 && Math.floor(typed / 1) >= 0) { /* cursor drawn by caller if wanted */ }
  });
}

// ═════════════ NODES ═════════════
function icon(kind, x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'user') { ctx.beginPath(); ctx.arc(0, -12, 12, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 30, 26, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  else if (kind === 'server') { for (let i = 0; i < 3; i++) { rr(-30, -34 + i * 24, 60, 18, 6); ctx.stroke(); circle(-18, -25 + i * 24, 3, col); } }
  else if (kind === 'db') { for (const yy of [-24, 0, 24]) { ctx.beginPath(); ctx.ellipse(0, yy, 30, 10, 0, 0, TAU); if (yy === -24) ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-30, -24); ctx.lineTo(-30, 24); ctx.moveTo(30, -24); ctx.lineTo(30, 24); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 24, 30, 10, 0, 0, Math.PI); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, 30, 10, 0, 0, Math.PI); ctx.stroke(); }
  else if (kind === 'cache') { ctx.beginPath(); ctx.moveTo(6, -34); ctx.lineTo(-18, 6); ctx.lineTo(0, 6); ctx.lineTo(-6, 34); ctx.lineTo(18, -8); ctx.lineTo(0, -8); ctx.closePath(); ctx.stroke(); }
  else if (kind === 'clock') { ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, 0); ctx.lineTo(14, 8); ctx.stroke(); }
  else if (kind === 'phone') { rr(-22, -38, 44, 76, 10); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-8, -28); ctx.lineTo(8, -28); ctx.stroke(); circle(0, 28, 4, col); }
  else if (kind === 'station') { ctx.beginPath(); ctx.moveTo(0, 34); ctx.lineTo(0, -10); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-22, 34); ctx.lineTo(0, 8); ctx.lineTo(22, 34); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -22, 12, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-26, -22); ctx.lineTo(-18, -22); ctx.moveTo(18, -22); ctx.lineTo(26, -22); ctx.stroke(); }
  else if (kind === 'api') { ctx.font = '700 44px Mono'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('</>', 0, 2); }
  else if (kind === 'browser') { rr(-34, -28, 68, 56, 8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-34, -12); ctx.lineTo(34, -12); ctx.stroke(); }
  ctx.restore();
}
/** node: icon + mono label. (x, y) = centre. state: 'idle' | 'busy' (pulsing coral ring). dim 0..1 = how faded back */
export function node(x, y, label, kind, accent, o = {}) {
  const dim = o.dim ?? 0, s = o.s ?? 1, a = (o.a ?? 1) * (1 - dim * 0.72);
  withAlpha(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    rr(-100, -72, 200, 144, 26); ctx.fillStyle = C.card2; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = A(accent); ctx.stroke();
    icon(kind, 0, -18, 1.05, A(accent)); txt(label, 0, 44, 34, C.white, 'Mono');
    if (o.busy) { ctx.lineWidth = 6; ctx.strokeStyle = C.coral; ctx.globalAlpha *= 0.4 + 0.6 * Math.abs(Math.sin(o.busy * 5)); rr(-112, -84, 224, 168, 34); ctx.stroke(); }
    ctx.restore();
  });
}
/** a stored record (amber token). stale = coral dashed outline + old tag */
export function record(x, y, label, o = {}) {
  const col = A(o.color || 'amber');
  withAlpha(o.a ?? 1, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(o.s ?? 1, o.s ?? 1);
    rr(-100, -32, 200, 64, 16); ctx.fillStyle = C.bgDeep; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = o.stale ? C.coral : col; if (o.stale) ctx.setLineDash([10, 8]); ctx.stroke(); ctx.setLineDash([]);
    circle(-74, 0, 9, o.stale ? C.coral : col); txt(label, -52, 2, 28, C.white, 'Mono', 'left'); ctx.restore();
  });
}

// ═════════════ WIRES + THE REQUEST DOT ═════════════
export function wire(pts, accent = 'stroke', o = {}) {
  withAlpha(o.a ?? 1, () => { line(pts, A(accent), o.w ?? 6, o.dash ?? null); });
}
export function arrowHead(x, y, ang, accent = 'dim', s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-10, -12); ctx.lineTo(-10, 12); ctx.closePath(); ctx.fillStyle = A(accent); ctx.fill(); ctx.restore();
}
/** point at fraction u (0..1) along a polyline */
export function polyAt(pts, u) {
  const segs = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  let d = clamp(u) * tot; for (let i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) { const f = segs[i] ? d / segs[i] : 0; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; } d -= segs[i]; }
  return pts[pts.length - 1];
}
/** THE REQUEST: the mint dot (the channel's recurring character). trail follows it along `pts` up to fraction u */
export function dot(pts, u, o = {}) {
  if (u <= 0 || u >= 1.0001) { if (!(o.keep && u >= 1)) return; }
  const col = A(o.color || 'mint'); const [x, y] = polyAt(pts, u);
  withAlpha(o.a ?? 1, () => {
    for (let i = 5; i >= 1; i--) { const [tx, ty] = polyAt(pts, Math.max(0, u - i * 0.018)); circle(tx, ty, 14 - i * 1.8, col); ctx.globalAlpha *= 0.55; }
  });
  withAlpha(o.a ?? 1, () => { circle(x, y, 30, col); ctx.globalAlpha *= 0.25; circle(x, y, 30, col); circle(x, y, 20, C.white); circle(x, y, 14, col); });
  withAlpha((o.a ?? 1) * 0.22, () => circle(x, y, 38, col));
}

// ═════════════ FOCUS + LABELS ═════════════
/** dashed white focus box with marching ants. (x, y) = centre */
export function focus(x, y, w, h, t, a = 1, color = C.white) {
  withAlpha(a, () => { ctx.save(); ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 40; ctx.lineWidth = 4; ctx.strokeStyle = color; rr(x - w / 2, y - h / 2, w, h, 26); ctx.stroke(); ctx.restore(); });
}
/** pill badge. solid = filled with accent (ink text) else outlined */
export function badge(text, x, y, accent, o = {}) {
  const sc = o.sc ?? 1; if (sc <= 0) return; const size = o.size ?? 46, col = A(accent);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); const w = tw(text, size, 'Mono') + size * 1.2, h = size * 1.75;
  rr(-w / 2, -h / 2, w, h, h / 2); if (o.solid !== false) { ctx.fillStyle = col; ctx.fill(); txt(text, 0, 2, size, C.ink, 'Mono'); } else { ctx.fillStyle = C.bgDeep; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke(); txt(text, 0, 2, size, col, 'Mono'); }
  ctx.restore();
}
/** rotated outlined stamp (STALE, MISS ...) */
export function stamp(text, x, y, accent, sc = 1, rot = -0.12, size = 88) {
  if (sc <= 0) return; const col = A(accent), w = tw(text, size, 'Inter') + 70, h = size * 1.5;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); rr(-w / 2, -h / 2, w, h, 20); ctx.lineWidth = 9; ctx.strokeStyle = col; ctx.stroke(); txt(text, 0, 4, size, col, 'Inter'); ctx.restore();
}
export function check(x, y, s = 1, accent = 'mint') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); circle(0, 0, 36, A(accent)); line([[-16, 2], [-4, 14], [18, -12]], C.ink, 9); ctx.restore(); }
export function cross(x, y, s = 1, accent = 'coral') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); circle(0, 0, 36, A(accent)); line([[-14, -14], [14, 14]], C.ink, 9); line([[14, -14], [-14, 14]], C.ink, 9); ctx.restore(); }
/** horizontal meter. p 0..1. label left, value right */
export function meter(x, y, w, p, accent, label, value) {
  txt(label, x, y - 44, 34, C.dim, 'Mono', 'left'); if (value) txt(value, x + w, y - 44, 46, A(accent), 'Mono', 'right');
  rr(x, y - 14, w, 28, 14); ctx.fillStyle = C.card2; ctx.fill(); if (p > 0.01) { rr(x, y - 14, Math.max(28, w * p), 28, 14); ctx.fillStyle = A(accent); ctx.fill(); }
}
/** TTL ring: p = fraction remaining (1 → 0) */
export function ring(x, y, r, p, accent, label) {
  ctx.save(); ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.strokeStyle = C.card2; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  if (p > 0.005) { ctx.strokeStyle = A(accent); ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * p); ctx.stroke(); }
  ctx.restore(); if (label) txt(label, x, y + 2, r * 0.5, C.white, 'Mono');
}
/** spinner (loading) */
export function spinner(x, y, r, t, accent = 'coral') { ctx.save(); ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.strokeStyle = C.card2; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.strokeStyle = A(accent); ctx.beginPath(); ctx.arc(x, y, r, t * 6, t * 6 + 1.7); ctx.stroke(); ctx.restore(); }

// ═════════════ API KIT (added for "What Is an API?") ═════════════
/** menu card of endpoints. rows: [{ m: 'GET', p: '/weather', ghost }] · o: { rh, hl (row index outlined mint), a, title, rowA: [alpha per row] } · (x, y) = top-left */
export function menu(x, y, w, rows, o = {}) {
  const rh = o.rh ?? 108, h = 96 + rows.length * rh;
  withAlpha(o.a ?? 1, () => {
    card(x, y, w, h, { title: o.title ?? 'the menu (API)', accent: 'violet', stroke: o.stroke });
    rows.forEach((r, i) => {
      const yy = y + 84 + i * rh, ra = o.rowA ? o.rowA[i] : 1; if (ra <= 0) return;
      withAlpha(ra, () => {
        rr(x + 24, yy, w - 48, rh - 14, 18); ctx.fillStyle = C.bgDeep; ctx.fill(); ctx.lineWidth = 4;
        ctx.strokeStyle = r.ghost ? C.coral : o.hl === i ? C.mint : C.stroke; if (r.ghost) ctx.setLineDash([12, 9]); ctx.stroke(); ctx.setLineDash([]);
        badge(r.m, x + 120, yy + (rh - 14) / 2, r.ghost ? 'coral' : 'violet', { size: 30 }); txt(r.p, x + 215, yy + (rh - 14) / 2 + 2, 40, r.ghost ? C.coral : C.white, 'Mono', 'left');
      });
    });
  });
}
/** the unknown: a dashed box with a question mark (what the app is not allowed to see) */
export function blackbox(x, y, o = {}) {
  withAlpha(o.a ?? 1, () => {
    ctx.save(); ctx.translate(x, y); rr(-100, -72, 200, 144, 26); ctx.fillStyle = C.bgDeep; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.mute; ctx.setLineDash([14, 10]); ctx.stroke(); ctx.setLineDash([]);
    txt('?', 0, -6, 80, C.mute, 'Inter'); txt(o.label ?? 'hidden', 0, 50, 28, C.dim, 'Mono'); ctx.restore();
  });
}
/** stacked acronym rows. items: [{ letter, word, a }] ; (x, y) = centre of the first row, rows 170 px apart */
export function acronym(x, y, items) {
  items.forEach((it, i) => withAlpha(it.a ?? 1, () => {
    const yy = y + i * 170; rr(x - 440, yy - 70, 880, 140, 36); ctx.fillStyle = C.card; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.stroke; ctx.stroke();
    circle(x - 340, yy, 52, C.mint); txt(it.letter, x - 340, yy + 4, 70, C.ink, 'Inter'); txt(it.word, x - 250, yy + 4, 66, C.white, 'Inter', 'left');
  }));
}

// ═════════════ REST vs GraphQL KIT ═════════════
/** a response card of JSON-ish fields. rows: [{ k, v, use }] ; o: { title, a, rowA[], unused (0..1 → unused rows turn dashed coral + dim), accent } · (x, y) = top-left */
export function fieldsCard(x, y, w, rows, o = {}) {
  const rh = o.rh ?? 82, h = 96 + rows.length * rh;
  withAlpha(o.a ?? 1, () => {
    card(x, y, w, h, { title: o.title, accent: o.accent || 'cyan' });
    rows.forEach((r, i) => {
      const ra = o.rowA ? o.rowA[i] : 1; if (ra <= 0) return; const yy = y + 84 + i * rh, bad = !r.use && (o.unused ?? 0) > 0.01, u = bad ? o.unused : 0;
      withAlpha(ra * (1 - 0.6 * u), () => {
        rr(x + 24, yy, w - 48, rh - 12, 16); ctx.fillStyle = C.bgDeep; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = bad ? C.coral : r.use ? C.mint : C.stroke; if (bad) ctx.setLineDash([12, 9]); ctx.stroke(); ctx.setLineDash([]);
        txt(r.k, x + 56, yy + (rh - 12) / 2 + 2, 34, bad ? C.coral : C.white, 'Mono', 'left'); txt(r.v, x + w - 56, yy + (rh - 12) / 2 + 2, 34, C.dim, 'Mono', 'right');
      });
    });
  });
}
/** a nested-query tree: root, 3 children, 9 grandchildren. p1/p2 = reveal of level 1 / 2 (0..1) ; (cx, y) = root centre */
export function tree(cx, y, p1, p2) {
  const kids = [-300, 0, 300].map((dx) => [cx + dx, y + 170]), gk = [];
  kids.forEach(([kx, ky]) => [-95, 0, 95].forEach((d) => gk.push([kx + d, ky + 170, kx, ky])));
  gk.forEach(([gx, gy, kx, ky]) => withAlpha(p2, () => { line([[kx, ky], [gx, gy]], C.stroke, 5); circle(gx, gy, 24, C.coral); }));
  kids.forEach(([kx, ky]) => withAlpha(p1, () => { line([[cx, y], [kx, ky]], C.stroke, 6); circle(kx, ky, 36, C.amber); }));
  circle(cx, y, 48, C.violet);
}

// ═════════════ PIPE (WebSocket) ═════════════
/** a permanent two-way connection between x1 and x2 at y. o: { grow 0..1 (draws open from the centre), flow 0..1 (message dots both ways), t (time), accent, a } */
export function pipe(x1, x2, y, o = {}) {
  const g = clamp(o.grow ?? 1), cx = (x1 + x2) / 2, hw = ((x2 - x1) / 2) * g, col = A(o.accent || 'violet');
  withAlpha(o.a ?? 1, () => {
    if (hw < 2) return; rr(cx - hw, y - 36, hw * 2, 72, 36); ctx.fillStyle = C.bgDeep; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke();
    const f = o.flow ?? 0; if (f <= 0.01) return;
    for (let i = 0; i < 4; i++) { const u = ((o.t || 0) * 0.45 + i / 4) % 1, xr = x1 + 60 + (x2 - x1 - 120) * u, xl = x2 - 60 - (x2 - x1 - 120) * ((u + 0.37) % 1);
      ctx.globalAlpha *= 1; circle(xr, y - 12, 11 * f, C.mint); circle(xl, y + 12, 11 * f, C.amber); }
  });
}
