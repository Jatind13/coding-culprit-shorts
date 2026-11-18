// Luhn check: shot list (Blueprint). digits grid, doubled cells violet, check digit mint, total amber, fail coral.
import { ctx, C, W, H, clamp, lerp, seg, eo, eio, eob, rr, circle, line, txt } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';

const pop = (lt, a, d = 0.22) => eob(seg(lt, a, a + d));
const fade = (lt, a, d = 0.25) => eo(seg(lt, a, a + d));

const CELL = 52, GAP = 8, GX0 = 64, GY = 700;
const cx = (i) => GX0 + i * (CELL + GAP) + CELL / 2;
const DIG = [4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];   // 4111 1111 1111 1111 (test number, total 30)
const DBL = [0, 2, 4, 6, 8, 10, 12, 14];                          // every second digit from the right
function grid(a, f, digits = DIG) {
  ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < 16; i++) {
    const s = f(i) || {}, x = cx(i) - CELL / 2;
    ctx.save(); ctx.globalAlpha *= (s.a ?? 1);
    rr(x, GY - 45, CELL, 90, 12); ctx.fillStyle = C.card; ctx.fill();
    rr(x, GY - 45, CELL, 90, 12); ctx.lineWidth = s.edge ? 6 : 3; ctx.strokeStyle = s.edge || C.stroke; ctx.stroke();
    txt(String(s.d ?? digits[i]), cx(i), GY + 2, 36, s.col || C.white, 'Mono');
    ctx.restore();
  }
  ctx.restore();
}

