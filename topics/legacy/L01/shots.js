// WHAT IS AN API?: the shot list (the only file that changes per video, with script.json). Blueprint style.
// A shot: { id, at, cam: [cx, cy], zoom, note, draw(lt, d, t) } · lt = time in shot, d = shot length, t = film time.
import { ctx, C, W, H, clamp, lerp, seg, eo, eio, eob, rr, circle, line, txt } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';

const PX = 190, AX = 540, SX = 890;                              // phone, API, server x
const pop = (lt, a, d = 0.22) => eob(seg(lt, a, a + d));
const fade = (lt, a, d = 0.25) => eo(seg(lt, a, a + d));
const typeN = (lt, a, b, n) => Math.floor(clamp((lt - a) / (b - a)) * n);

/** phone -> API -> server diagram. o = { y, ch (card height), cardTitle, box (server hidden), dimApp, dimApi, dimSrv } */
function scene(t, o = {}) {
  const y = o.y ?? 790;
  K.stage(); K.card(50, 410, 980, o.ch ?? 740, { title: o.cardTitle || 'request path', accent: 'cyan' });
  K.wire([[PX + 100, y], [AX - 100, y]], 'stroke'); K.arrowHead(AX - 108, y, 0, 'mute');
  K.wire([[AX + 100, y], [SX - 100, y]], 'stroke'); K.arrowHead(SX - 108, y, 0, 'mute');
  K.node(PX, y, 'app', 'phone', 'cyan', { dim: o.dimApp ?? 0 });
  K.node(AX, y, 'API', 'api', 'mint', { dim: o.dimApi ?? 0 });
  if (o.box) K.blackbox(SX, y, { a: 1 - (o.dimSrv ?? 0) * 0.5 }); else K.node(SX, y, 'server', 'server', 'amber', { dim: o.dimSrv ?? 0 });
}
const row = (y) => [[PX, y], [AX, y], [SX, y]];

