// Boot: fonts → script + timing → captions → shots. draw(t) renders film time t (a pure function of t).
// Blueprint look: NO white flash, NO hard cut. Each shot change is a 0.20 s crossfade of the incoming scene
// (the references never hard-cut). A slow push runs across every shot. A thin mint progress bar runs along the top.
import { W, H, setCtx, ctx, C, clamp, eo, eio, lerp } from './core/lib.js';
import { T, loadTiming } from './core/timing.js';
import { buildCaptions, drawCaption, captionList } from './core/captions.js';
import { buildShots } from './shots.js';
import * as K from './core/kit.js';

const cv = document.getElementById('cv');
const main = cv.getContext('2d');
const off = document.createElement('canvas'); off.width = W; off.height = H; const offc = off.getContext('2d');
const OP = (window.OP = { ready: false });
const XF = 0.2;   // crossfade seconds

function shotAt(S, t) { let i = S.length - 1; while (i > 0 && S[i].at > t) i--; return i; }
function paint(c, sh, lt, d, t, slide = 0) {
  setCtx(c); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.letterSpacing = '0px';
  const drift = 1 + (sh.zoom ?? 0.04) * eio(clamp(lt / d)), [cx, cy] = sh.cam || [540, 760];
  c.save(); c.translate(0, slide); c.translate(cx, cy); c.scale(drift, drift); c.translate(-cx, -cy);
  sh.draw(lt, d, t); c.restore(); c.globalAlpha = 1;
}

function draw(t) {
  t = clamp(t, 0, T.dur - 1e-4);
  const S = OP._shots, i = shotAt(S, t), sh = S[i], end = i < S.length - 1 ? S[i + 1].at : T.dur, d = end - sh.at, lt = t - sh.at;
  setCtx(main); main.setTransform(1, 0, 0, 1, 0, 0); main.globalAlpha = 1; main.fillStyle = '#000'; main.fillRect(0, 0, W, H);
  if (i > 0 && lt < XF) {
    const p = S[i - 1], pd = sh.at - p.at;
    paint(main, p, pd + lt, pd + lt, t);                       // outgoing scene keeps living
    const a = eo(lt / XF); paint(offc, sh, lt, d, t, 0);                              // incoming scene fades in (no slide: titles stay put)
    setCtx(main); main.globalAlpha = a; main.drawImage(off, 0, 0); main.globalAlpha = 1;
  } else paint(main, sh, lt, d, t);
  setCtx(main); main.setTransform(1, 0, 0, 1, 0, 0); main.globalAlpha = 1;
  K.chrome(t, T.dur, OP.script);                                              // progress bar + handle, always on top
  const fade = Math.min(clamp(t / 0.2), clamp((T.dur - t) / 0.3));
  if (fade < 1) { main.fillStyle = '#000'; main.globalAlpha = 1 - fade; main.fillRect(0, 0, W, H); main.globalAlpha = 1; }
  drawCaption(t);
}

(async () => {
  try {
    await Promise.all([document.fonts.load('900 100px Inter'), document.fonts.load('700 30px Mono'), document.fonts.load('400 40px Scrawl')]);
    const script = await (await fetch('script.json', { cache: 'no-store' })).json();
    await loadTiming();
    buildCaptions(script);
    const { shots, cues } = buildShots(script);
    shots.sort((a, b) => a.at - b.at);
    OP._shots = shots; OP.script = script;
    OP.duration = () => T.dur;
    OP.draw = draw;
    OP.frame = (t, q = 0.92) => { draw(t); return cv.toDataURL('image/jpeg', q); };
    OP.sheetPng = async () => { const { drawStyleSheet } = await import('./stylesheet.js'); setCtx(main); main.setTransform(1, 0, 0, 1, 0, 0); main.globalAlpha = 1; drawStyleSheet(); return cv.toDataURL('image/png'); };
    OP.shots = () => shots.map((s, k) => ({ id: s.id, at: +s.at.toFixed(3), end: +(k < shots.length - 1 ? shots[k + 1].at : T.dur).toFixed(3), note: s.note || '' }));
    OP.captions = () => captionList().map((c) => ({ s: +c.s.toFixed(3), e: +c.e.toFixed(3), text: c.words.map((w) => (w.hi ? '*' : '') + w.txt).join(' ') }));
    OP.cues = () => cues.slice().sort((a, b) => a.t - b.t);
    OP.ready = true;
    const q = new URLSearchParams(location.search);
    if (!q.has('capture')) {
      if (q.has('t')) draw(+q.get('t'));
      else {
        const audio = new Audio('data/mix.wav'); let t0 = null;
        const btn = document.getElementById('play'); btn.hidden = false;
        btn.onclick = () => { btn.hidden = true; t0 = performance.now(); audio.currentTime = 0; audio.play().catch(() => {}); };
        const loop = (now) => { const t = t0 == null ? 0 : (now - t0) / 1000; draw(t0 == null ? 0 : t); if (t0 != null && t > T.dur) { t0 = null; btn.hidden = false; } requestAnimationFrame(loop); };
        requestAnimationFrame(loop);
      }
    }
  } catch (e) { OP.bootError = String(e && e.stack || e); console.error(e); }
})();
