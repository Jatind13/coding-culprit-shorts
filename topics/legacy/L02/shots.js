// REST vs GraphQL: shot list (Blueprint). REST = cyan, GraphQL = violet, data = amber, problem = coral, success = mint.
import { ctx, C, W, H, clamp, lerp, seg, eo, eio, eob, rr, circle, line, txt } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';

const pop = (lt, a, d = 0.22) => eob(seg(lt, a, a + d));
const fade = (lt, a, d = 0.25) => eo(seg(lt, a, a + d));
const typeN = (lt, a, b, n) => Math.floor(clamp((lt - a) / (b - a)) * n);
const PH = 170, MID = 540, SV = 910;          // phone / middle / server x for the lane scenes
function lane(y, mid = 'api', midLabel = 'API', midAccent = 'mint', o = {}) {
  K.wire([[PH + 100, y], [MID - 100, y]], 'stroke'); K.arrowHead(MID - 108, y, 0, 'mute'); K.wire([[MID + 100, y], [SV - 100, y]], 'stroke'); K.arrowHead(SV - 108, y, 0, 'mute');
  K.node(PH, y, 'app', 'phone', 'cyan', { dim: o.dimApp ?? 0 }); K.node(MID, y, midLabel, mid, midAccent, { dim: o.dimMid ?? 0 }); K.node(SV, y, 'server', 'server', 'amber', { dim: o.dimSrv ?? 0 });
}

