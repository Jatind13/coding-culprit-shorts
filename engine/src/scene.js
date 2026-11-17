// Scene DSL: a shot is plain JSON (script.json "shots"), never free-form code, so every video draws from the same
// safe primitives and the builder can validate it (bounds, overlaps, idle gaps) before anything is rendered.
import { ctx, setCtx, C, clamp, lerp, seg, eo, eio, eob, rr, txt, tw } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';

const pop = (lt, a, d = 0.22) => eob(seg(lt, a, a + d));
const fade = (lt, a, d = 0.25) => eo(seg(lt, a, a + d));
const col = (n) => C[n] || n;
const mw = (s, size) => tw(s, size, 'Mono');
function chip(text, x, y, color, a = 1, size = 38) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `700 ${size}px Mono`; const w = ctx.measureText(text).width + 56;
  rr(x - w / 2, y - 36, w, 72, 18); ctx.fillStyle = C.bgDeep; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke(); ctx.restore();
  txt(text, x, y + 2, size, C.white, 'Mono', 'center', a);
}
function sq(x, y, color, a, s = 1, lab) {
  if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; rr(-48, -40, 96, 80, 14); ctx.fillStyle = C.bgDeep; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = color; ctx.stroke(); ctx.restore();
  if (lab) txt(lab, x, y + 2, 32 * s, C.white, 'Mono', 'center', a);
}

// bounding box (centre or top-left per type) used by the validator
function bbox(it) {
  const t = it.t, x = it.x, y = it.y, s = it.s ?? 1;
  if (t === 'chip') { const size = it.size ?? 38; const w = mw(it.text, size) + 56; return [x - w / 2, y - 36, w, 72]; }
  if (t === 'badge') { const size = it.size ?? 46; const w = mw(it.text, size) + size * 1.2, h = size * 1.75; return [x - w / 2, y - h / 2, w, h]; }
  if (t === 'stamp') { const size = it.size ?? 80; const w = tw(it.text, size, 'Inter') + 70, h = size * 1.5; return [x - w / 2, y - h / 2, w, h]; }
  if (t === 'record') return [x - 100 * s, y - 32 * s, 200 * s, 64 * s];
  if (t === 'node') return [x - 75 * s, y - 75 * s, 150 * s, 150 * s];
  if (t === 'sq') return [x - 48 * s, y - 40 * s, 96 * s, 80 * s];
  if (t === 'cross' || t === 'check') return [x - 38 * s, y - 38 * s, 76 * s, 76 * s];
  if (t === 'text' || t === 'note') { const size = it.size ?? 40, w = tw(it.text, size, t === 'note' ? 'Scrawl' : it.font || 'Mono'), al = it.align || 'center'; const x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2; return [x0, y - size * 0.6, w, size * 1.2]; }
  if (t === 'meter') return [x, y - 64, it.w, 78];
  if (t === 'card' || t === 'terminal') return [x, y, it.w, it.h];
  return null;
}
const SOLID = new Set(['chip', 'badge', 'stamp', 'record', 'node', 'sq', 'cross', 'check', 'text', 'note', 'meter']);

