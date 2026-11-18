// gRPC vs WebSocket vs Webhook: shot list (Blueprint). Webhook = cyan, WebSocket = violet, gRPC = amber, problem = coral, success/request = mint.
import { ctx, C, W, H, clamp, lerp, seg, eo, eio, eob, rr, circle, line, txt } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';

const pop = (lt, a, d = 0.22) => eob(seg(lt, a, a + d));
const fade = (lt, a, d = 0.25) => eo(seg(lt, a, a + d));
const typeN = (lt, a, b, n) => Math.floor(clamp((lt - a) / (b - a)) * n);
const LX = 200, RX = 880;

export function buildShots() {
  const S = [], CUES = [];
  const add = (o) => (S.push(o), o);
  const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.1);

  // 1 · polling vs told
  { const st = cut(0), pd = Wd('succeeded', 0) - st, ak = Wd('asking', 0) - st, td = Wd('told', 0) - st;
    add({ id: 'S01', at: st, cam: [540, 800], zoom: 0.05, note: 'server polls payments (mint out, coral "not yet" back, looping) until "told": then ONE cyan push arrives with a mint check',
      draw(lt) {
        K.stage(); K.title('PAYMENT SUCCEEDED', 'now what?', pop(lt, 0.05, 0.3));
        K.card(50, 420, 980, 700, { title: 'how does your server find out?', accent: 'cyan' });
        K.node(LX + 30, 770, 'server', 'server', 'amber', { s: 1.1, a: pop(lt, 0.15, 0.3) }); K.node(RX - 30, 770, 'payments', 'db', 'violet', { s: 1.1, a: pop(lt, 0.2, 0.3) });
        K.wire([[340, 770], [700, 770]], 'stroke'); K.badge('PAID', RX - 30, 640, 'mint', { size: 40, sc: pop(lt, pd, 0.25) });
        if (lt > ak - 1.2 && lt < td - 0.1) { const p = ((lt - (ak - 1.2)) / 1.1) % 1; if (p < 0.5) K.dot([[340, 750], [700, 750]], p * 2, {}); else K.dot([[700, 790], [340, 790]], (p - 0.5) * 2, { color: 'coral' }); }
        if (lt > ak) K.badge('NOT YET?', 540, 940, 'coral', { size: 40, sc: pop(lt, ak, 0.2) * (lt < td ? 1 : 0.0) });
        if (lt >= td) { K.dot([[700, 770], [340, 770]], eio(seg(lt, td, td + 0.9)), { color: 'cyan' }); K.check(LX + 30, 650, pop(lt, td + 0.9, 0.25) * 1.0, 'mint'); K.badge('TOLD', 540, 940, 'cyan', { size: 46, sc: pop(lt, td + 0.2, 0.25) }); }
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + pd, 'pop', { gain: 0.5 }); for (let k = 0; k < 2; k++) cue(st + Math.max(0.3, ak - 1.2) + k * 1.1, 'click', { gain: 0.5 }); cue(st + ak, 'miss', { gain: 0.6 }); cue(st + td, 'ping'); }

  // 2 · webhook = an HTTP request to your URL
  { const st = cut(1), wh = Wd('webhook', 1) - st, rq = Wd('request', 1) - st, ur = Wd('URL', 1) - st;
    const body = ['$ POST /hooks/pay', '{ "event": "paid",', '  "amount": 40 }'], tot = body.join('').length;
    add({ id: 'S02', at: st, cam: [540, 800], zoom: 0.05, note: 'cyan WEBHOOK title; other service sends a POST dot to YOUR URL row on "request"; JSON body types; focus box on "URL"',
      draw(lt) {
        K.stage(); K.title('A WEBHOOK', null, pop(lt, wh - 0.1, 0.25), C.cyan);
        K.node(190, 600, 'other service', 'server', 'cyan', { a: pop(lt, 0.2, 0.3) });
        K.menu(450, 470, 580, [{ m: 'POST', p: '/hooks/pay' }], { rh: 150, title: 'your URL', a: fade(lt, 0.4) });
        K.wire([[300, 600], [450, 600]], 'stroke'); K.dot([[300, 600], [450, 600]], eio(seg(lt, rq - 0.2, rq + 0.7)), {}); K.badge('REQUEST', 190, 760, 'cyan', { size: 34, sc: pop(lt, rq, 0.2) });
        let left = typeN(lt, rq, ur, tot); const ls = body.map((s) => { const k = Math.max(0, Math.min(s.length, left)); left -= s.length; return { t: s.slice(0, k), c: s === body[0] ? 'cyan' : 'amber' }; });
        K.terminal(70, 820, 940, 300, ls, 1e9, fade(lt, rq - 0.2)); K.focus(740, 600, 600, 230, lt, fade(lt, ur), 'cyan');
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + wh, 'pop'); cue(st + rq - 0.2, 'slide', { dur: 0.9, gain: 0.45 }); for (let k = 0; k < 6; k++) cue(st + rq + k * 0.2, 'click', { gain: 0.6 }); cue(st + ur, 'ping', { gain: 0.5 }); }

  // 3 · one way, reachable, verify the signature
  { const st = cut(2), on = Wd('one', 2) - st, re = Wd('reachable', 2) - st, vf = Wd('verify', 2) - st, sg = Wd('signature', 2) - st;
    const rows = [{ k: 'POST', v: '/hooks/pay', use: false }, { k: 'signature', v: '9f2c…', use: true }, { k: 'body', v: '{ paid }', use: false }];
    add({ id: 'S03', at: st, cam: [540, 800], zoom: 0.05, note: 'one-way arrow + ONE WAY on "one"; PUBLIC HTTPS URL chip on "reachable"; the request card gets a mint check on "verify"/"signature"',
      draw(lt) {
        K.stage(); K.title('ONE WAY IN', null, 1, C.cyan);
        K.node(190, 640, 'sender', 'server', 'cyan', {}); K.wire([[290, 640], [370, 640]], 'cyan', { a: fade(lt, on) }); K.arrowHead(372, 640, 0, 'cyan'); K.badge('ONE WAY', 190, 790, 'cyan', { size: 36, sc: pop(lt, on, 0.22) });
        K.fieldsCard(400, 430, 630, rows.map((r, i) => ({ ...r, use: i === 1 && lt > sg - 0.2 ? true : false })), { title: 'incoming request', accent: 'cyan', rowA: rows.map((_, i) => fade(lt, 0.2 + i * 0.12)), rh: 110, unused: 0 });
        K.badge('PUBLIC HTTPS URL', 540, 960, 'cyan', { size: 36, sc: pop(lt, re, 0.25) });
        K.check(960, 640, pop(lt, sg, 0.25) * 1.0, 'mint'); K.note('verify it is really them', 540, 1110, C.mint, fade(lt, vf), 52);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + on, 'pop'); cue(st + re, 'pop', { gain: 0.6 }); cue(st + vf, 'tock'); cue(st + sg, 'ping'); }

  // 4 · WebSocket: one connection stays open
  { const st = cut(3), ws = Wd('websocket', 3) - st, on = Wd('one', 3) - st, op = Wd('open', 3) - st, ei = Wd('either', 3) - st, an = Wd('any', 3) - st;
    add({ id: 'S04', at: st, cam: [540, 800], zoom: 0.05, note: 'violet WEBSOCKET title; a pipe grows between browser and server on "one", OPEN badge on "open", message dots flow both ways from "either"',
      draw(lt) {
        K.stage(); K.title('A WEBSOCKET', null, pop(lt, ws - 0.1, 0.25), C.violet);
        K.card(50, 420, 980, 700, { title: 'one connection', accent: 'violet' });
        K.node(190, 700, 'browser', 'browser', 'cyan', { a: pop(lt, 0.15, 0.3) }); K.node(890, 700, 'server', 'server', 'amber', { a: pop(lt, 0.2, 0.3) });
        K.pipe(300, 780, 700, { grow: eio(seg(lt, on - 0.1, on + 0.7)), flow: fade(lt, ei, 0.3), t: lt, accent: 'violet' });
        K.badge('OPEN', 540, 590, 'violet', { size: 46, sc: pop(lt, op, 0.22) });
        K.record(360, 900, 'hi!', { color: 'mint', a: pop(lt, ei + 0.4, 0.2), s: 1.2 }); K.record(720, 960, 'price 41', { color: 'amber', a: pop(lt, ei + 1.1, 0.2), s: 1.2 });
        K.note('either side, any time', 540, 1060, C.violet, fade(lt, an), 56);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ws, 'pop'); cue(st + on, 'slide', { dur: 0.7, gain: 0.45 }); cue(st + op, 'ping', { gain: 0.6 }); cue(st + ei + 0.4, 'pop', { gain: 0.4 }); cue(st + ei + 1.1, 'pop', { gain: 0.4 }); }

  // 5 · who uses it, and the memory cost
  { const st = cut(4), ch = Wd('chat', 4) - st, pr = Wd('prices', 4) - st, op = Wd('open', 4) - st, me = Wd('memory', 4) - st;
    add({ id: 'S05', at: st, cam: [540, 800], zoom: 0.05, note: 'chat / prices / game clients each hold a violet connection to the server; the memory meter climbs amber on "memory"',
      draw(lt) {
        K.stage(); K.title('WHO USES IT', null, 1, C.violet);
        const t0 = [ch, pr, op]; const cl = [['chat', 'user', 220], ['prices', 'clock', 540], ['game', 'browser', 860]];
        K.node(540, 800, 'server', 'server', 'amber', { a: fade(lt, 0.1) });
        cl.forEach(([lab, kind, x], i) => { const a = pop(lt, i === 0 ? ch - 0.1 : i === 1 ? pr - 0.1 : op - 0.1, 0.25); K.node(x, 500, lab, kind, 'violet', { a }); K.wire([[x, 570], [x === 540 ? 540 : x < 540 ? 480 : 600, 720]], 'violet', { a }); });
        const p = 0.1 + 0.75 * eio(seg(lt, op, me + 1.0)); K.meter(100, 1040, 880, p, 'amber', 'memory (typical)', lt > me + 0.7 ? 'GROWS' : '');
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ch, 'pop', { gain: 0.5 }); cue(st + pr, 'pop', { gain: 0.5 }); cue(st + op, 'pop', { gain: 0.5 }); cue(st + me, 'tock'); }

  // 6 · gRPC: call, typed, binary, HTTP/2
  { const st = cut(5), gr = Wd('grpc', 5) - st, ca = Wd('call', 5) - st, fu = Wd('functions', 5) - st, ty = Wd('typed', 5) - st, bi = Wd('binary', 5) - st, ht = Wd('http', 5) - st;
    const A = ['service Users {', '  rpc GetUser(Id) returns (User);', '}'], B = ['message User {', '  string name = 1;', '  int32 id = 2;', '}'], na = A.join('').length, nb = B.join('').length;
    add({ id: 'S06', at: st, cam: [540, 800], zoom: 0.05, note: 'amber gRPC title; service A calls GetUser() on service B on "call" (the contract types in); a typed message schema types on "typed"; the chip turns into hex bytes on "binary"; HTTP/2 badge on "http"',
      draw(lt) {
        K.stage(); K.title('gRPC', 'service to service', pop(lt, gr - 0.1, 0.25), C.amber);
        K.node(LX, 560, 'service A', 'server', 'amber', { a: pop(lt, 0.2, 0.3) }); K.node(RX, 560, 'service B', 'server', 'amber', { a: pop(lt, 0.3, 0.3) }); K.wire([[300, 560], [780, 560]], 'stroke');
        K.dot([[300, 560], [780, 560]], eio(seg(lt, ca, fu + 0.4)), {}); K.badge(lt > bi ? '0A 04 41 73 68 61' : 'GetUser()', 540, 470, 'amber', { size: lt > bi ? 34 : 38, sc: pop(lt, ca, 0.22) });
        let la = typeN(lt, ca + 0.2, fu + 0.6, na), lb = typeN(lt, ty, bi - 0.2, nb); const mk = (arr, left) => arr.map((s) => { const k = Math.max(0, Math.min(s.length, left)); left -= s.length; return { t: s.slice(0, k), c: 'amber' }; });
        K.terminal(70, 700, 940, 490, [...mk(A, la), ...mk(B, lb)], 1e9, fade(lt, ca));
        K.badge('HTTP/2', 540, 565, 'cyan', { size: 34, sc: pop(lt, ht, 0.22) });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + gr, 'pop'); cue(st + ca, 'slide', { dur: 0.9, gain: 0.45 }); for (let k = 0; k < 6; k++) cue(st + ca + 0.3 + k * 0.2, 'click', { gain: 0.4 }); for (let k = 0; k < 6; k++) cue(st + ty + k * 0.2, 'click', { gain: 0.5 }); cue(st + bi, 'pop', { gain: 0.6 }); cue(st + ht, 'ping', { gain: 0.5 }); }

  // 7 · the catch: browsers need a proxy
  { const st = cut(6), ct = Wd('catch', 6) - st, br = Wd('browsers', 6) - st, px = Wd('proxy', 6) - st, wb = Wd('web', 6) - st, rc = Wd('reach', 6) - st;
    add({ id: 'S07', at: st, cam: [540, 800], zoom: 0.05, note: 'coral title; browser dot toward the gRPC server stops at a coral X on "browsers"; a proxy node (gRPC-Web) appears on "proxy" and the dot gets through on "reach"',
      draw(lt) {
        K.stage(); K.title('BUT HERE IS THE CATCH', null, 1, C.coral);
        K.card(50, 420, 980, 600, { title: 'browser to gRPC', accent: 'coral', a: fade(lt, 0.15) });
        K.node(190, 700, 'browser', 'browser', 'cyan', { a: fade(lt, 0.25) }); K.node(890, 700, 'gRPC server', 'server', 'amber', { a: fade(lt, 0.3) });
        K.wire([[300, 700], [780, 700]], 'stroke', { dash: lt < px ? [14, 14] : null });
        if (lt > br - 0.2 && lt < px) { K.dot([[300, 700], [480, 700]], eio(seg(lt, br - 0.2, br + 0.6)), {}); K.cross(540, 700, pop(lt, br + 0.55, 0.22) * 1.1, 'coral'); }
        if (lt >= px) { K.node(540, 700, 'proxy', 'api', 'violet', { s: 1.0, a: pop(lt, px, 0.25) }); K.dot([[300, 700], [780, 700]], eio(seg(lt, rc - 0.3, rc + 0.9)), {}); K.badge('gRPC-Web', 540, 570, 'violet', { size: 38, sc: pop(lt, wb, 0.22) }); K.check(890, 600, pop(lt, rc + 0.8, 0.22) * 0.9, 'mint'); }
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ct, 'pop'); cue(st + br + 0.55, 'miss'); cue(st + px, 'pop'); cue(st + rc, 'slide', { dur: 0.9, gain: 0.4 }); cue(st + rc + 0.9, 'ping'); }

  // 8 · webhooks arrive twice or fail
  { const st = cut(7), tw = Wd('twice', 7) - st, fl = Wd('fail', 7) - st, du = Wd('duplicates', 7) - st;
    add({ id: 'S08', at: st, cam: [540, 800], zoom: 0.05, note: 'the same evt_42 arrives twice (second turns coral "duplicate") on "twice"; a coral X + retry spinner on "fail"; "log event IDs" note on "duplicates"',
      draw(lt) {
        K.stage(); K.title('WEBHOOKS ARE MESSY', null, 1, C.coral);
        K.card(50, 420, 980, 700, { title: 'delivery', accent: 'cyan' });
        K.node(LX, 700, 'sender', 'server', 'cyan', {}); K.node(RX, 700, 'endpoint', 'server', 'amber', { dim: 0 }); K.wire([[300, 700], [780, 700]], 'stroke');
        K.dot([[300, 700], [780, 700]], eio(seg(lt, 0.3, 1.2)), { color: 'cyan' }); K.record(540, 600, 'evt_42', { color: 'cyan', a: fade(lt, 0.4) });
        K.dot([[300, 700], [780, 700]], eio(seg(lt, tw - 0.4, tw + 0.5)), { color: 'cyan' }); K.record(540, 800, 'evt_42', { color: 'coral', stale: true, a: pop(lt, tw + 0.3, 0.22) }); K.note('same event, twice', 540, 900, C.coral, fade(lt, tw + 0.4), 48);
        K.cross(RX, 580, pop(lt, fl, 0.22) * 0.8, 'coral'); if (lt > fl) K.spinner(RX, 900, 34, lt, 'coral'); K.note('plan for it: log event IDs', 540, 1040, C.mint, fade(lt, du), 52);
      } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + 0.3, 'slide', { dur: 0.9, gain: 0.4 }); cue(st + tw - 0.4, 'slide', { dur: 0.9, gain: 0.4 }); cue(st + tw + 0.3, 'miss', { gain: 0.5 }); cue(st + fl, 'miss'); cue(st + du, 'ping', { gain: 0.5 }); }

  // 9 · verdict: pick by who's talking
  { const st = cut(8), tk = Wd('talking', 8) - st, sv = Wd('server', 8) - st, wh = Wd('webhook', 8) - st, br = Wd('browser', 8) - st, ws = Wd('websocket', 8) - st, se = Wd('service', 8) - st, gr = Wd('grpc', 8) - st;
    const cols = [['webhook', 'server', 'cyan', ['server', 'to you'], sv], ['WebSocket', 'browser', 'violet', ['browser', 'live'], br], ['gRPC', 'api', 'amber', ['service', 'to service'], se]];
    add({ id: 'S09', at: st, cam: [540, 800], zoom: 0.05, note: 'three columns light up one by one on their words: webhook (server to you), WebSocket (browser live), gRPC (service to service)',
      draw(lt) {
        K.stage(); K.title('PICK BY WHO IS TALKING', null, fade(lt, 0.05, 0.3));
        cols.forEach(([name, kind, acc, who, at], i) => { const x = 50 + i * 340, on = pop(lt, at - 0.15, 0.3), a = 0.3 + 0.7 * on; K.card(x, 430, 300, 640, { title: name, accent: acc, a, stroke: lt > at ? acc : undefined });
          K.node(x + 150, 640, name, kind, acc, { s: 0.95, a: a * on }); if (lt > at) { txt(who[0], x + 150, 880, 40, C[acc], 'Mono'); txt(who[1], x + 150, 940, 40, C.white, 'Mono'); } });
      } });
    cue(st, 'whoosh', { gain: 0.5 }); [sv, br, se].forEach((t) => cue(st + t - 0.15, 'pop', { gain: 0.6 })); cue(st + gr, 'ping'); }

  return { shots: S, cues: CUES };
}