export function buildShots() {
  const S = [], CUES = [];
  const add = (o) => (S.push(o), o);
  const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.1);

  // 1 · hook
  { const st = cut(0), nm = Wd('name', 0) - st, ps = Wd('posts', 0) - st, rq = Wd('requests', 0) - st;
    add({ id: 'S01', at: st, cam: [540, 800], zoom: 0.05, note: 'phone needs NAME + POSTS (amber chips); "?" over the request count on "requests"',
      draw(lt) {
        K.stage(); K.title('THE APP NEEDS DATA', 'one screen, two things', pop(lt, 0.05, 0.3));
        K.card(50, 420, 980, 700, { title: 'what the screen needs', accent: 'cyan' });
        K.node(240, 770, 'app screen', 'phone', 'cyan', { s: 1.15, a: pop(lt, 0.15, 0.3) });
        K.record(640, 690, 'name', { a: pop(lt, nm, 0.22), s: 1.3 }); K.record(640, 810, 'posts', { a: pop(lt, ps, 0.22), s: 1.3 });
        K.badge('?', 900, 750, 'amber', { size: 80, sc: pop(lt, rq, 0.25) }); K.note('how many requests?', 540, 1030, C.amber, fade(lt, rq), 56);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + nm, 'pop', { gain: 0.5 }); cue(st + ps, 'pop', { gain: 0.5 }); cue(st + rq, 'ping', { gain: 0.6 }); }

  // 2 · REST: two requests
  { const st = cut(1), a = Wd('one', 1) - st, b = Wd('another', 1) - st, two = Wd('two', 1) - st;
    add({ id: 'S02', at: st, cam: [540, 800], zoom: 0.05, note: 'REST: dot makes trip 1 to /user on "one", trip 2 to /posts on "another"; TWO REQUESTS badge',
      draw(lt) {
        K.stage(); K.title('WITH REST', null, 1, C.cyan);
        K.node(PH, 707, 'app', 'phone', 'cyan', {}); K.menu(480, 480, 540, [{ m: 'GET', p: '/user' }, { m: 'GET', p: '/posts' }], { rh: 150, title: 'REST endpoints' });
        K.dot([[PH + 100, 707], [480, 632]], eio(seg(lt, a - 0.3, a + 0.5)), {}); K.dot([[PH + 100, 707], [480, 782]], eio(seg(lt, b - 0.3, b + 0.5)), { color: 'amber' });
        K.badge('TWO REQUESTS', 540, 1030, 'cyan', { size: 46, sc: pop(lt, two, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + a - 0.3, 'slide', { dur: 0.8, gain: 0.45 }); cue(st + b - 0.3, 'slide', { dur: 0.8, gain: 0.45 }); cue(st + two, 'pop'); }

  // 3 · fixed shape, extra fields
  { const st = cut(2), fx = Wd('fixed', 2) - st, nv = Wd('never', 2) - st;
    const rows = [{ k: 'name', v: '"Asha"', use: true }, { k: 'email', v: '...' }, { k: 'bio', v: '...' }, { k: 'address', v: '...' }, { k: 'phone', v: '...' }, { k: 'last_login', v: '...' }, { k: 'followers', v: '...' }];
    add({ id: 'S03', at: st, cam: [540, 800], zoom: 0.05, note: 'fixed-shape response card; the fields you did not ask for dim to dashed coral on "never"',
      draw(lt) {
        K.stage(); K.title('A FIXED SHAPE', null, 1, C.cyan);
        K.fieldsCard(70, 380, 940, rows, { title: 'GET /user → response', rowA: rows.map((_, i) => pop(lt, fx + i * 0.12, 0.25)), unused: fade(lt, nv, 0.35), rh: 86 });
        K.note('example fields', 540, 1170, C.dim, fade(lt, 0.5), 44);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); for (let k = 0; k < 7; k++) cue(st + fx + k * 0.12, 'pop', { gain: 0.3 }); cue(st + nv, 'miss'); }

  // 4 · over / under fetching
  { const st = cut(3), ov = Wd('over', 3) - st, un = Wd('under', 3) - st;
    add({ id: 'S04', at: st, cam: [540, 800], zoom: 0.05, note: 'two coral stamps: OVER-FETCHING on "over", UNDER-FETCHING on "under", each with a plain note',
      draw(lt) {
        K.stage(); K.title('TWO PROBLEMS', null, 1, C.coral);
        K.stamp('OVER-FETCHING', 540, 620, 'coral', eo(seg(lt, ov, ov + 0.16)) * (1 + 0.1 * Math.exp(-(lt - ov) * 8)), -0.06, 84); K.note('too much data comes back', 540, 740, C.dim, fade(lt, ov + 0.3), 52);
        K.stamp('UNDER-FETCHING', 540, 930, 'coral', eo(seg(lt, un, un + 0.16)) * (1 + 0.1 * Math.exp(-(lt - un) * 8)), 0.05, 84); K.note('needs a second trip', 540, 1050, C.dim, fade(lt, un + 0.3), 52);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ov, 'thud'); cue(st + un, 'thud'); }

  // 5 · GraphQL: one endpoint, you choose the shape
  { const st = cut(4), gq = Wd('graphql', 4) - st, en = Wd('endpoint', 4) - st, sh = Wd('shape', 4) - st;
    add({ id: 'S05', at: st, cam: [540, 800], zoom: 0.05, note: 'violet title on "GraphQL"; app → ONE /graphql node → server; "you choose the shape" note on "shape"',
      draw(lt) {
        K.stage(); K.title('GRAPHQL', null, pop(lt, gq - 0.1, 0.25), C.violet);
        K.card(50, 420, 980, 700, { title: 'one endpoint', accent: 'violet' }); lane(660, 'api', '/graphql', 'violet', { dimMid: 0 });
        K.dot([[PH + 100, 660], [MID - 100, 660]], eio(seg(lt, en - 0.2, en + 0.6)), { color: 'violet' }); K.focus(MID, 660, 260, 200, lt, fade(lt, en), 'violet');
        K.badge('ONE', MID, 520, 'violet', { size: 46, sc: pop(lt, en, 0.22) }); K.note('you choose the shape', 540, 960, C.violet, fade(lt, sh), 64);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + gq, 'pop'); cue(st + en, 'ping', { gain: 0.6 }); cue(st + sh, 'pop', { gain: 0.5 }); }

  // 6 · the query
  { const st = cut(5), q = Wd('query', 5) - st, nm = Wd('name', 5) - st, ti = Wd('titles', 5) - st;
    const src = ['query {', '  user {', '    name', '    posts { title }', '  }', '}'], all = src.join('\n'), tot = all.length - 5;
    add({ id: 'S06', at: st, cam: [540, 800], zoom: 0.05, note: 'terminal types the GraphQL query while the violet dot carries it; "name" and "title" chips pop on their words',
      draw(lt) {
        K.stage(); K.title('SEND A QUERY', null, 1, C.violet);
        const n = typeN(lt, q - 0.1, ti + 0.3, tot); let left = n; const lines = src.map((s, i) => { const k = Math.max(0, Math.min(s.length, left)); left -= s.length; return { t: s.slice(0, k), c: i === 2 || i === 3 ? 'amber' : 'violet' }; });
        K.terminal(70, 470, 940, 470, lines, 1e9, fade(lt, 0.05));
        K.badge('POST /graphql', 540, 1010, 'violet', { size: 40, sc: pop(lt, q, 0.25) }); K.badge('name', 300, 1105, 'amber', { size: 34, sc: pop(lt, nm, 0.2) }); K.badge('title', 780, 1105, 'amber', { size: 34, sc: pop(lt, ti, 0.2) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); for (let k = 0; k < 8; k++) cue(st + q + k * 0.18, 'click', { gain: 0.7 }); cue(st + nm, 'pop', { gain: 0.5 }); cue(st + ti, 'pop', { gain: 0.5 }); }

  // 7 · exactly those fields
  { const st = cut(6), on = Wd('one', 6) - st, ex = Wd('exactly', 6) - st;
    const rows = [{ k: 'name', v: '"Asha"', use: true }, { k: 'posts[0].title', v: '"Hello"', use: true }, { k: 'posts[1].title', v: '"Caching"', use: true }];
    add({ id: 'S07', at: st, cam: [540, 800], zoom: 0.05, note: 'amber dot returns once; response card with only the requested fields + mint check on "exactly"',
      draw(lt) {
        K.stage(); K.title('ONE RESPONSE', null, 1, C.violet);
        K.card(50, 380, 980, 330, { title: 'one trip', accent: 'violet' }); lane(560, 'api', '/graphql', 'violet', {});
        K.dot([[SV - 100, 560], [MID + 100, 560], [MID - 100, 560], [PH + 100, 560]], eio(seg(lt, on - 0.1, on + 1.0)), { color: 'amber' });
        K.fieldsCard(70, 750, 940, rows, { title: 'response', accent: 'mint', rowA: rows.map((_, i) => pop(lt, on + 0.7 + i * 0.25, 0.25)), rh: 84 });
        K.check(930, 810, pop(lt, ex, 0.25) * 0.9, 'mint');
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + on - 0.1, 'slide', { dur: 1.1, gain: 0.45 }); cue(st + ex, 'ping'); }

  // 8 · the catch: caching
  { const st = cut(7), ct = Wd('catch', 7) - st, en = Wd('endpoint', 7) - st, ca = Wd('caching', 7) - st;
    add({ id: 'S08', at: st, cam: [540, 800], zoom: 0.05, note: 'coral title; REST: URL = cache key, HIT; GraphQL: three queries share ONE URL, cache node gets a coral X on "caching"',
      draw(lt) {
        K.stage(); K.title('BUT THERE IS A CATCH', null, 1, C.coral);
        K.card(50, 380, 980, 330, { title: 'REST: the URL is the cache key', accent: 'cyan', a: fade(lt, ct) });
        K.record(220, 560, '/user', { color: 'cyan', a: fade(lt, ct + 0.2) }); K.record(220, 640, '/posts', { color: 'cyan', a: fade(lt, ct + 0.4) });
        K.wire([[340, 600], [490, 600]], 'stroke', { a: fade(lt, ct + 0.4) }); K.node(620, 600, 'cache', 'cache', 'violet', { s: 0.8, a: fade(lt, ct + 0.4) }); K.badge('HIT', 880, 600, 'mint', { size: 46, sc: pop(lt, ct + 0.8, 0.25) });
        const g = fade(lt, en - 0.2);
        K.card(50, 740, 980, 400, { title: 'GraphQL: one URL for everything', accent: 'violet', a: g });
        [0, 1, 2].forEach((i) => K.record(220, 860 + i * 80, '/graphql', { color: 'violet', a: g * pop(lt, en + i * 0.15, 0.2) }));
        K.wire([[340, 940], [490, 940]], 'stroke', { a: g }); K.node(620, 940, 'cache', 'cache', 'violet', { s: 0.8, dim: lt > ca ? 0.5 : 0, a: g }); K.cross(620, 905, pop(lt, ca, 0.25) * 0.55, 'coral');
        K.badge('?', 880, 940, 'coral', { size: 80, sc: pop(lt, ca + 0.15, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ct, 'pop'); cue(st + ct + 0.8, 'ping', { gain: 0.5 }); cue(st + en, 'pop', { gain: 0.5 }); cue(st + ca, 'miss'); }

  // 9 · nested queries cost more
  { const st = cut(8), ne = Wd('nested', 8) - st, fa = Wd('far', 8) - st, wk = Wd('work', 8) - st;
    add({ id: 'S09', at: st, cam: [540, 800], zoom: 0.05, note: 'a query tree fans out level by level (1, 3, 9); server-work meter climbs to HIGH on "work"',
      draw(lt, d) {
        K.stage(); K.title('NESTED = EXPENSIVE', null, 1, C.coral);
        K.tree(540, 470, pop(lt, ne, 0.35), pop(lt, fa, 0.4)); K.note('user, posts, comments', 540, 930, C.dim, fade(lt, ne), 50);
        K.meter(100, 1080, 880, 0.08 + 0.92 * eio(seg(lt, wk - 0.3, wk + 1.4)), 'coral', 'server work', lt > wk + 0.8 ? 'HIGH' : '');
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ne, 'pop'); cue(st + fa, 'pop'); cue(st + wk + 0.8, 'miss'); }

  // 10 · the trade-off
  { const st = cut(9), re = Wd('rest', 9) - st, si = Wd('simple', 9) - st, ca = Wd('cache', 9) - st, gq = Wd('graphql', 9) - st, fl = Wd('flexible', 9) - st, cr = Wd('care', 9) - st;
    const pill = (x, y, w, label, ok, a) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; rr(x, y, w, 96, 22); ctx.fillStyle = C.bgDeep; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = ok ? C.mint : C.coral; ctx.stroke(); txt(label, x + 30, y + 50, 38, C.white, 'Mono', 'left'); ctx.restore(); (ok ? K.check : K.cross)(x + w - 52, y + 48, 0.5 * a, ok ? 'mint' : 'coral'); };
    add({ id: 'S10', at: st, cam: [540, 800], zoom: 0.05, note: 'two columns: REST (simple ✓, cacheable ✓) and GraphQL (flexible ✓, needs care ✗); each row on its word',
      draw(lt) {
        K.stage(); K.title('THE TRADE-OFF', null, 1);
        K.card(40, 400, 480, 600, { title: 'REST', accent: 'cyan', a: fade(lt, re) }); K.card(560, 400, 480, 600, { title: 'GraphQL', accent: 'violet', a: fade(lt, gq) });
        pill(64, 500, 432, 'simple', true, pop(lt, si, 0.25)); pill(64, 630, 432, 'cacheable', true, pop(lt, ca, 0.25)); pill(64, 760, 432, 'fixed shape', false, pop(lt, ca + 0.4, 0.25));
        pill(584, 500, 432, 'flexible', true, pop(lt, fl, 0.25)); pill(584, 630, 432, 'one trip', true, pop(lt, fl + 0.5, 0.25)); pill(584, 760, 432, 'needs care', false, pop(lt, cr, 0.25));
      } });
    cue(st, 'whoosh', { gain: 0.5 }); [re, si, ca, ca + 0.4].forEach((t) => cue(st + t, 'pop', { gain: 0.4 })); [gq, fl, fl + 0.5].forEach((t) => cue(st + t, 'pop', { gain: 0.4 })); cue(st + cr, 'tock'); }

  // 11 · verdict
  { const st = cut(10), fx = Wd('fixed', 10) - st, rs = Wd('rest', 10) - st, ma = Wd('many', 10) - st, gq = Wd('graphql', 10) - st;
    add({ id: 'S11', at: st, cam: [540, 800], zoom: 0.05, note: 'fixed needs → REST menu (cyan); many different clients each ask their own shape → GraphQL (violet); focus box on each verdict word',
      draw(lt) {
        K.stage(); K.title('PICK BY WHO IS ASKING', null, 1);
        K.menu(90, 400, 900, [{ m: 'GET', p: '/user' }, { m: 'GET', p: '/posts' }], { rh: 100, title: 'fixed needs: REST', a: fade(lt, 0.15), stroke: lt > rs ? C.cyan : undefined });
        K.focus(540, 548, 940, 340, lt, fade(lt, rs) * (lt < ma - 0.1 ? 1 : 0), 'cyan');
        const b = fade(lt, ma); K.card(90, 770, 900, 390, { title: 'many needs: GraphQL', accent: 'violet', a: b });
        ['phone', 'browser', 'phone'].forEach((k, i) => K.node(260 + i * 280, 930, ['app', 'web', 'watch'][i], k, 'violet', { s: 0.75, a: b * pop(lt, ma + i * 0.15, 0.2) }));
        ['{ name }', '{ feed }', '{ cart }'].forEach((t, i) => K.record(260 + i * 280, 1075, t, { color: 'violet', s: 0.95, a: b * pop(lt, gq + i * 0.15, 0.2) }));
        K.focus(540, 965, 920, 380, lt, fade(lt, gq) , 'violet');
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + fx, 'pop'); cue(st + rs, 'ping', { gain: 0.5 }); cue(st + ma, 'pop'); cue(st + gq, 'ping', { gain: 0.6 }); }

  return { shots: S, cues: CUES };
}
