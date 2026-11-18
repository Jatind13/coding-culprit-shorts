// OTP expiry: shot list (Blueprint). amber = stored data/deadline, cyan = now/clock, violet = db/secret, coral = rejected/problem, mint = ok.
import { ctx, C, W, H, clamp, lerp, seg, eo, eio, eob, rr, circle, line, txt } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';

const pop = (lt, a, d = 0.22) => eob(seg(lt, a, a + d));
const fade = (lt, a, d = 0.25) => eo(seg(lt, a, a + d));
const row = (label, val, x, y, col, a) => { txt(label, x, y, 40, C.dim, 'Mono', 'left', a); txt(val, x + 330, y, 46, col, 'Mono', 'left', a); };

export function buildShots() {
  const S = [], CUES = [];
  const add = (o) => (S.push(o), o);
  const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.1);

  // 1 · hook: works at 4:59, fails at 5:01, what is counting?
  { const st = cut(0), wo = Wd('works', 0) - st, fa = Wd('fails', 0) - st, co = Wd('counting', 0) - st;
    add({ id: 'S01', at: st, cam: [540, 800], zoom: 0.05, note: 'timeline with a 5:00 marker; mint dot at 4:59 on "works"; coral dot at 5:01 on "fails"; violet WHAT IS COUNTING? on "counting"',
      draw(lt) {
        K.stage(); K.title('EXACTLY FIVE MINUTES?', null, pop(lt, 0.05, 0.3));
        const a = fade(lt, 0.2); K.wire([[80, 740], [1000, 740]], 'stroke', { a });
        txt('0:00', 100, 810, 34, C.dim, 'Mono', 'center', a); txt('5:00', 760, 810, 34, C.amber, 'Mono', 'center', a);
        ctx.save(); ctx.globalAlpha *= a; ctx.setLineDash([12, 10]); line([[760, 650], [760, 740]], C.amber, 4); ctx.restore();
        circle(690, 740, 20 * pop(lt, wo, 0.22), C.mint); K.badge('4:59 works', 600, 600, 'mint', { size: 36, sc: pop(lt, wo, 0.25) });
        circle(830, 740, 20 * pop(lt, fa, 0.22), C.coral); K.badge('5:01 fails', 840, 880, 'coral', { size: 36, sc: pop(lt, fa, 0.25) });
        K.badge('what is counting?', 540, 1040, 'violet', { size: 44, sc: pop(lt, co, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + wo, 'ping', { gain: 0.5 }); cue(st + fa, 'miss', { gain: 0.5 }); cue(st + co, 'pop'); }

  // 2 · save with a deadline
  { const st = cut(1), sa = Wd('saves', 1) - st, de = Wd('deadline', 1) - st, pl = Wd('plus', 1) - st;
    add({ id: 'S02', at: st, cam: [540, 800], zoom: 0.05, note: 'stored record card: code on "saves", deadline row on "deadline", +5 min badge on "plus"; note says example numbers',
      draw(lt) {
        K.stage(); K.title('SAVE A DEADLINE', null, 1, C.amber);
        K.card(80, 430, 920, 400, { title: 'stored record', accent: 'amber', a: fade(lt, 0.1) });
        row('code', '482913', 130, 570, C.white, fade(lt, sa - 0.1)); row('created', '12:00:00', 130, 665, C.white, fade(lt, sa + 0.3)); row('deadline', '12:05:00', 130, 760, C.amber, fade(lt, de - 0.1));
        K.badge('+ 5 min', 830, 665, 'mint', { size: 40, sc: pop(lt, pl, 0.25) });
        K.note('example numbers', 540, 920, C.dim, fade(lt, pl + 0.3), 44);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + sa, 'click', { gain: 0.5 }); cue(st + de, 'pop'); cue(st + pl, 'ping', { gain: 0.5 }); }

  // 3 · compare on use
  { const st = cut(2), cm = Wd('compares', 2) - st, rj = Wd('rejects', 2) - st, ps = Wd('passed', 2) - st;
    add({ id: 'S03', at: st, cam: [540, 800], zoom: 0.05, note: 'check card: deadline row stays, "now" row on "compares"; REJECTED stamp on "rejects"; coral now > deadline badge on "passed"',
      draw(lt) {
        K.stage(); K.title('CHECK ON USE', null, 1, C.cyan);
        K.card(80, 420, 920, 300, { title: 'when you type it', accent: 'cyan' });
        row('deadline', '12:05:00', 130, 560, C.amber, 1); row('now', '12:06:10', 130, 655, C.cyan, fade(lt, cm - 0.1));
        K.stamp('REJECTED', 540, 860, 'coral', pop(lt, rj, 0.25), -0.04, 64);
        K.badge('now > deadline', 540, 1010, 'coral', { size: 44, sc: pop(lt, ps, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + cm, 'pop'); cue(st + rj, 'thud', { gain: 0.5 }); cue(st + ps, 'miss', { gain: 0.4 }); }

  // 4 · database time to live
  { const st = cut(3), db = Wd('database', 3) - st, li = Wd('live', 3) - st, di = Wd('disappears', 3) - st;
    add({ id: 'S04', at: st, cam: [540, 800], zoom: 0.05, note: 'database node + code chip; TTL meter appears on "live" and drains to 0 by "disappears"; chip fades with a cross on "disappears"',
      draw(lt) {
        K.stage(); K.title('LET THE DATABASE DO IT', null, 1, C.violet);
        K.node(190, 650, 'database', 'cache', 'violet', { s: 1.1, a: pop(lt, 0.2, 0.3) });
        const ra = 1 - fade(lt, di, 0.3); K.record(700, 650, '482913', { color: 'amber', a: pop(lt, db, 0.25) * ra, s: 1.5 });
        const p = 1 - clamp((lt - li - 0.2) / Math.max(0.3, di - li - 0.2)); const a = fade(lt, li - 0.1);
        K.meter(80, 900, 920, p, 'violet', 'time to live', `${Math.round(p * 300)}s`); void a;
        K.cross(700, 650, pop(lt, di + 0.05, 0.22) * 0.9, 'coral');
        K.note('example: 300 s', 540, 1010, C.dim, fade(lt, li + 0.2), 44);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + db, 'pop'); cue(st + li, 'pop', { gain: 0.5 }); cue(st + di, 'thud', { gain: 0.5 }); }

  // 5 · TOTP: nothing stored
  { const st = cut(4), sg = Wd('storage', 4) - st, se = Wd('secret', 4) - st, th = Wd('thirty', 4) - st;
    add({ id: 'S05', at: st, cam: [540, 800], zoom: 0.05, note: 'phone and server each compute the same code; "nothing stored" note on "storage"; violet secret + clock badge on "secret"; spinner and 30 s on "thirty"',
      draw(lt) {
        K.stage(); K.title('NO STORAGE AT ALL', null, 1, C.violet);
        K.node(190, 650, 'phone', 'phone', 'cyan', { s: 1.1, a: fade(lt, 0.1) }); K.node(890, 650, 'server', 'server', 'amber', { s: 1.1, a: fade(lt, 0.2) });
        K.note('nothing stored', 540, 470, C.coral, fade(lt, sg), 52);
        K.badge('secret + clock', 540, 650, 'violet', { size: 32, sc: pop(lt, se, 0.25) });
        K.record(190, 850, '913 204', { color: 'mint', a: pop(lt, se + 0.4, 0.25), s: 1.2 }); K.record(890, 850, '913 204', { color: 'mint', a: pop(lt, se + 0.55, 0.25), s: 1.2 });
        txt('=', 540, 850, 90, C.mint, 'Inter', 'center', fade(lt, se + 0.7));
        const ta = fade(lt, th - 0.2); K.spinner(430, 1040, 50, lt, 'violet'); txt('new code / 30 s', 700, 1040, 36, C.violet, 'Mono', 'center', ta);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + sg, 'pop'); cue(st + se, 'ping', { gain: 0.5 }); cue(st + th, 'tock', { gain: 0.5 }); }

  // 6 · the catch: guessing; limits + single use
  { const st = cut(5), ct = Wd('catch', 5) - st, gu = Wd('guessing', 5) - st, lm = Wd('limits', 5) - st, su = Wd('single', 5) - st;
    add({ id: 'S06', at: st, cam: [540, 800], zoom: 0.05, note: 'coral title; six digit boxes flicker on "guessing" with a 1,000,000 codes badge; they freeze on "limits" with a MAX 5 TRIES badge; ONE USE ONLY on "single"',
      draw(lt) {
        K.stage(); K.title('BUT THERE IS A CATCH', null, 1, C.coral);
        const frozen = lt > lm, x0 = 205;
        for (let i = 0; i < 6; i++) { const x = x0 + i * 114, a = fade(lt, ct + 0.2 + i * 0.05, 0.2);
          ctx.save(); ctx.globalAlpha *= a; rr(x, 480, 100, 150, 16); ctx.fillStyle = C.card; ctx.fill(); ctx.lineWidth = frozen ? 5 : 3; ctx.strokeStyle = frozen ? C.mint : C.stroke; ctx.stroke(); ctx.restore();
          const d = lt > gu && !frozen ? Math.floor((lt * 14 + i * 3.7) % 10) : (frozen ? (i * 7 + 3) % 10 : '?'); txt(String(d), x + 50, 560, 70, C.white, 'Mono', 'center', a); }
        K.badge('1,000,000 possible codes', 540, 740, 'amber', { size: 38, sc: pop(lt, gu, 0.25) });
        K.badge('MAX 5 TRIES', 540, 880, 'mint', { size: 44, sc: pop(lt, lm, 0.25) });
        K.badge('ONE USE ONLY', 540, 1020, 'mint', { size: 44, sc: pop(lt, su, 0.25) });
        K.note('example: 5 tries', 540, 960, C.dim, fade(lt, lm + 0.3), 40);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ct, 'pop'); cue(st + gu, 'pop', { gain: 0.5 }); cue(st + lm, 'ping', { gain: 0.6 }); cue(st + su, 'ping', { gain: 0.6 }); }

  // 7 · handling checklist
  { const st = cut(6), li = Wd('limit', 6) - st, de = Wd('delete', 6) - st, sh = Wd('short', 6) - st;
    add({ id: 'S07', at: st, cam: [540, 800], zoom: 0.05, note: 'three mint checklist badges on "limit", "delete", "short"; note: NIST caps it at 10 min',
      draw(lt) {
        K.stage(); K.title('THREE RULES', null, 1, C.mint);
        K.badge('LIMIT ATTEMPTS', 500, 560, 'mint', { size: 44, sc: pop(lt, li, 0.25) }); K.check(920, 560, pop(lt, li + 0.2, 0.22) * 0.9, 'mint');
        K.badge('DELETE USED CODES', 500, 760, 'mint', { size: 44, sc: pop(lt, de, 0.25) }); K.check(920, 760, pop(lt, de + 0.2, 0.22) * 0.9, 'mint');
        K.badge('KEEP IT SHORT', 500, 960, 'mint', { size: 44, sc: pop(lt, sh, 0.25) }); K.check(920, 960, pop(lt, sh + 0.2, 0.22) * 0.9, 'mint');
        K.note('NIST caps it at 10 min', 540, 1070, C.dim, fade(lt, sh + 0.4), 44);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + li, 'ping', { gain: 0.5 }); cue(st + de, 'ping', { gain: 0.5 }); cue(st + sh, 'ping', { gain: 0.6 }); }

  // 8 · verdict
  { const st = cut(7), dl = Wd('deadline', 7) - st, us = Wd('use', 7) - st, ti = Wd('timer', 7) - st;
    add({ id: 'S08', at: st, cam: [540, 800], zoom: 0.05, note: 'amber STORED DEADLINE with a check on "deadline"; mint CHECKED ON USE on "use"; coral TIMER PER CODE with a cross on "timer"',
      draw(lt) {
        K.stage(); K.title('JUST A DEADLINE', null, 1, C.mint);
        K.badge('STORED DEADLINE', 490, 560, 'amber', { size: 44, sc: pop(lt, 0.4, 0.25) }); K.check(930, 560, pop(lt, dl + 0.2, 0.22) * 0.9, 'mint');
        K.badge('CHECKED ON USE', 490, 760, 'mint', { size: 44, sc: pop(lt, us, 0.25) }); K.check(930, 760, pop(lt, us + 0.2, 0.22) * 0.9, 'mint');
        K.badge('TIMER PER CODE', 490, 960, 'coral', { size: 44, sc: pop(lt, ti, 0.25) }); K.cross(930, 960, pop(lt, ti + 0.2, 0.22) * 0.9, 'coral');
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + dl, 'ping', { gain: 0.5 }); cue(st + us, 'ping', { gain: 0.5 }); cue(st + ti, 'thud', { gain: 0.5 }); }

  return { shots: S, cues: CUES };
}