export function buildShots() {
  const S = [], CUES = [];
  const add = (o) => (S.push(o), o);
  const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.1);

  // 1 · hook: typo -> site complains, bank never asked
  { const st = cut(0), mi = Wd('mistype', 0) - st, co = Wd('complains', 0) - st, ba = Wd('bank', 0) - st;
    add({ id: 'S01', at: st, cam: [540, 800], zoom: 0.05, note: 'card number appears, last digit turns coral on "mistype"; INVALID NUMBER badge under the browser on "complains"; the wire to the bank gets a cross on "bank"',
      draw(lt) {
        K.stage(); K.title('WRONG DIGIT, INSTANT NO', null, pop(lt, 0.05, 0.3));
        const ca = fade(lt, 0.2); ctx.save(); ctx.globalAlpha *= ca; rr(140, 420, 800, 150, 24); ctx.fillStyle = C.card; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.stroke; ctx.stroke(); ctx.restore();
        const bad = lt > mi; const g = ['4111', '1111', '1111', '111'];
        txt(g.join(' ') + ' ', 470, 497, 52, C.white, 'Mono', 'center', ca);
        txt(bad ? '2' : '1', 810, 497, 52, bad ? C.coral : C.white, 'Mono', 'center', ca);
        K.node(190, 800, 'site', 'browser', 'cyan', { s: 1.1, a: fade(lt, 0.5) });
        K.node(880, 800, 'bank', 'db', 'amber', { s: 1.1, a: fade(lt, 0.5), dim: lt > co ? 0.55 : 0 });
        K.wire([[300, 800], [770, 800]], 'stroke', { a: fade(lt, 0.5), dash: [12, 10] }); K.cross(540, 800, pop(lt, ba, 0.22) * 0.9, 'coral');
        K.badge('INVALID NUMBER', 190, 960, 'coral', { size: 32, sc: pop(lt, co, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + mi, 'miss', { gain: 0.5 }); cue(st + co, 'ping', { gain: 0.4 }); cue(st + ba, 'thud', { gain: 0.4 }); }

  // 2 · the Luhn check digit
  { const st = cut(1), lu = Wd('Luhn', 1) - st, ch = Wd('check', 1) - st;
    add({ id: 'S02', at: st, cam: [540, 800], zoom: 0.05, note: 'the sixteen digits pop in; mint box on the last digit and CHECK DIGIT badge on "check"',
      draw(lt) {
        K.stage(); K.title('THE LUHN CHECK', null, 1, C.violet);
        for (let i = 0; i < 16; i++) { const a = pop(lt, 0.15 + i * 0.04, 0.2); grid(a, (k) => (k === i ? (k === 15 && lt > ch - 0.4 ? { edge: C.mint } : {}) : { a: 0 })); }
        K.badge('example: 4111 1111 1111 1111', 540, 470, 'violet', { size: 34, sc: pop(lt, lu, 0.25) });
        K.focus(cx(15), GY, 74, 120, lt, fade(lt, ch - 0.4), C.mint);
        K.badge('CHECK DIGIT', cx(15) - 150, 860, 'mint', { size: 36, sc: pop(lt, ch, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); for (let k = 0; k < 5; k++) cue(st + 0.15 + k * 0.16, 'click', { gain: 0.25 }); cue(st + lu, 'pop'); cue(st + ch, 'ping', { gain: 0.5 }); }

  // 3 · from the right, double every second digit
  { const st = cut(2), ri = Wd('right', 2) - st, dbl = Wd('double', 2) - st, two = Wd('two', 2) - st, ad = Wd('add', 2) - st;
    add({ id: 'S03', at: st, cam: [540, 800], zoom: 0.05, note: 'arrow "start" at the right on "right"; every second digit from the right turns violet and its doubled value drops beneath it on "double"; example 14 -> 1+4 = 5 on "two"/"add"',
      draw(lt) {
        K.stage(); K.title('DOUBLE EVERY SECOND', null, 1, C.violet);
        grid(1, (i) => (i === 15 ? { edge: C.mint } : DBL.includes(i) ? { edge: C.violet, a: fade(lt, dbl - 0.1, 0.2) < 0.1 ? 1 : 1 } : null));
        K.note('start here', cx(15) - 60, 560, C.mint, fade(lt, ri - 0.1), 44); K.wire([[cx(15), 585], [cx(15), 640]], 'mint', { a: fade(lt, ri) });
        DBL.slice().reverse().forEach((i, k) => { const a = pop(lt, dbl + k * 0.16, 0.2); txt(String(DIG[i] * 2), cx(i), 860, 38, C.violet, 'Mono', 'center', a); });
        K.badge('over 9: 7 -> 14 -> 1 + 4 = 5', 540, 1030, 'violet', { size: 34, sc: pop(lt, two, 0.25) });
        K.note('example', 540, 1100, C.dim, fade(lt, two + 0.2), 40);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ri, 'pop'); DBL.forEach((_, k) => cue(st + dbl + k * 0.16, 'click', { gain: 0.3 })); cue(st + two, 'pop', { gain: 0.5 }); }

  // 4 · add up; ends in zero -> passes
  { const st = cut(3), ad = Wd('add', 3) - st, ze = Wd('zero', 3) - st, pa = Wd('passes', 3) - st;
    add({ id: 'S04', at: st, cam: [540, 800], zoom: 0.05, note: 'total counts up to 30 on "add"; the 0 gets a mint focus on "zero"; PASSES stamp on "passes"',
      draw(lt) {
        K.stage(); K.title('ADD IT ALL UP', null, 1, C.amber);
        grid(1, (i) => (i === 15 ? { edge: C.mint } : DBL.includes(i) ? { edge: C.violet } : null));
        DBL.forEach((i) => txt(String(DIG[i] * 2), cx(i), 860, 38, C.violet, 'Mono'));
        const n = Math.round(clamp((lt - ad) / 1.2) * 30);
        K.badge(`total = ${n}`, 540, 1000, 'amber', { size: 64, sc: pop(lt, ad - 0.1, 0.25) });
        K.focus(540 + 118, 1000, 150, 110, lt, fade(lt, ze), C.mint);
        K.stamp('PASSES', 540, 1130, 'mint', pop(lt, pa, 0.25), -0.04, 60);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ad, 'pop'); for (let k = 0; k < 6; k++) cue(st + ad + k * 0.2, 'tock', { gain: 0.25 }); cue(st + ze, 'ping', { gain: 0.5 }); cue(st + pa, 'ping', { gain: 0.6 }); }

  // 5 · change one digit: 31, rejected as a typo
  { const st = cut(4), on = Wd('one', 4) - st, th = Wd('thirty', 4) - st, re = Wd('rejects', 4) - st;
    add({ id: 'S05', at: st, cam: [540, 800], zoom: 0.05, note: 'last digit changes 1 -> 2 in coral on "one"; total becomes 31 on "thirty"; REJECTED stamp on "rejects"',
      draw(lt) {
        K.stage(); K.title('ONE DIGIT OFF', null, 1, C.coral);
        const bad = lt > on;
        grid(1, (i) => (i === 15 ? (bad ? { edge: C.coral, col: C.coral, d: 2 } : { edge: C.mint }) : DBL.includes(i) ? { edge: C.violet } : null));
        DBL.forEach((i) => txt(String(DIG[i] * 2), cx(i), 860, 38, C.violet, 'Mono'));
        K.focus(cx(15), GY, 74, 120, lt, fade(lt, on), C.coral);
        K.badge(`total = ${lt > th ? 31 : 30}`, 540, 1000, lt > th ? 'coral' : 'amber', { size: 64, sc: pop(lt, th - 0.05, 0.22) * 0 + 1 });
        K.stamp('REJECTED', 540, 1130, 'coral', pop(lt, re, 0.25), -0.04, 60);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + on, 'miss', { gain: 0.5 }); cue(st + th, 'pop'); cue(st + re, 'thud', { gain: 0.5 }); }

  // 6 · the catch: anyone can invent a passing number
  { const st = cut(5), ct = Wd('catch', 5) - st, inv = Wd('invent', 5) - st, ps = Wd('passes', 5) - st, no = Wd('nothing', 5) - st;
    add({ id: 'S06', at: st, cam: [540, 800], zoom: 0.05, note: 'coral title; a made-up number 4000 0000 0000 0002 appears on "invent" with a mint PASSES LUHN badge; coral "real account?" question badge on "nothing"',
      draw(lt) {
        K.stage(); K.title('BUT THERE IS A CATCH', null, 1, C.coral);
        const ca = fade(lt, ct + 0.5); ctx.save(); ctx.globalAlpha *= ca; rr(140, 450, 800, 150, 24); ctx.fillStyle = C.card; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.stroke; ctx.stroke(); ctx.restore();
        txt('4000 0000 0000 0002', 540, 527, 52, C.white, 'Mono', 'center', ca);
        K.note('made-up number', 540, 650, C.dim, fade(lt, ct + 0.9), 44);
        K.badge('PASSES LUHN', 540, 780, 'mint', { size: 50, sc: pop(lt, ps, 0.25) });
        K.badge('REAL ACCOUNT?', 540, 930, 'coral', { size: 50, sc: pop(lt, no, 0.25) });
        K.note('unknown', 540, 1020, C.dim, fade(lt, no + 0.3), 44);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ct, 'pop'); cue(st + ct + 0.5, 'pop', { gain: 0.5 }); cue(st + ps, 'ping', { gain: 0.5 }); cue(st + no, 'miss', { gain: 0.6 }); }

  // 7 · the real check is the bank
  { const st = cut(6), ba = Wd('bank', 6) - st, wa = Wd('wasted', 6) - st;
    add({ id: 'S07', at: st, cam: [540, 800], zoom: 0.05, note: 'site -> Luhn -> bank; dot travels; amber BANK APPROVES badge on "bank"; "saves a wasted trip" note on "wasted"',
      draw(lt) {
        K.stage(); K.title('THE BANK DECIDES', null, 1, C.amber);
        K.node(170, 720, 'site', 'browser', 'cyan', { a: fade(lt, 0.1) }); K.node(540, 720, 'Luhn', 'cache', 'violet', { a: pop(lt, 0.4, 0.3) }); K.node(910, 720, 'bank', 'db', 'amber', { a: pop(lt, 0.8, 0.3) });
        K.wire([[280, 720], [430, 720]], 'cyan', { a: fade(lt, 0.5) }); K.wire([[650, 720], [800, 720]], 'violet', { a: fade(lt, 0.9) });
        if (lt > 0.7) K.dot([[280, 720], [430, 720]], ((lt - 0.7) * 0.8) % 1, {}); if (lt > ba) K.dot([[650, 720], [800, 720]], ((lt - ba) * 0.8) % 1, {});
        K.badge('BANK APPROVES', 800, 930, 'amber', { size: 34, sc: pop(lt, ba, 0.25) });
        K.note('saves a wasted trip', 540, 560, C.violet, fade(lt, wa), 48);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + 0.4, 'pop', { gain: 0.4 }); cue(st + 0.8, 'pop', { gain: 0.4 }); cue(st + ba, 'ping', { gain: 0.6 }); }

  // 8 · verdict: typo filter, never proof
  { const st = cut(7), ty = Wd('typo', 7) - st, pr = Wd('proof', 7) - st;
    add({ id: 'S08', at: st, cam: [540, 800], zoom: 0.05, note: 'mint TYPO FILTER with a check on "typo"; coral NOT PROOF with a cross on "proof"',
      draw(lt) {
        K.stage(); K.title('TYPO FILTER, NOT PROOF', null, 1, C.mint);
        K.record(200, 620, 'Luhn', { color: 'violet', a: fade(lt, 0.1), s: 1.5 });
        K.badge('TYPO FILTER', 630, 620, 'mint', { size: 64, sc: pop(lt, ty, 0.25) }); K.check(975, 620, pop(lt, ty + 0.2, 0.22) * 0.9, 'mint');
        K.record(200, 900, 'card', { color: 'cyan', a: fade(lt, ty + 0.5), s: 1.5 });
        K.badge('NOT PROOF', 630, 900, 'coral', { size: 64, sc: pop(lt, pr, 0.25) }); K.cross(975, 900, pop(lt, pr + 0.2, 0.22) * 0.9, 'coral');
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ty, 'ping', { gain: 0.6 }); cue(st + pr, 'thud', { gain: 0.5 }); }

  return { shots: S, cues: CUES };
}
