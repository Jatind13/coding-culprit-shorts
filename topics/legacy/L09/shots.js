// How websites store passwords. cyan = the user's input, amber = data/hashes, violet = hash function/salt, coral = problem, mint = good.
import { ctx, C, W, H, clamp, lerp, seg, eo, eio, eob, rr, circle, line, txt } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';

const pop = (lt, a, d = 0.22) => eob(seg(lt, a, a + d));
const fade = (lt, a, d = 0.25) => eo(seg(lt, a, a + d));
const row = (label, val, x, y, col, a) => { txt(label, x, y, 40, C.dim, 'Mono', 'left', a); txt(val, x + 330, y, 46, col, 'Mono', 'left', a); };
// text chip that sizes itself (centre origin)
const chip = (text, x, y, col, a = 1, size = 38) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `700 ${size}px "JetBrains Mono", monospace`; const w = ctx.measureText(text).width + 56; rr(x - w / 2, y - 36, w, 72, 18); ctx.fillStyle = C.bgDeep; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke(); ctx.restore(); txt(text, x, y + 2, size, C.white, 'Mono', 'center', a); };
const H1 = 'e9b2c41f', H2 = 'd04c7e19', H3 = '51abf2c8';

export function buildShots() {
  const S = [], CUES = [];
  const add = (o) => (S.push(o), o);
  const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.1);

  // 1 · hook: password goes in, but never gets saved
  { const st = cut(0), pw = Wd('password', 0) - st, nv = Wd('never', 0) - st, ke = Wd('keep', 0) - st;
    add({ id: 'S01', at: st, cam: [540, 800], zoom: 0.05, note: 'sign-up card with the password cat123; wire to the database with a coral cross on "never"; "stores what?" on "keep"',
      draw(lt) {
        K.stage(); K.title('WHAT DOES THE SITE KEEP?', null, pop(lt, 0.05, 0.3));
        K.card(80, 400, 920, 230, { title: 'sign up', accent: 'cyan', a: fade(lt, 0.1) }); row('password', 'cat123', 130, 540, C.cyan, fade(lt, 0.4));
        K.wire([[540, 650], [540, 840]], 'dim', { a: fade(lt, pw) }); if (lt > pw - 0.3) K.dot([[540, 650], [540, 840]], clamp((lt - (pw - 0.3)) / 0.7), { color: C.cyan });
        K.node(540, 930, 'database', 'db', 'violet', { a: pop(lt, 0.3, 0.3), s: 1.1 });
        if (lt > nv) K.cross(700, 745, pop(lt, nv, 0.25), 'coral');
        K.badge('stores what?', 540, 1100, 'mint', { size: 44, sc: pop(lt, ke, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + pw, 'pop'); cue(st + nv, 'miss', { gain: 0.5 }); cue(st + ke, 'ping', { gain: 0.5 }); }

  // 2 · plain text and encryption both fail
  { const st = cut(1), pl = Wd('plain', 1) - st, le = Wd('leak', 1) - st, en = Wd('encryption', 1) - st, tw = Wd('two-way', 1) - st;
    add({ id: 'S02', at: st, cam: [540, 800], zoom: 0.05, note: 'users table in plain text, ONE LEAK badge on "leak"; values swap to encrypted on "encryption"; REVERSIBLE stamp on "two-way"',
      draw(lt) {
        K.stage(); K.title('TWO BAD IDEAS', null, 1, C.coral);
        const enc = lt > en;
        K.card(80, 400, 920, 330, { title: enc ? 'users table (encrypted)' : 'users table (plain text)', accent: 'coral', a: fade(lt, 0.1) });
        row('asha', enc ? 'x8Qa7fK2' : 'cat123', 130, 540, enc ? C.amber : C.coral, fade(lt, pl)); row('ben', enc ? 'm2Zp90Lw' : 'qwerty', 130, 640, enc ? C.amber : C.coral, fade(lt, pl + 0.3));
        K.badge('ONE LEAK, ALL EXPOSED', 540, 860, 'coral', { size: 40, sc: pop(lt, le, 0.25) });
        K.stamp('REVERSIBLE', 540, 1020, 'coral', pop(lt, tw, 0.25), -0.04, 64);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + pl, 'pop'); cue(st + le, 'miss', { gain: 0.6 }); cue(st + en, 'click', { gain: 0.5 }); cue(st + tw, 'thud', { gain: 0.5 }); }

  // 3 · a hash: one-way scramble
  { const st = cut(2), ha = Wd('hash', 2) - st, ow = Wd('one-way', 2) - st, sc = Wd('scramble', 2) - st;
    add({ id: 'S03', at: st, cam: [540, 800], zoom: 0.05, note: 'cat123 goes through hash() on "hash"; result chip appears on "scramble"; a coral cross on the way back on "one-way"',
      draw(lt) {
        K.stage(); K.title('A HASH', null, 1, C.violet);
        chip('cat123', 190, 640, C.cyan, pop(lt, 0.1, 0.25)); K.badge('hash()', 540, 640, 'violet', { size: 40, sc: pop(lt, ha, 0.25) }); chip(H1, 890, 640, C.amber, pop(lt, sc, 0.25), 32);
        const a = fade(lt, ha); K.wire([[300, 640], [440, 640]], 'cyan', { a }); K.wire([[640, 640], [770, 640]], 'amber', { a });
        if (lt > ha) { const u = clamp((lt - ha) / (sc - ha + 0.1)); K.dot([[300, 640], [440, 640], [640, 640], [770, 640]], u, { color: C.mint }); }
        K.wire([[780, 790], [300, 790]], 'coral', { a: fade(lt, ow), dash: [14, 12] }); K.cross(540, 790, 1.1, 'coral');
        K.badge('ONE-WAY', 540, 960, 'mint', { size: 46, sc: pop(lt, ow, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ha, 'pop'); cue(st + sc, 'ping', { gain: 0.5 }); cue(st + ow, 'miss', { gain: 0.5 }); }

  // 4 · login: hash what you type, compare
  { const st = cut(3), hs = Wd('hashes', 3) - st, ty = Wd('type', 3) - st, co = Wd('compares', 3) - st;
    add({ id: 'S04', at: st, cam: [540, 800], zoom: 0.05, note: 'typed cat123 -> hash() -> chip on "hashes"; saved hash below; focus + MATCH + check on "compares"',
      draw(lt) {
        K.stage(); K.title('LOGIN = COMPARE HASHES', null, 1, C.mint);
        chip('cat123', 190, 540, C.cyan, pop(lt, 0.1, 0.25)); K.badge('hash()', 540, 540, 'violet', { size: 40, sc: pop(lt, hs, 0.25) }); chip(H1, 890, 540, C.amber, pop(lt, hs + 0.4, 0.25), 32);
        K.wire([[300, 540], [440, 540]], 'cyan', { a: fade(lt, hs) }); K.wire([[640, 540], [770, 540]], 'amber', { a: fade(lt, hs + 0.2) });
        txt('saved in database', 540, 740, 34, C.dim, 'Mono', 'center', fade(lt, ty)); chip(H1, 890, 820, C.violet, pop(lt, ty + 0.1, 0.25), 32);
        K.focus(890, 680, 300, 380, lt, fade(lt, co), C.mint);
        K.badge('MATCH', 400, 930, 'mint', { size: 50, sc: pop(lt, co + 0.15, 0.25) }); if (lt > co + 0.3) K.check(700, 930, 1.1 * pop(lt, co + 0.3, 0.25), 'mint');
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + hs, 'pop'); cue(st + ty, 'click', { gain: 0.5 }); cue(st + co, 'ping', { gain: 0.6 }); }

  // 5 · same password, same hash -> lookup tables
  { const st = cut(4), sp = Wd('same', 4) - st, sh = Wd('hash', 4) - st, lt2 = Wd('lookup', 4) - st;
    add({ id: 'S05', at: st, cam: [540, 800], zoom: 0.05, note: 'two users with the same hash on "same"; focus on both on "hash"; attacker table card and CRACKED badge on "lookup"',
      draw(lt) {
        K.stage(); K.title('SAME IN, SAME OUT', null, 1, C.coral);
        K.card(80, 390, 920, 250, { title: 'users table', accent: 'amber', a: fade(lt, 0.1) });
        row('asha', H1, 130, 520, C.amber, fade(lt, 0.3)); row('ben', H1, 130, 600, C.amber, fade(lt, sp));
        K.focus(540, 560, 840, 190, lt, fade(lt, sh), C.coral);
        K.card(80, 700, 920, 250, { title: 'attacker: precomputed table', accent: 'coral', a: fade(lt, lt2) });
        row('cat123', H1, 130, 830, C.coral, fade(lt, lt2 + 0.2)); row('qwerty', '7c0d3aa5', 130, 910, C.dim, fade(lt, lt2 + 0.4));
        K.badge('CRACKED', 540, 1060, 'coral', { size: 48, sc: pop(lt, lt2 + 0.6, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + sp, 'pop'); cue(st + sh, 'tock', { gain: 0.5 }); cue(st + lt2, 'miss', { gain: 0.5 }); cue(st + lt2 + 0.6, 'thud', { gain: 0.5 }); }

  // 6 · salt
  { const st = cut(5), sa = Wd('salt', 5) - st, be = Wd('before', 5) - st, di = Wd('different', 5) - st;
    add({ id: 'S06', at: st, cam: [540, 800], zoom: 0.05, note: 'violet salt chips pop on "salt"; hashes change on "before"; DIFFERENT HASHES + check on "different"',
      draw(lt) {
        K.stage(); K.title('ADD A RANDOM SALT', null, 1, C.violet);
        const nw = lt > be;
        K.card(80, 400, 920, 330, { title: 'users table', accent: 'amber', a: fade(lt, 0.1) });
        row('asha', nw ? H2 : H1, 130, 540, nw ? C.mint : C.amber, 1); row('ben', nw ? H3 : H1, 130, 650, nw ? C.mint : C.amber, 1);
        txt('+a1f3', 775, 540, 40, C.violet, 'Mono', 'left', pop(lt, sa, 0.25)); txt('+b7c9', 775, 650, 40, C.violet, 'Mono', 'left', pop(lt, sa + 0.15, 0.25));
        K.focus(845, 595, 200, 190, lt, fade(lt, sa), C.violet);
        K.badge('DIFFERENT HASHES', 540, 880, 'mint', { size: 44, sc: pop(lt, di, 0.25) }); if (lt > di + 0.2) K.check(540, 1020, 1.2 * pop(lt, di + 0.2, 0.25), 'mint');
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + sa, 'pop'); cue(st + sa + 0.15, 'pop', { gain: 0.5 }); cue(st + be, 'click', { gain: 0.5 }); cue(st + di, 'ping', { gain: 0.6 }); }

  // 7 · the catch: fast hash helps guessers
  { const st = cut(6), ct = Wd('catch', 6) - st, fa = Wd('fast', 6) - st, sl = Wd('slow', 6) - st, ar = Wd('argon2id', 6) - st, at = Wd('attackers', 6) - st, gu = Wd('guess', 6) - st;
    add({ id: 'S07', at: st, cam: [540, 800], zoom: 0.05, note: 'coral title; fast-hash guess meter races up on "fast"; slow-hash meter barely moves on "slow"; ARGON2ID badge on "argon2id"',
      draw(lt) {
        K.stage(); K.title('BUT THERE IS A CATCH', null, 1, C.coral);
        const p1 = clamp((lt - gu) / (fa + 0.9 - gu)) * 0.95, p2 = clamp((lt - sl) / 1.2) * 0.12;
        ctx.save(); ctx.globalAlpha *= fade(lt, at - 0.2); K.meter(80, 560, 920, p1, 'coral', 'attacker guesses: fast hash', p1 > 0.5 ? 'MANY' : ''); ctx.restore();
        ctx.save(); ctx.globalAlpha *= fade(lt, sl - 0.1); K.meter(80, 800, 920, p2, 'mint', 'attacker guesses: slow hash', p2 > 0.08 ? 'FEW' : ''); ctx.restore();
        K.badge('ARGON2ID', 540, 1010, 'mint', { size: 50, sc: pop(lt, ar, 0.25) });
        K.note('illustration, not measured', 540, 1110, C.dim, fade(lt, ar + 0.2), 40);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ct, 'pop'); cue(st + gu, 'miss', { gain: 0.5 }); cue(st + sl, 'tock', { gain: 0.5 }); cue(st + ar, 'ping', { gain: 0.6 }); }

  // 8 · verdict
  { const st = cut(7), nv = Wd('never', 7) - st, sa = Wd('salted', 7) - st, sl = Wd('slow', 7) - st, ar = Wd('argon2id', 7) - st;
    add({ id: 'S08', at: st, cam: [540, 800], zoom: 0.05, note: 'NEVER THE PASSWORD (coral) on "never"; + SALT on "salted"; + SLOW HASH on "slow"; ARGON2ID stamp on "argon2id"',
      draw(lt) {
        K.stage(); K.title('THE RECIPE', null, 1, C.mint);
        K.badge('NEVER THE PASSWORD', 540, 520, 'coral', { size: 50, sc: pop(lt, 0.4, 0.25) });
        K.badge('+ SALT', 540, 680, 'violet', { size: 56, sc: pop(lt, sa, 0.25) });
        K.badge('+ SLOW HASH', 540, 830, 'amber', { size: 56, sc: pop(lt, sl, 0.25) });
        K.stamp('ARGON2ID', 540, 1020, 'mint', pop(lt, ar, 0.25), -0.04, 76);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + 0.4, 'miss', { gain: 0.5 }); cue(st + sa, 'ping', { gain: 0.5 }); cue(st + sl, 'ping', { gain: 0.5 }); cue(st + ar, 'thud', { gain: 0.6 }); }

  return { shots: S, cues: CUES };
}
