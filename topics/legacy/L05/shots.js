// Bloom filter: shot list (Blueprint). bits = mint, other names = violet, db = amber, problem = coral.
import { ctx, C, W, H, clamp, lerp, seg, eo, eio, eob, rr, circle, line, txt } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';

const pop = (lt, a, d = 0.22) => eob(seg(lt, a, a + d));
const fade = (lt, a, d = 0.25) => eo(seg(lt, a, a + d));

// the 16-bit row (example): one row so hash wires never cross cells
const CELL = 52, GAP = 8, GX0 = 64, GY = 800;
const cx = (i) => GX0 + i * (CELL + GAP) + CELL / 2;
const MAYA = [2, 8, 13], LEO = [5, 8, 14], ZED = [2, 5, 14], SAM = [1, 6, 11];
function grid(a, f) {
  ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < 16; i++) {
    const s = f(i) || {}, on = s.on || 0, x = cx(i) - CELL / 2;
    ctx.save(); ctx.globalAlpha *= (s.a ?? 1);
    rr(x, GY - 45, CELL, 90, 12); ctx.fillStyle = C.card; ctx.fill();
    if (on > 0) { ctx.save(); ctx.globalAlpha *= on; rr(x, GY - 45, CELL, 90, 12); ctx.fillStyle = s.col || C.mint; ctx.fill(); ctx.restore(); }
    rr(x, GY - 45, CELL, 90, 12); ctx.lineWidth = s.edge ? 6 : 3; ctx.strokeStyle = s.edge || (on > 0.5 ? (s.col || C.mint) : C.stroke); ctx.stroke();
    txt(on > 0.5 ? '1' : '0', cx(i), GY + 2, 32, on > 0.5 ? C.ink : C.dim, 'Mono');
    ctx.restore();
  }
  ctx.restore();
}
const onAt = (lt, ids, t0, step, col = C.mint) => (i) => { const k = ids.indexOf(i); return k < 0 ? null : { on: fade(lt, t0 + k * step, 0.15), col }; };
const wires = (a, from, ids, color, dash) => ids.forEach((i) => K.wire([from, [cx(i), GY - 52]], color, { a, dash }));

