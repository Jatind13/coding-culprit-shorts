// Optimistic locking (movie seat A7). amber = data/version, cyan/violet = the two users, coral = conflict, mint = success.
import { ctx, C, W, H, clamp, lerp, seg, eo, eio, eob, rr, circle, line, txt } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';

const pop = (lt, a, d = 0.22) => eob(seg(lt, a, a + d));
const fade = (lt, a, d = 0.25) => eo(seg(lt, a, a + d));
const row = (label, val, x, y, col, a) => { txt(label, x, y, 40, C.dim, 'Mono', 'left', a); txt(val, x + 330, y, 46, col, 'Mono', 'left', a); };
const typeN = (lt, a, b, tot) => Math.floor(clamp((lt - a) / Math.max(0.2, b - a)) * tot);

export function buildShots() {
  const S = [], CUES = [];
  const add = (o) => (S.push(o), o);
  const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.1);

  // 1 · hook: two users, one seat, same millisecond
  { const st = cut(0), tw = Wd('two', 0) - st, se = Wd('seat', 0) - st, ms = Wd('millisecond', 0) - st, tk = Wd('ticket', 0) - st;
    add({ id: 'S01', at: st, cam: [540, 800], zoom: 0.05, note: 'Asha and Ben nodes on "two"; seat A7 on "seat"; two dots hit the seat together on "millisecond"; who gets it? on "ticket"',
      draw(lt) {
        K.stage(); K.title('ONE SEAT, TWO TAPS', null, pop(lt, 0.05, 0.3));
        K.node(190, 640, 'Asha', 'user', 'cyan', { s: 1.0, a: pop(lt, tw, 0.3) }); K.node(890, 640, 'Ben', 'user', 'violet', { s: 1.0, a: pop(lt, tw + 0.3, 0.3) });
        K.record(540, 940, 'seat A7', { color: 'amber', a: pop(lt, se, 0.25), s: 1.6 });
        const a = fade(lt, se + 0.2); K.wire([[230, 730], [450, 880]], 'cyan', { a }); K.wire([[850, 730], [630, 880]], 'violet', { a });
        if (lt > ms - 0.4) { const u = clamp((lt - (ms - 0.4)) / 0.5); K.dot([[230, 730], [450, 880]], u, { color: C.cyan }); K.dot([[850, 730], [630, 880]], u, { color: C.violet }); }
        K.badge('same millisecond', 540, 470, 'coral', { size: 40, sc: pop(lt, ms, 0.25) });
        K.badge('who gets it?', 540, 1100, 'mint', { size: 44, sc: pop(lt, tk, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + tw, 'pop'); cue(st + tw + 0.3, 'pop', { gain: 0.5 }); cue(st + se, 'pop'); cue(st + ms, 'thud', { gain: 0.5 }); cue(st + tk, 'ping', { gain: 0.5 }); }

  // 2 · no lock, just read the version
  { const st = cut(1), ra = Wd('rare', 1) - st, lo = Wd('lock', 1) - st, ve = Wd('version', 1) - st;
    add({ id: 'S02', at: st, cam: [540, 800], zoom: 0.05, note: 'seats-table card with rows; NO LOCK badge on "lock"; focus box on the version row on "version"',
      draw(lt) {
        K.stage(); K.title('NO LOCK, JUST A VERSION', null, 1, C.amber);
        K.card(80, 430, 920, 360, { title: 'seats table', accent: 'amber', a: fade(lt, 0.1) });
        row('seat', 'A7', 130, 570, C.white, fade(lt, 0.3)); row('booked', 'no', 130, 665, C.white, fade(lt, ra)); row('version', '1', 130, 760, C.amber, fade(lt, ra + 0.3));
        K.badge('NO LOCK TAKEN', 540, 920, 'mint', { size: 44, sc: pop(lt, lo, 0.25) });
        K.focus(540, 760, 880, 92, lt, fade(lt, ve), C.amber);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ra, 'pop'); cue(st + lo, 'ping', { gain: 0.5 }); cue(st + ve, 'tock', { gain: 0.5 }); }

  // 3 · both read version one
  { const st = cut(2), bo = Wd('both', 2) - st, ve = Wd('version', 2) - st, bk = Wd('book', 2) - st;
    add({ id: 'S03', at: st, cam: [540, 800], zoom: 0.05, note: 'compact card (A7, version 1); Asha and Ben each copy it: "saw v1" chips on "version"; BOOK badges on "book"',
      draw(lt) {
        K.stage(); K.title('BOTH READ VERSION 1', null, 1, C.cyan);
        K.card(80, 410, 920, 240, { title: 'seat A7', accent: 'amber' }); row('booked', 'no', 130, 540, C.white, 1); row('version', '1', 130, 620, C.amber, 1);
        K.node(190, 860, 'Asha', 'user', 'cyan', { a: pop(lt, bo, 0.3) }); K.node(890, 860, 'Ben', 'user', 'violet', { a: pop(lt, bo + 0.2, 0.3) });
        const a = fade(lt, bo + 0.3); K.wire([[420, 660], [220, 770]], 'cyan', { a, dash: [10, 10] }); K.wire([[660, 660], [860, 770]], 'violet', { a, dash: [10, 10] });
        K.record(190, 1030, 'saw v1', { color: 'amber', a: pop(lt, ve, 0.25), s: 1.2 }); K.record(890, 1030, 'saw v1', { color: 'amber', a: pop(lt, ve + 0.15, 0.25), s: 1.2 });
        K.badge('BOOK', 190, 1140, 'mint', { size: 34, sc: pop(lt, bk, 0.25) }); K.badge('BOOK', 890, 1140, 'mint', { size: 34, sc: pop(lt, bk + 0.1, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + bo, 'pop'); cue(st + ve, 'click', { gain: 0.5 }); cue(st + bk, 'ping', { gain: 0.5 }); }

  // 4 · the guarded update
  { const st = cut(3), up = Wd('update', 3) - st, on = Wd('only', 3) - st;
    const ls = [{ t: 'UPDATE seats', c: 'white' }, { t: 'SET booked = true,', c: 'white' }, { t: '    version = 2', c: 'amber' }, { t: "WHERE seat = 'A7'", c: 'white' }, { t: 'AND version = 1;', c: 'mint' }];
    const tot = ls.reduce((n, l) => n + l.t.length, 0);
    add({ id: 'S04', at: st, cam: [540, 800], zoom: 0.05, note: 'the SQL types in line by line from "update"; the last line (AND version = 1) is mint and gets a focus box plus a VERSION CHECK badge on "only"',
      draw(lt) {
        K.stage(); K.title('THE GUARDED SAVE', null, 1, C.mint);
        K.terminal(80, 430, 920, 380, ls, typeN(lt, up, on + 0.3, tot), fade(lt, 0.05));
        K.focus(330, 744, 440, 72, lt, fade(lt, on), C.mint);
        K.badge('VERSION CHECK', 540, 930, 'mint', { size: 44, sc: pop(lt, on, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); for (let k = 0; k < 5; k++) cue(st + up + k * ((on - up) / 5), 'click', { gain: 0.25 }); cue(st + on, 'ping', { gain: 0.6 }); }

  // 5 · first one wins
  { const st = cut(4), fi = Wd('first', 4) - st, bk = Wd('booked', 4) - st, tw = Wd('two', 4) - st;
    add({ id: 'S05', at: st, cam: [540, 800], zoom: 0.05, note: 'Asha: 1 row changed on "first"; booked flips to yes and BOOKED stamp on "booked"; version 1 -> 2 on "two"',
      draw(lt) {
        K.stage(); K.title('FIRST ONE WINS', null, 1, C.mint);
        K.card(80, 430, 920, 360, { title: 'seat A7', accent: 'amber' });
        row('seat', 'A7', 130, 570, C.white, 1); row('booked', lt > bk ? 'yes' : 'no', 130, 665, lt > bk ? C.mint : C.white, 1); row('version', lt > tw ? '2' : '1', 130, 760, C.amber, 1);
        K.badge('Asha: 1 row changed', 540, 900, 'mint', { size: 40, sc: pop(lt, fi, 0.25) });
        K.stamp('BOOKED', 540, 1040, 'mint', pop(lt, bk, 0.25), -0.04, 60);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + fi, 'ping', { gain: 0.5 }); cue(st + bk, 'ping', { gain: 0.6 }); cue(st + tw, 'click', { gain: 0.5 }); }

  // 6 · second one loses: zero rows, conflict
  { const st = cut(5), sc = Wd('second', 5) - st, ze = Wd('zero', 5) - st, co = Wd('conflict', 5) - st;
    add({ id: 'S06', at: st, cam: [540, 800], zoom: 0.05, note: 'Ben card: row has version 2 vs Ben says version 1; 0 rows changed on "zero"; CONFLICT stamp on "conflict"',
      draw(lt) {
        K.stage(); K.title('SECOND ONE LOSES', null, 1, C.coral);
        K.card(80, 420, 920, 300, { title: 'Ben tries to save', accent: 'violet' });
        row('row has', 'version 2', 130, 560, C.amber, fade(lt, sc)); row('Ben says', 'version 1', 130, 655, C.coral, fade(lt, sc + 0.5));
        K.badge('0 rows changed', 540, 840, 'coral', { size: 48, sc: pop(lt, ze, 0.25) });
        K.stamp('CONFLICT', 540, 990, 'coral', pop(lt, co, 0.25), -0.04, 64);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + sc, 'pop'); cue(st + ze, 'miss', { gain: 0.6 }); cue(st + co, 'thud', { gain: 0.5 }); }

  // 7 · the catch: hot seat, retries pile up, retry limit
  { const st = cut(6), ct = Wd('catch', 6) - st, re = Wd('retrying', 6) - st, li = Wd('limit', 6) - st;
    add({ id: 'S07', at: st, cam: [540, 800], zoom: 0.05, note: 'coral title; four retry chips pulse on "retrying" while the coral wasted-retries meter climbs; it freezes and RETRY LIMIT badge pops on "limit"',
      draw(lt) {
        K.stage(); K.title('BUT THERE IS A CATCH', null, 1, C.coral);
        K.record(540, 460, 'hot seat', { color: 'coral', a: fade(lt, 0.15), s: 1.4 });
        [150, 400, 650, 900].forEach((x, i) => { const a = pop(lt, re + i * 0.12, 0.2); const pl = 1 + 0.06 * Math.sin((lt - re) * 8 + i); K.record(x, 650, 'retry', { color: 'violet', a: a * (lt > li ? 0.35 : 1), s: 0.9 * pl }); });
        const p = clamp((Math.min(lt, li) - re) / Math.max(0.4, li - re)) * 0.9;
        const a = fade(lt, re); ctx.save(); ctx.globalAlpha *= a; K.meter(80, 880, 920, p, 'coral', 'wasted retries', `${Math.round(p * 20)}`); ctx.restore();
        K.badge('RETRY LIMIT', 540, 1020, 'mint', { size: 50, sc: pop(lt, li, 0.25) });
        K.note('example numbers', 540, 1110, C.dim, fade(lt, li + 0.3), 40);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ct, 'pop'); cue(st + re, 'miss', { gain: 0.5 }); cue(st + li, 'ping', { gain: 0.6 }); }

  // 8 · verdict
  { const st = cut(7), ra = Wd('rare', 7) - st, rl = Wd('real', 7) - st;
    add({ id: 'S08', at: st, cam: [540, 800], zoom: 0.05, note: 'RARE CLASHES -> OPTIMISTIC (mint/violet) on "rare"; HOT ROW -> REAL LOCK (amber) on "real"',
      draw(lt) {
        K.stage(); K.title('PICK BY CONTENTION', null, 1, C.mint);
        K.badge('RARE CLASHES', 300, 620, 'mint', { size: 50, sc: pop(lt, 0.4, 0.25) }); K.wire([[515, 620], [615, 620]], 'mint', { a: fade(lt, 0.7) }); K.badge('OPTIMISTIC', 800, 620, 'violet', { size: 50, sc: pop(lt, 0.8, 0.25) });
        K.badge('HOT ROW', 260, 900, 'amber', { size: 50, sc: pop(lt, rl - 0.1, 0.25) }); K.wire([[440, 900], [560, 900]], 'amber', { a: fade(lt, rl + 0.1) }); K.badge('REAL LOCK', 800, 900, 'amber', { size: 50, sc: pop(lt, rl + 0.2, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ra, 'ping', { gain: 0.5 }); cue(st + rl, 'ping', { gain: 0.6 }); }

  return { shots: S, cues: CUES };
}
