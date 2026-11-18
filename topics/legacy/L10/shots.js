// Why is Kafka fast. amber = messages/data, cyan = producer, violet = OS/cache, coral = slow path/problem, mint = fast path.
import { ctx, C, W, H, clamp, lerp, seg, eo, eio, eob, rr, circle, line, txt } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';

const pop = (lt, a, d = 0.22) => eob(seg(lt, a, a + d));
const fade = (lt, a, d = 0.25) => eo(seg(lt, a, a + d));
const row = (label, val, x, y, col, a) => { txt(label, x, y, 40, C.dim, 'Mono', 'left', a); txt(val, x + 330, y, 46, col, 'Mono', 'left', a); };
// text chip that sizes itself (centre origin)
const chip = (text, x, y, col, a = 1, size = 38) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `700 ${size}px "JetBrains Mono", monospace`; const w = ctx.measureText(text).width + 56; rr(x - w / 2, y - 36, w, 72, 18); ctx.fillStyle = C.bgDeep; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke(); ctx.restore(); txt(text, x, y + 2, size, C.white, 'Mono', 'center', a); };

export function buildShots() {
  const S = [], CUES = [];
  const add = (o) => (S.push(o), o);
  const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.1);
  const sq = (x, y, col, a, s = 1, lab) => { if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; rr(-48, -40, 96, 80, 14); ctx.fillStyle = C.bgDeep; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke(); ctx.restore(); if (lab) txt(lab, x, y + 2, 32, C.white, 'Mono', 'center', a); };

  // 1 · hook: every message goes to disk, yet it is fast
  { const st = cut(0), di = Wd('disk', 0) - st, ye = Wd('yet', 0) - st, fa = Wd('fast', 0) - st;
    add({ id: 'S01', at: st, cam: [540, 800], zoom: 0.05, note: 'producer node and disk node; messages stream across on "disk"; coral DISK = SLOW? on "yet"; mint FAST on "fast"',
      draw(lt) {
        K.stage(); K.title('DISK WRITES. STILL FAST.', null, pop(lt, 0.05, 0.3));
        K.node(190, 640, 'producer', 'server', 'cyan', { a: pop(lt, 0.1, 0.3) }); K.node(890, 640, 'disk', 'db', 'violet', { a: pop(lt, 0.5, 0.3) });
        const pts = [[300, 640], [780, 640]]; K.wire(pts, 'dim', { a: fade(lt, 0.3) });
        if (lt > di - 0.3) for (let k = 0; k < 4; k++) K.dot(pts, ((lt - (di - 0.3)) * 0.6 + k * 0.25) % 1, { color: C.amber });
        K.badge('disk = slow?', 540, 880, 'coral', { size: 44, sc: pop(lt, ye, 0.25) });
        K.badge('FAST', 540, 1050, 'mint', { size: 54, sc: pop(lt, fa, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + di - 0.3, 'pop'); cue(st + ye, 'miss', { gain: 0.5 }); cue(st + fa, 'ping', { gain: 0.6 }); }

  // 2 · append-only, sequential beats random
  { const st = cut(1), ap = Wd('appends', 1) - st, se = Wd('sequential', 1) - st, ra = Wd('random', 1) - st;
    add({ id: 'S02', at: st, cam: [540, 800], zoom: 0.05, note: 'log squares append one by one on "appends"; sequential mint label on "sequential"; scattered coral writes on "random"',
      draw(lt) {
        K.stage(); K.title('1 · APPEND ONLY', null, 1, C.mint);
        txt('append to the end', 90, 450, 36, C.dim, 'Mono', 'left', fade(lt, 0.1));
        for (let i = 0; i < 6; i++) sq(150 + i * 156, 560, C.mint, pop(lt, ap + i * 0.18, 0.2), 1, String(i + 1));
        K.badge('SEQUENTIAL', 540, 700, 'mint', { size: 42, sc: pop(lt, se, 0.25) });
        txt('jump around the disk', 90, 830, 36, C.dim, 'Mono', 'left', fade(lt, ra - 0.2));
        const pos = [[150, 940], [620, 1010], [310, 1090], [850, 970], [520, 1110]];
        pos.forEach(([x, y], i) => sq(x, y, C.coral, pop(lt, ra + i * 0.15, 0.2), 0.8, '?'));
        K.badge('RANDOM', 900, 830, 'coral', { size: 38, sc: pop(lt, ra, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); for (let i = 0; i < 6; i++) cue(st + ap + i * 0.18, 'click', { gain: 0.3 }); cue(st + se, 'ping', { gain: 0.5 }); cue(st + ra, 'miss', { gain: 0.4 }); }

  // 3 · OS page cache
  { const st = cut(2), os = Wd('operating', 2) - st, pc = Wd('page', 2) - st, ow = Wd('own', 2) - st;
    add({ id: 'S03', at: st, cam: [540, 800], zoom: 0.05, note: 'Kafka -> OS page cache -> disk chips on "operating"/"page"; coral NO OWN CACHE with a cross on "own"',
      draw(lt) {
        K.stage(); K.title('2 · THE OS PAGE CACHE', null, 1, C.violet);
        chip('Kafka', 180, 640, C.cyan, pop(lt, 0.1, 0.25)); chip('page cache', 540, 640, C.violet, pop(lt, 0.5, 0.25)); chip('disk', 900, 640, C.amber, pop(lt, 0.9, 0.25));
        K.wire([[270, 640], [400, 640]], 'cyan', { a: fade(lt, 0.6) }); K.wire([[680, 640], [810, 640]], 'amber', { a: fade(lt, 1.0) });
        txt('managed by the OS', 540, 740, 34, C.dim, 'Mono', 'center', fade(lt, pc));
        K.focus(540, 640, 400, 130, lt, fade(lt, pc), C.violet);
        chip('own cache', 540, 920, C.coral, pop(lt, ow, 0.25)); K.cross(760, 920, 1.0 * pop(lt, ow + 0.1, 0.25), 'coral');
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + os, 'pop'); cue(st + pc, 'tock', { gain: 0.5 }); cue(st + ow, 'miss', { gain: 0.5 }); }

  // 4 · batching
  { const st = cut(3), ba = Wd('batches', 3) - st, sm = Wd('small', 3) - st, sh = Wd('shared', 3) - st;
    add({ id: 'S04', at: st, cam: [540, 800], zoom: 0.05, note: 'four small requests with their own wires; they group into one batch card on "batches"; ONE REQUEST badge on "shared"',
      draw(lt) {
        K.stage(); K.title('3 · BATCH THEM', null, 1, C.mint);
        const g = eio(seg(lt, ba, ba + 0.6));
        for (let i = 0; i < 4; i++) { const x0 = 150 + i * 260, y0 = 560, x1 = 270 + i * 180, y1 = 640; const x = lerp(x0, x1, g), y = lerp(y0, y1, g); sq(x, y, g > 0.5 ? C.mint : C.coral, pop(lt, 0.1 + i * 0.12, 0.2), 0.8, 'm'); if (g < 0.2) K.wire([[x, y + 50], [x, y + 150]], 'coral', { a: fade(lt, sm) * (1 - g * 5) }); }
        if (g > 0.3) { ctx.save(); ctx.globalAlpha *= g; rr(160, 560, 760, 160, 22); ctx.lineWidth = 4; ctx.strokeStyle = C.mint; ctx.stroke(); ctx.restore(); }
        K.badge('small requests = overhead', 540, 880, 'coral', { size: 36, sc: pop(lt, sm, 0.25) * (1 - g) });
        K.badge('ONE REQUEST', 540, 960, 'mint', { size: 50, sc: pop(lt, sh, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + sm, 'miss', { gain: 0.4 }); cue(st + ba, 'pop'); cue(st + sh, 'ping', { gain: 0.6 }); }

  // 5 · compress whole batches
  { const st = cut(4), co = Wd('compresses', 4) - st, ba = Wd('batches', 4) - st, on = Wd('one', 4) - st;
    add({ id: 'S05', at: st, cam: [540, 800], zoom: 0.05, note: 'batch card shrinks (size meter drops) on "compresses"; BATCHES label on "batches"; one-at-a-time comparison on "one"',
      draw(lt) {
        K.stage(); K.title('4 · COMPRESS BATCHES', null, 1, C.violet);
        const p = lerp(0.9, 0.4, eio(seg(lt, co, co + 1.0)));
        for (let i = 0; i < 4; i++) sq(260 + i * 180, 520, C.amber, pop(lt, 0.1 + i * 0.1, 0.2), lerp(1, 0.7, eio(seg(lt, co, co + 1.0))), 'm');
        ctx.save(); ctx.globalAlpha *= fade(lt, co - 0.2); K.meter(80, 740, 920, p, 'violet', 'batch size', p < 0.6 ? 'SMALLER' : ''); ctx.restore();
        K.badge('whole batch', 300, 920, 'mint', { size: 42, sc: pop(lt, ba, 0.25) });
        K.badge('one by one', 780, 920, 'coral', { size: 42, sc: pop(lt, on, 0.25) }); if (lt > on + 0.2) K.cross(780, 1030, pop(lt, on + 0.2, 0.25), 'coral');
        K.note('illustration, not measured', 540, 1120, C.dim, fade(lt, on + 0.4), 38);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + co, 'slide', { gain: 0.5 }); cue(st + ba, 'ping', { gain: 0.5 }); cue(st + on, 'miss', { gain: 0.4 }); }

  // 6 · zero-copy
  { const st = cut(5), ze = Wd('zero', 5) - st, op = Wd('operating', 5) - st, st2 = Wd('straight', 5) - st;
    add({ id: 'S06', at: st, cam: [540, 800], zoom: 0.05, note: 'old path page cache -> app -> socket (coral, dim); ZERO-COPY on "zero"; direct page cache -> network path with a dot on "straight"',
      draw(lt) {
        K.stage(); K.title('5 · ZERO-COPY', null, 1, C.mint);
        txt('normal: extra copies', 90, 440, 34, C.dim, 'Mono', 'left', fade(lt, 0.1));
        chip('page cache', 210, 540, C.violet, pop(lt, 0.15, 0.25), 30); chip('app buffer', 540, 540, C.coral, pop(lt, 0.3, 0.25), 30); chip('socket', 880, 540, C.coral, pop(lt, 0.45, 0.25), 30);
        K.wire([[320, 540], [430, 540]], 'coral', { a: fade(lt, 0.4), dash: [12, 10] }); K.wire([[650, 540], [790, 540]], 'coral', { a: fade(lt, 0.5), dash: [12, 10] });
        K.badge('ZERO-COPY', 540, 720, 'mint', { size: 50, sc: pop(lt, ze, 0.25) });
        chip('page cache', 230, 900, C.violet, pop(lt, op, 0.25), 30); chip('network', 850, 900, C.mint, pop(lt, st2 - 0.3, 0.25), 30);
        const pts = [[340, 900], [750, 900]]; K.wire(pts, 'mint', { a: fade(lt, st2 - 0.2) }); if (lt > st2 - 0.2) K.dot(pts, clamp((lt - (st2 - 0.2)) / 0.8), { color: C.mint });
        txt('sent by the OS directly', 540, 1020, 34, C.dim, 'Mono', 'center', fade(lt, st2));
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + 0.3, 'pop', { gain: 0.5 }); cue(st + ze, 'ping', { gain: 0.6 }); cue(st + op, 'pop', { gain: 0.5 }); cue(st + st2, 'slide', { gain: 0.5 }); }

  // 7 · the catch: not flushed right away
  { const st = cut(6), ct = Wd('catch', 6) - st, fl = Wd('flushed', 6) - st, du = Wd('durability', 6) - st;
    add({ id: 'S07', at: st, cam: [540, 800], zoom: 0.05, note: 'coral title; write lands in page cache while disk stays empty/dashed on "flushed"; mint CHECK DURABILITY SETTINGS on "durability"',
      draw(lt) {
        K.stage(); K.title('BUT THERE IS A CATCH', null, 1, C.coral);
        chip('write', 180, 600, C.cyan, pop(lt, 0.15, 0.25)); chip('page cache', 540, 600, C.violet, pop(lt, 0.4, 0.25)); chip('disk', 900, 600, C.dim, pop(lt, 0.4, 0.25));
        K.wire([[270, 600], [400, 600]], 'cyan', { a: fade(lt, ct + 0.3) }); K.wire([[680, 600], [820, 600]], 'coral', { a: fade(lt, fl), dash: [12, 10] });
        if (lt > 0.5) K.dot([[270, 600], [400, 600]], clamp((lt - 0.5) / 0.7), { color: C.amber });
        K.badge('not flushed right away', 540, 790, 'coral', { size: 40, sc: pop(lt, fl, 0.25) }); if (lt > fl + 0.2) K.cross(840, 700, pop(lt, fl + 0.2, 0.25), 'coral');
        K.badge('CHECK DURABILITY SETTINGS', 540, 980, 'mint', { size: 36, sc: pop(lt, du, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ct, 'pop'); cue(st + fl, 'miss', { gain: 0.6 }); cue(st + du, 'ping', { gain: 0.6 }); }

  // 8 · verdict
  { const st = cut(7), os = Wd('os', 7) - st, ap = Wd('append', 7) - st, ba = Wd('batch', 7) - st, co = Wd('copies', 7) - st;
    add({ id: 'S08', at: st, cam: [540, 800], zoom: 0.05, note: 'WORK WITH THE OS stamp on "works"; APPEND, BATCH badges on their words; SKIP COPIES on "copies"',
      draw(lt) {
        K.stage(); K.title('THE RECIPE', null, 1, C.mint);
        K.badge('WORK WITH THE OS', 540, 520, 'violet', { size: 50, sc: pop(lt, 0.4, 0.25) });
        K.badge('APPEND', 540, 680, 'mint', { size: 56, sc: pop(lt, ap, 0.25) });
        K.badge('BATCH', 540, 830, 'amber', { size: 56, sc: pop(lt, ba, 0.25) });
        K.stamp('SKIP COPIES', 540, 1010, 'mint', pop(lt, co, 0.25), -0.04, 70);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + 0.4, 'ping', { gain: 0.5 }); cue(st + ap, 'ping', { gain: 0.5 }); cue(st + ba, 'ping', { gain: 0.5 }); cue(st + co, 'thud', { gain: 0.6 }); }

  return { shots: S, cues: CUES };
}