export function buildShots() {
  const S = [], CUES = [];
  const add = (o) => (S.push(o), o);
  const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.1);

  // 1 · hook: a billion checks, each a trip to the database
  { const st = cut(0), us = Wd('username', 0) - st, bi = Wd('billion', 0) - st, db = Wd('database', 0) - st;
    add({ id: 'S01', at: st, cam: [540, 800], zoom: 0.05, note: 'user chip on "username", a coral counter counts to a billion on "billion", dots stream into the database on "database"',
      draw(lt) {
        K.stage(); K.title('IS THIS NAME TAKEN?', null, pop(lt, 0.05, 0.3));
        K.node(190, 760, 'user', 'user', 'cyan', { s: 1.1, a: pop(lt, 0.15, 0.3) });
        K.record(190, 600, 'maya_99', { color: 'mint', a: pop(lt, us - 0.05, 0.22), s: 1.15 });
        const a = fade(lt, 0.6); K.node(880, 760, 'database', 'db', 'amber', { s: 1.1, a: pop(lt, 0.6, 0.3), busy: lt > db ? lt : 0 });
        K.wire([[300, 760], [770, 760]], 'stroke', { a, dash: [12, 10] }); if (lt > us + 0.3) for (let k = 0; k < 5; k++) K.dot([[300, 760], [770, 760]], ((lt - us) * 0.5 + k / 5) % 1, {});
        K.badge(`${Math.floor(clamp((lt - bi) / 1.3) * 1e9).toLocaleString('en-US')} checks`, 540, 480, 'coral', { size: 44, sc: pop(lt, bi - 0.05, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + us, 'pop', { gain: 0.45 }); cue(st + bi, 'ping', { gain: 0.5 }); cue(st + db, 'pop'); }

  // 2 · a row of bits, all zero
  { const st = cut(1), ro = Wd('row', 1) - st, bt = Wd('bits', 1) - st, ze = Wd('zero', 1) - st;
    add({ id: 'S02', at: st, cam: [540, 800], zoom: 0.05, note: 'the row of 16 empty cells pops in left to right on "row", focus box on "zero"; note says 16 bits here',
      draw(lt) {
        K.stage(); K.title('A ROW OF BITS', null, 1, C.violet);
        for (let i = 0; i < 16; i++) { const a = pop(lt, ro + i * 0.05, 0.2); grid(a, (k) => (k === i ? {} : { a: 0 })); }
        K.focus(540, GY, 960, 140, lt, fade(lt, ze), C.white);
        K.note('16 bits here, billions in real life', 540, 1000, C.dim, fade(lt, bt + 0.4), 44);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); for (let k = 0; k < 6; k++) cue(st + ro + k * 0.16, 'click', { gain: 0.3 }); cue(st + ze, 'pop'); }

  // 3 · add a name: hash a few times, flip bits to one
  { const st = cut(2), ha = Wd('hash', 2) - st, fl = Wd('flip', 2) - st, on1 = Wd('one', 2) - st;
    add({ id: 'S03', at: st, cam: [540, 800], zoom: 0.05, note: 'name chip "maya" and a "hash x3" badge on "hash", three wires reach cells 2, 8, 13, which flip to mint ones on "flip"',
      draw(lt) {
        K.stage(); K.title('ADD A NAME', null, 1, C.mint);
        K.record(540, 460, 'maya', { color: 'mint', a: fade(lt, 0.05), s: 1.4 }); K.badge('hash x3', 540, 585, 'violet', { size: 40, sc: pop(lt, ha, 0.25) });
        wires(fade(lt, ha + 0.1, 0.3), [540, 640], MAYA, 'violet');
        grid(1, onAt(lt, MAYA, fl, 0.18));
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ha, 'pop'); MAYA.forEach((_, k) => cue(st + fl + k * 0.18, 'click', { gain: 0.5 })); cue(st + on1, 'ping', { gain: 0.5 }); }

  // 4 · check a name: same hashes, look at those bits
  { const st = cut(3), ch = Wd('check', 3) - st, sm = Wd('same', 3) - st, lk = Wd('look', 3) - st;
    add({ id: 'S04', at: st, cam: [540, 800], zoom: 0.05, note: 'chip "sam" with the same hash badge, wires land on cells 1, 6, 11; focus boxes light them on "look"; maya bits stay mint',
      draw(lt) {
        K.stage(); K.title('CHECK A NAME', null, 1, C.cyan);
        K.record(540, 460, 'sam', { color: 'cyan', a: fade(lt, ch - 0.1), s: 1.4 }); K.badge('hash x3', 540, 585, 'violet', { size: 40, sc: pop(lt, sm - 0.1, 0.25) });
        wires(fade(lt, sm + 0.1, 0.3), [540, 640], SAM, 'cyan');
        grid(1, onAt(lt, MAYA, -9, 0));
        SAM.forEach((i, k) => K.focus(cx(i), GY, 74, 120, lt, fade(lt, lk + k * 0.15), C.white));
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ch, 'pop'); cue(st + sm, 'pop', { gain: 0.5 }); SAM.forEach((_, k) => cue(st + lk + k * 0.15, 'tock', { gain: 0.5 })); }

  // 5 · a zero means definitely free; database never hears
  { const st = cut(4), ze = Wd('zero', 4) - st, fr = Wd('free', 4) - st, db = Wd('database', 4) - st;
    add({ id: 'S05', at: st, cam: [540, 800], zoom: 0.05, note: 'cell 1 is a zero: mint focus on "zero"; mint DEFINITELY FREE badge on "free"; the database node stays dim and the wire to it gets a cross on "database"',
      draw(lt) {
        K.stage(); K.title('A ZERO MEANS FREE', null, 1, C.mint);
        K.record(540, 460, 'sam', { color: 'cyan', s: 1.4, a: 0.9 }); wires(0.35, [540, 510], SAM, 'cyan');
        grid(1, (i) => (MAYA.includes(i) ? { on: 1, a: 0.4 } : i === 1 ? { a: 1 } : { a: 0.5 }));
        K.focus(cx(1), GY, 74, 120, lt, fade(lt, ze), C.mint);
        K.badge('DEFINITELY FREE', 540, 930, 'mint', { size: 40, sc: pop(lt, fr, 0.25) });
        const da = fade(lt, db - 0.2, 0.3); K.node(260, 1090, 'database', 'db', 'amber', { a: da, dim: 0.6, s: 0.85 }); K.cross(470, 1090, pop(lt, db + 0.2, 0.22) * 0.9, 'coral');
        K.note('never asked', 760, 1090, C.dim, fade(lt, db + 0.3), 44);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ze, 'tock'); cue(st + fr, 'ping', { gain: 0.6 }); cue(st + db + 0.2, 'miss', { gain: 0.4 }); }

  // 6 · all ones: probably taken, ask the database
  { const st = cut(5), on = Wd('ones', 5) - st, pr = Wd('probably', 5) - st, db = Wd('database', 5) - st;
    add({ id: 'S06', at: st, cam: [540, 800], zoom: 0.05, note: 'chip "maya", all three cells are ones: focus on "ones"; amber PROBABLY TAKEN on "probably"; a dot runs to the database on "database"',
      draw(lt) {
        K.stage(); K.title('ALL ONES: ASK', null, 1, C.amber);
        K.record(540, 460, 'maya', { color: 'mint', s: 1.4 }); wires(0.8, [540, 510], MAYA, 'mint');
        grid(1, onAt(lt, MAYA, -9, 0));
        MAYA.forEach((i, k) => K.focus(cx(i), GY, 74, 120, lt, fade(lt, on + k * 0.12), C.white));
        K.badge('PROBABLY TAKEN', 540, 610, 'amber', { size: 40, sc: pop(lt, pr, 0.25) });
        const da = fade(lt, db - 0.1, 0.3); K.node(540, 1070, 'database', 'db', 'amber', { a: da }); K.wire([[540, 860], [540, 985]], 'amber', { a: da });
        if (lt > db) K.dot([[540, 860], [540, 985]], ((lt - db) * 0.9) % 1, {});
      } });
    cue(st, 'whoosh', { gain: 0.5 }); MAYA.forEach((_, k) => cue(st + on + k * 0.12, 'tock', { gain: 0.45 })); cue(st + pr, 'ping', { gain: 0.5 }); cue(st + db, 'pop'); }

  // 7 · the catch: false positives, no false negatives, no deletes
  { const st = cut(6), ct = Wd('catch', 6) - st, po = Wd('positives', 6) - st, ne = Wd('negatives', 6) - st, de = Wd('delete', 6) - st;
    add({ id: 'S07', at: st, cam: [540, 800], zoom: 0.05, note: 'coral title; leo violet bits join maya (bit 8 shared); "zed" was never added but hashes onto ones: FALSE POSITIVE stamp on "positives"; mint NO FALSE NEGATIVES on "negatives"; coral NO DELETES + cross on the shared bit on "delete"',
      draw(lt) {
        K.stage(); K.title('BUT THERE IS A CATCH', null, 1, C.coral);
        K.record(540, 440, 'zed', { color: 'cyan', s: 1.4, a: fade(lt, ct + 0.6) }); K.note('never added', 780, 440, C.dim, fade(lt, ct + 0.9), 40);
        wires(fade(lt, po - 0.3, 0.3) * 0.9, [540, 490], ZED, 'coral', [12, 10]);
        grid(1, (i) => { const m = MAYA.includes(i), l = LEO.includes(i); if (!m && !l) return null;
          const lo = fade(lt, ct, 0.3); if (m && l) return { on: 1, col: C.mint, edge: lo > 0.5 ? C.violet : null }; if (m) return { on: 1, col: C.mint }; return { on: lo, col: C.violet }; });
        K.record(300, 905, 'maya', { color: 'mint', a: fade(lt, ct) }); K.record(780, 905, 'leo', { color: 'violet', a: fade(lt, ct) });
        K.stamp('FALSE POSITIVE', 540, 1020, 'coral', pop(lt, po, 0.25), -0.04, 60);
        K.badge('NO FALSE NEGATIVES', 540, 1125, 'mint', { size: 32, sc: pop(lt, ne, 0.25) });
        K.badge('NO DELETES', 540, 1190, 'coral', { size: 30, sc: pop(lt, de, 0.25) }); K.cross(cx(8), 690, pop(lt, de, 0.22) * 0.8, 'coral');
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ct, 'pop'); cue(st + po, 'miss', { gain: 0.6 }); cue(st + ne, 'ping', { gain: 0.5 }); cue(st + de, 'thud', { gain: 0.5 }); }

  // 8 · size: ten bits per name, about 1% false positives, 1.2 GB
  { const st = cut(7), te = Wd('ten', 7) - st, pc = Wd('percent', 7) - st, bi = Wd('billion', 7) - st, gb = Wd('gigabytes', 7) - st;
    add({ id: 'S08', at: st, cam: [540, 800], zoom: 0.05, note: 'one name -> ~10 bits on "ten"; ~1% false positives on "percent"; 1,000,000,000 names then ~1.2 GB on "billion"/"gigabytes"; note labels the arithmetic',
      draw(lt) {
        K.stage(); K.title('PICK THE SIZE', null, 1, C.violet);
        const a1 = fade(lt, te - 0.3); K.record(230, 480, 'one name', { color: 'cyan', a: a1, s: 1.2 }); K.wire([[360, 480], [580, 480]], 'stroke', { a: a1 }); K.badge('~10 bits', 790, 480, 'mint', { size: 50, sc: pop(lt, te, 0.25) });
        K.badge('~1% false positives', 540, 680, 'amber', { size: 44, sc: pop(lt, pc, 0.25) });
        txt('1,000,000,000 names', 540, 850, 56, C.white, 'Inter', 'center', fade(lt, bi - 0.1));
        K.badge('~1.2 GB', 540, 990, 'mint', { size: 84, sc: pop(lt, gb, 0.28) });
        K.note('example: 9.6 bits x 1B', 540, 1130, C.dim, fade(lt, gb + 0.3), 40);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + te, 'pop'); cue(st + pc, 'pop'); cue(st + bi, 'pop', { gain: 0.4 }); cue(st + gb, 'ping'); }

  // 9 · verdict: cheap gatekeeper, never the source of truth
  { const st = cut(8), ga = Wd('gatekeeper', 8) - st, db = Wd('database', 8) - st, tr = Wd('truth', 8) - st;
    add({ id: 'S09', at: st, cam: [540, 800], zoom: 0.05, note: 'user -> filter -> database; violet GATEKEEPER badge on "gatekeeper"; amber SOURCE OF TRUTH tag on the database on "truth"; dot travels through',
      draw(lt) {
        K.stage(); K.title('GATEKEEPER, NOT TRUTH', null, 1, C.mint);
        K.node(170, 720, 'user', 'user', 'cyan', { a: fade(lt, 0.1) }); K.node(540, 720, 'filter', 'cache', 'violet', { a: pop(lt, 0.5, 0.3), dim: lt > tr - 0.2 ? 0.55 : 0 }); K.node(910, 720, 'database', 'db', 'amber', { a: pop(lt, 0.9, 0.3) });
        const a1 = fade(lt, 0.6), a2 = fade(lt, 1.0); K.wire([[280, 720], [430, 720]], 'cyan', { a: a1 }); K.wire([[650, 720], [800, 720]], 'violet', { a: a2 });
        if (lt > 0.8) K.dot([[280, 720], [430, 720]], ((lt - 0.8) * 0.8) % 1, {}); if (lt > 1.2) K.dot([[650, 720], [800, 720]], ((lt - 1.2) * 0.8) % 1, {});
        K.badge('GATEKEEPER', 540, 540, 'violet', { size: 40, sc: pop(lt, ga, 0.25) });
        K.badge('SOURCE OF TRUTH', 800, 930, 'amber', { size: 34, sc: pop(lt, tr, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ga, 'ping', { gain: 0.6 }); cue(st + db, 'pop'); cue(st + tr, 'ping', { gain: 0.6 }); }

  return { shots: S, cues: CUES };
}