export function buildFromSpec(spec) {
  if (!ctx) setCtx(document.createElement('canvas').getContext('2d'));
  const S = [], CUES = [], problems = [];
  const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const shots = spec.shots || [];
  shots.forEach((sh, si) => {
    const i = sh.line ?? si, st = i === 0 ? 0 : L(i) - 0.1, end = T.lines[i + 1] ? L(i + 1) - 0.1 : T.dur;
    const id = `S${String(si + 1).padStart(2, '0')}`, P = (m) => problems.push(`${id}: ${m}`);
    const rel = (a, d = 0) => (a == null ? 0 : typeof a === 'number' ? a : Array.isArray(a) ? Wd(a[0], i) - st + a[1] : Wd(a, i) - st + d);
    if (tw(sh.title, 66, 'Inter') > 960) P(`title too wide: "${sh.title}"`);
    const items = (sh.items || []).map((it) => ({ ...it, _at: rel(it.at), _hide: it.hide != null ? rel(it.hide) : null }));
    // validation: bounds, overlaps (only items alive at the same time), idle gaps
    const boxes = items.map((it) => ({ it, b: bbox(it) }));
    for (const { it, b } of boxes) if (b && (b[0] < 30 || b[0] + b[2] > 1050 || b[1] < 320 || b[1] + b[3] > 1200)) P(`${it.t} "${it.text || it.label || ''}" outside the stage (x ${b[0] | 0}-${(b[0] + b[2]) | 0}, y ${b[1] | 0}-${(b[1] + b[3]) | 0})`);
    for (let a = 0; a < boxes.length; a++) for (let c = a + 1; c < boxes.length; c++) {
      const A = boxes[a], B = boxes[c]; if (!A.b || !B.b || !SOLID.has(A.it.t) || !SOLID.has(B.it.t) || A.it.overlap || B.it.overlap) continue;
      const t0 = Math.max(A.it._at, B.it._at), t1 = Math.min(A.it._hide ?? 1e9, B.it._hide ?? 1e9); if (t0 >= t1) continue;
      const [x1, y1, w1, h1] = A.b, [x2, y2, w2, h2] = B.b; if (x1 < x2 + w2 - 4 && x2 < x1 + w1 - 4 && y1 < y2 + h2 - 4 && y2 < y1 + h1 - 4) P(`${A.it.t} "${A.it.text || A.it.label || ''}" overlaps ${B.it.t} "${B.it.text || B.it.label || ''}"`);
    }
    const reveals = items.filter((it) => !['wire', 'focus'].includes(it.t)).map((it) => it._at).sort((x, y) => x - y);
    if (!reveals.length) P('no items');
    else {
      if (reveals[0] > 0.8) P(`idle start: first reveal at ${reveals[0].toFixed(2)} s`);
      for (let k = 1; k < reveals.length; k++) if (reveals[k] - reveals[k - 1] > 3.2) P(`idle gap ${(reveals[k] - reveals[k - 1]).toFixed(1)} s before reveal at ${reveals[k].toFixed(2)} s`);
      if (end - st - reveals[reveals.length - 1] > 3.6) P(`idle end: ${(end - st - reveals[reveals.length - 1]).toFixed(1)} s after the last reveal`);
    }
    // cues
    cue(st, 'whoosh', { gain: 0.5 });
    for (const it of items) {
      if (it.cue === false) continue; let c = it.cue;
      if (!c) c = it.t === 'badge' ? (it.color === 'coral' ? 'miss' : it.color === 'mint' ? 'ping' : 'pop') : it.t === 'stamp' ? 'thud' : it.t === 'cross' ? 'miss' : it.t === 'check' ? 'ping' : ['chip', 'node', 'record', 'sq'].includes(it.t) ? 'pop' : it.t === 'meter' ? 'tock' : null;
      if (c) cue(st + it._at, c, { gain: it.gain ?? 0.5 });
    }
    S.push({
      id, at: st, cam: [540, 800], zoom: 0.05, note: sh.title,
      draw(lt) {
        K.stage(); K.title(sh.title, null, pop(lt, 0.05, 0.3), col(sh.color || 'white'));
        for (const it of items) {
          let a = it.t === 'wire' || it.t === 'card' || it.t === 'row' || it.t === 'text' || it.t === 'note' || it.t === 'terminal' || it.t === 'focus' || it.t === 'meter' ? fade(lt, it._at) : pop(lt, it._at);
          if (it._hide != null) a *= 1 - fade(lt, it._hide, 0.2); if (a <= 0.001) continue;
          const c = col(it.color || 'white'), n = it.color || 'white';
          switch (it.t) {
            case 'chip': chip(it.text, it.x, it.y, c, a, it.size ?? 38); break;
            case 'badge': ctx.save(); ctx.globalAlpha *= it._hide != null ? 1 - fade(lt, it._hide, 0.2) : 1; K.badge(it.text, it.x, it.y, n, { size: it.size ?? 46, sc: pop(lt, it._at, 0.25) }); ctx.restore(); break;
            case 'stamp': K.stamp(it.text, it.x, it.y, n, pop(lt, it._at, 0.25), it.rot ?? -0.04, it.size ?? 80); break;
            case 'record': K.record(it.x, it.y, it.label, { color: n, a, s: it.s ?? 1 }); break;
            case 'node': K.node(it.x, it.y, it.label, it.kind || 'server', n, { a, s: it.s ?? 1 }); break;
            case 'sq': sq(it.x, it.y, c, a, it.s ?? 1, it.text); break;
            case 'cross': K.cross(it.x, it.y, (it.s ?? 1) * a, n || 'coral'); break;
            case 'check': K.check(it.x, it.y, (it.s ?? 1) * a, n || 'mint'); break;
            case 'wire': K.wire(it.pts, n, { a, dash: it.dash }); break;
            case 'dot': { const dur = it.dur ?? 0.9; const u = it.loop ? ((lt - it._at) / dur) % 1 : (lt - it._at) / dur; if (lt >= it._at && (it.loop || (u > 0 && u < 1))) K.dot(it.pts, u, { color: c }); break; }
            case 'card': K.card(it.x, it.y, it.w, it.h, { title: it.title, accent: n, a }); break;
            case 'row': { let v = it.value, vc = c; for (const sw of it.swaps || []) if (lt >= rel(sw.at)) { v = sw.value; vc = col(sw.color || it.color || 'white'); } txt(it.label, it.x, it.y, 40, C.dim, 'Mono', 'left', a); txt(String(v), it.x + (it.gap ?? 330), it.y, 46, vc, 'Mono', 'left', a); break; }
            case 'text': txt(it.text, it.x, it.y, it.size ?? 40, c, it.font || 'Mono', it.align || 'center', a); break;
            case 'note': K.note(it.text, it.x, it.y, c, a, it.size ?? 40); break;
            case 'meter': { const p = lerp(it.from ?? 0, it.to ?? 1, eio(seg(lt, it._at, it._at + (it.dur ?? 1)))); ctx.save(); ctx.globalAlpha *= a; K.meter(it.x, it.y, it.w, p, n, it.label, it.value && p > (it.show ?? 0) ? it.value : ''); ctx.restore(); break; }
            case 'terminal': { const lines = it.lines; const tot = lines.reduce((s, l) => s + l.t.length, 0); const f = seg(lt, rel(it.typeFrom ?? it.at), rel(it.typeTo ?? it.at) + 0.3); K.terminal(it.x, it.y, it.w, it.h, lines, Math.floor(f * tot), a); break; }
            case 'focus': K.focus(it.x, it.y, it.w, it.h, lt, a, c); break;
            default: throw new Error(`${id}: unknown item type ${it.t}`);
          }
        }
      },
    });
  });
  if (problems.length) throw new Error('SCENE PROBLEMS:\n  ' + problems.join('\n  '));
  return { shots: S, cues: CUES };
}