export function buildShots() {
  const S = [], CUES = [];
  const add = (o) => (S.push(o), o);
  const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.1);

  // ── 1 · HOOK: a weather app with no weather station ───────────────────
  {
    const st = cut(0), stn = Wd('station', 0) - st, know = Wd('know', 0) - st, rain = Wd('raining', 0) - st;
    add({ id: 'S01', at: st, cam: [540, 800], zoom: 0.05, note: 'phone app next to a weather station; coral X on the station at "station", "?" at "know", RAIN at "raining"',
      draw(lt, d, t) {
        K.stage(); K.title('THE WEATHER APP', 'no station of its own', pop(lt, 0.05, 0.3)); K.card(20, 410, 1040, 740, { title: 'where does the rain come from?', accent: 'cyan' });
        K.wire([[400, 800], [680, 800]], 'mute', { dash: [14, 14], a: 0.8 });
        K.node(300, 800, 'weather app', 'phone', 'cyan', { s: 1.15 }); K.node(780, 800, 'weather station', 'station', 'amber', { s: 1.15, dim: lt > stn ? 0.55 : 0, a: pop(lt, 0.2, 0.3) });
        K.cross(840, 700, pop(lt, stn, 0.25) * 1.3, 'coral'); K.badge('?', 300, 640, 'amber', { size: 54, sc: pop(lt, know, 0.25) });
        K.badge('RAINING', 300, 960, 'cyan', { size: 40, sc: pop(lt, rain, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + 0.25, 'pop', { gain: 0.5 }); cue(st + stn, 'miss'); cue(st + know, 'pop'); cue(st + rain, 'ping', { gain: 0.6 });
  }

  // ── 2 · it asks another program, through an API ───────────────────────
  {
    const st = cut(1), asks = Wd('asks', 1) - st, api = Wd('API', 1) - st;
    add({ id: 'S02', at: st, cam: [540, 800], zoom: 0.05, note: 'mint request dot goes app → API → server; API badge + focus box on "API"',
      draw(lt, d, t) {
        scene(t, { cardTitle: 'the request path' }); K.title('ASK ANOTHER PROGRAM', null, 1);
        K.dot(row(790), eio(seg(lt, asks, api + 0.9)), {});
        K.focus(AX, 790, 250, 190, t, fade(lt, api - 0.1)); K.badge('API', AX, 655, 'mint', { sc: pop(lt, api, 0.2) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + asks, 'slide', { dur: api - asks + 0.9, gain: 0.5 }); cue(st + api, 'pop');
  }

  // ── 3 · application programming interface ─────────────────────────────
  {
    const st = cut(2), a = Wd('application', 2) - st, p = Wd('programming', 2) - st, i = Wd('interface', 2) - st;
    add({ id: 'S03', at: st, cam: [540, 800], zoom: 0.05, note: 'three stacked pills: A / P / I light up mint, each on its word',
      draw(lt, d, t) {
        K.stage(); K.title('API STANDS FOR', null, 1);
        K.acronym(540, 560, [{ letter: 'A', word: 'Application', a: pop(lt, a - 0.05, 0.25) }, { letter: 'P', word: 'Programming', a: pop(lt, p - 0.05, 0.25) }, { letter: 'I', word: 'Interface', a: pop(lt, i - 0.05, 0.25) }]);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + a, 'pop', { gain: 0.6 }); cue(st + p, 'pop', { gain: 0.6 }); cue(st + i, 'pop');
  }

  // ── 4 · a menu of requests ────────────────────────────────────────────
  {
    const st = cut(3), menu = Wd('menu', 3) - st, req = Wd('requests', 3) - st;
    add({ id: 'S04', at: st, cam: [540, 800], zoom: 0.05, note: 'a menu card with three endpoints; dashed focus box on the menu at "menu"',
      draw(lt, d, t) {
        K.stage(); K.title('THE API IS A MENU', null, 1);
        K.menu(90, 440, 900, [{ m: 'GET', p: '/weather' }, { m: 'GET', p: '/forecast' }, { m: 'GET', p: '/cities' }], { rh: 150, rowA: [pop(lt, menu, 0.3), pop(lt, menu + 0.2, 0.3), pop(lt, menu + 0.4, 0.3)] });
        K.focus(540, 665, 940, 560, t, fade(lt, menu)); K.note('only these requests allowed', 540, 1110, C.violet, fade(lt, req - 0.2), 54);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); for (let k = 0; k < 3; k++) cue(st + menu + k * 0.2, 'pop', { gain: 0.45 }); cue(st + req, 'pop', { gain: 0.5 });
  }

  // ── 5 · the app sends a request ───────────────────────────────────────
  {
    const st = cut(4), rq = Wd('request', 4) - st, get = Wd('get', 4) - st, del = Wd('Delhi', 4) - st;
    const cmd = '$ GET /weather?city=Delhi';
    add({ id: 'S05', at: st, cam: [540, 800], zoom: 0.05, note: 'terminal types GET /weather?city=Delhi while the dot travels to the server; REQUEST badge on "request"',
      draw(lt, d, t) {
        scene(t, { y: 600, ch: 760, cardTitle: 'a request' }); K.title('SEND A REQUEST', null, 1);
        K.dot(row(600), eio(seg(lt, rq, del + 0.6)), {}); K.badge('REQUEST', PX, 470, 'cyan', { size: 34, sc: pop(lt, rq, 0.2) });
        K.terminal(70, 790, 940, 330, [{ t: cmd.slice(0, typeN(lt, get, del + 0.1, cmd.length)), c: 'mint' }], 1e9, fade(lt, 0.1));
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + rq, 'slide', { dur: del - rq + 0.6, gain: 0.5 }); for (let k = 0; k < 6; k++) cue(st + get + k * 0.12, 'click');
  }

  // ── 6 · the server answers with JSON ──────────────────────────────────
  {
    const st = cut(5), ans = Wd('answer', 5) - st, json = Wd('JSON', 5) - st;
    const lines = [{ t: '$ GET /weather?city=Delhi', c: 'mint' }, { t: '{ "city": "Delhi",', c: 'white' }, { t: '  "temp": 31, "rain": true }', c: 'amber' }];
    add({ id: 'S06', at: st, cam: [540, 800], zoom: 0.05, note: 'amber dot returns; JSON appears in the terminal with 200 OK on "JSON"; the phone shows rain',
      draw(lt, d, t) {
        scene(t, { y: 600, ch: 760, cardTitle: 'the response' }); K.title('THE ANSWER COMES BACK', null, 1);
        const back = [[SX, 600], [AX, 600], [PX, 600]]; K.dot(back, eio(seg(lt, ans - 0.1, json + 0.5)), { color: 'amber' });
        const n = lt > ans ? 10 + typeN(lt, ans, json + 0.7, lines[1].t.length + lines[2].t.length) : 0; const shown = lt > ans ? [lines[0], { t: lines[1].t.slice(0, Math.max(0, n)), c: 'white' }, { t: lines[2].t.slice(0, Math.max(0, n - lines[1].t.length)), c: 'amber' }] : [lines[0]];
        K.terminal(70, 790, 940, 330, shown, 1e9, 1);
        K.badge('200 OK', 790, 1030, 'mint', { size: 40, sc: pop(lt, json + 0.1, 0.25) }); K.badge('RAIN', PX, 470, 'cyan', { size: 40, sc: pop(lt, json + 0.5, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ans, 'slide', { dur: json - ans + 0.5, gain: 0.5 }); for (let k = 0; k < 8; k++) cue(st + ans + k * 0.14, 'click', { gain: 0.8 }); cue(st + json + 0.1, 'ping'); 
  }

  // ── 7 · the app never sees inside, it trusts the menu ─────────────────
  {
    const st = cut(6), ins = Wd('inside', 6) - st, tr = Wd('trusts', 6) - st;
    add({ id: 'S07', at: st, cam: [540, 800], zoom: 0.05, note: 'server turns into a dashed hidden box on "inside"; mint check on the API on "trusts"',
      draw(lt, d, t) {
        scene(t, { cardTitle: 'what the app can see', box: lt > ins - 0.2, dimSrv: lt > ins ? 0.6 : 0 }); K.title('IT NEVER SEES INSIDE', null, 1);
        K.check(AX + 80, 700, pop(lt, tr, 0.25) * 1.2, 'mint'); K.note('trusts the menu', AX, 960, C.mint, fade(lt, tr - 0.1), 56);
        K.note('how it works', SX, 960, C.dim, fade(lt, ins), 48);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ins, 'tock'); cue(st + tr, 'ping', { gain: 0.7 });
  }

  // ── 8 · the catch: something not on the menu ──────────────────────────
  {
    const st = cut(7), ct = Wd('catch', 7) - st, mn = Wd('menu', 7) - st;
    const cmd = '$ GET /horoscope';
    add({ id: 'S08', at: st, cam: [540, 800], zoom: 0.05, note: 'coral title; the app types GET /horoscope; a ghost row is not on the menu and gets a coral X on "menu"',
      draw(lt, d, t) {
        K.stage(); K.title('BUT THERE IS A CATCH', null, 1, C.coral);
        K.menu(90, 430, 900, [{ m: 'GET', p: '/weather' }, { m: 'GET', p: '/forecast' }, { m: 'GET', p: '/cities' }], { rh: 100, title: 'the menu (API)' });
        K.menu(90, 780, 900, [{ m: 'GET', p: '/horoscope', ghost: true }], { rh: 110, title: 'what the app asks for', a: fade(lt, ct) });
        K.cross(930, 840, pop(lt, mn, 0.25) * 1.2, 'coral'); K.note('not on the menu', 540, 1120, C.coral, fade(lt, mn), 56);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ct, 'pop'); cue(st + mn, 'miss');
  }

  // ── 9 · 404 Not Found ─────────────────────────────────────────────────
  {
    const st = cut(8), err = Wd('error', 8) - st, four = Wd('four', 8) - st, nf = Wd('found', 8) - st;
    const lines = [{ t: '$ GET /horoscope', c: 'mint' }, { t: 'HTTP 404 Not Found', c: 'coral' }];
    add({ id: 'S09', at: st, cam: [540, 800], zoom: 0.07, note: 'terminal answers 404 Not Found; a big coral 404 stamp slams on "four"',
      draw(lt, d, t) {
        K.stage(); K.title('ERROR: NOT FOUND', null, 1, C.coral);
        K.terminal(50, 480, 980, 250, lt > four - 0.05 ? lines : [lines[0]], 1e9, 1);
        K.stamp('404', 540, 930, 'coral', eo(seg(lt, four, four + 0.16)) * (1 + 0.12 * Math.exp(-(lt - four) * 8)), -0.1, 190);
        K.badge('NOT FOUND', 540, 1110, 'coral', { size: 40, sc: pop(lt, nf, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + err, 'pop', { gain: 0.5 }); cue(st + four, 'thud'); cue(st + nf, 'miss');
  }

  // ── 10 · 429 Too Many Requests ────────────────────────────────────────
  {
    const st = cut(9), often = Wd('often', 9) - st, four = Wd('four', 9) - st, rqs = Wd('requests', 9) - st;
    add({ id: 'S10', at: st, cam: [540, 800], zoom: 0.05, note: 'a flood of request dots hits the API; coral 429 stamp on "four"; TOO MANY REQUESTS on "requests"',
      draw(lt, d, t) {
        scene(t, { y: 640, ch: 760, cardTitle: 'too many requests', dimSrv: 0.5 }); K.title('ASK TOO OFTEN', null, 1, C.coral);
        for (let i = 0; i < 14; i++) { const u = (lt * 1.1 + i / 14) % 1; if (lt < often - 0.2) continue; const [x, y] = K.polyAt([[PX + 100, 640 + ((i % 5) - 2) * 26], [AX - 100, 640]], u); circle(x, y, 13, i % 3 ? C.cyan : C.mint); }
        K.stamp('429', 540, 900, 'coral', eo(seg(lt, four, four + 0.16)) * (1 + 0.12 * Math.exp(-(lt - four) * 8)), -0.1, 170);
        K.badge('TOO MANY REQUESTS', 540, 1060, 'coral', { size: 36, sc: pop(lt, rqs, 0.25) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + often, 'slide', { dur: 1.4, gain: 0.4 }); cue(st + four, 'thud'); cue(st + rqs, 'miss');
  }

  // ── 11 · the promise, and the open loop ───────────────────────────────
  {
    const st = cut(10), pr = Wd('promise', 10) - st, th = Wd('that', 10) - st;
    const lines = [{ t: '$ GET /weather?city=Delhi', c: 'mint' }, { t: '{ "city": "Delhi",', c: 'white' }, { t: '  "temp": 31, "rain": true }', c: 'amber' }];
    add({ id: 'S11', at: st, cam: [540, 800], zoom: 0.05, note: 'menu above, request/response below, mint check on "promise"; NEXT badge teases the next video',
      draw(lt, d, t) {
        K.stage(); K.title('AN API IS A PROMISE', null, 1);
        K.menu(90, 420, 900, [{ m: 'GET', p: '/weather' }, { m: 'GET', p: '/forecast' }], { rh: 100, hl: 0, title: 'ask this way' });
        K.terminal(70, 760, 940, 300, lines, 1e9, 1); K.check(940, 810, pop(lt, pr, 0.25) * 1.1, 'mint');
                K.badge('NEXT: REST VS GRAPHQL', 540, 1165, 'cyan', { size: 40, sc: pop(lt, th + 0.9, 0.3) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + pr, 'ping'); cue(st + th + 0.9, 'pop');
  }

  return { shots: S, cues: CUES };
}
