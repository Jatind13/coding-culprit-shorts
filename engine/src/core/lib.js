// Blueprint engine: canvas, palette, math and drawing primitives. Every kit function draws with the shared `ctx` (set by main.js).
export const W = 1080, H = 1920, FPS = 30;
export let ctx = null;
export function setCtx(c) { ctx = c; }

// ── Palette. Measured on the reference shorts: bg ≈ #0C0C10, cards #14141C-#202028, text white, ONE accent per concept. ──
// Own signature: a mint "request dot" and mint progress bar (the references use no mint).
export const C = {
  bg: '#0A0C12', bgDeep: '#06070B', card: '#141821', card2: '#1C2230', stroke: '#2C3547', grid: '#121722',
  white: '#F4F6FA', dim: '#8B95A8', mute: '#4A5468',
  mint: '#5EF2B0',      // THE REQUEST / success / the keyword in a caption / progress
  amber: '#FFB020',     // data, records, tokens
  cyan: '#4CC9F0',      // network, clients, wires
  violet: '#A78BFA',    // services, cache, compute
  coral: '#FF5D73',     // problem, miss, danger, stale
  ink: '#05060A',
};
export const ACCENTS = ['cyan', 'amber', 'violet', 'mint', 'coral'];

// ── math ──
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (t, a, b) => clamp((t - a) / ((b - a) || 1e-6));
export const eo = (t) => 1 - Math.pow(1 - t, 3);
export const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const eob = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
export const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const TAU = Math.PI * 2;

// ── primitives ──
export function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
export function circle(x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); }
export function ell(x, y, rx, ry, fill, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); ctx.fillStyle = fill; ctx.fill(); }
export function line(pts, color, w, dash = null) {
  ctx.save(); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.restore();
}
export function fillAll(color) { ctx.fillStyle = color; ctx.fillRect(-300, -300, W + 600, H + 600); }
/** text. font: 'Inter' (display, 900) · 'Mono' (code, 700) · 'Scrawl' (handwritten annotation, 400) */
export function txt(s, x, y, size, color = C.white, font = 'Inter', align = 'center', alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `${font === 'Scrawl' ? 400 : font === 'Mono' ? 700 : 900} ${size}px ${font}`;
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.restore();
}
export const tw = (s, size, font = 'Inter') => { ctx.save(); ctx.font = `${font === 'Scrawl' ? 400 : font === 'Mono' ? 700 : 900} ${size}px ${font}`; const w = ctx.measureText(s).width; ctx.restore(); return w; };
