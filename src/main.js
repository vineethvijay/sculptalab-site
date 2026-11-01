import "@fontsource-variable/inter";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.getElementById("yr").textContent = new Date().getFullYear();

/* ---------- Aurora: flowing gradient shader (WebGL, falls back to CSS) ---------- */
function aurora() {
  const c = document.querySelector(".aurora");
  const gl = c.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
  if (!gl) { c.style.background = "radial-gradient(60% 50% at 70% 20%,#5a2414,#120D0B)"; return () => {}; }
  const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const fs = `precision mediump float;uniform vec2 r;uniform float t;uniform float s;
  vec3 C0=vec3(.071,.051,.043);vec3 C1=vec3(1.,.54,.24);vec3 C2=vec3(1.,.37,.38);vec3 C3=vec3(1.,.37,.54);vec3 C4=vec3(.56,.42,1.);
  float blob(vec2 uv,vec2 c,float rad){return smoothstep(rad,0.,length(uv-c));}
  void main(){vec2 uv=gl_FragCoord.xy/r;uv.x*=r.x/r.y;float a=r.x/r.y;float T=t*.06;float k=s;
    vec2 p1=vec2(a*(.75+.18*sin(T*1.3)),.85+.12*cos(T*1.1)-k*.5);
    vec2 p2=vec2(a*(.25+.2*cos(T*.9)),.25+.15*sin(T*1.4)+k*.2);
    vec2 p3=vec2(a*(.55+.25*sin(T*.7+2.)),.55+.2*cos(T*.8+1.)-k*.3);
    vec2 p4=vec2(a*(.9+.1*cos(T)),.2+.15*sin(T*1.2+3.)+k*.4);
    vec3 col=C0;
    col=mix(col,C1*.55,blob(uv,p1,.75)*.85);
    col=mix(col,C2*.45,blob(uv,p2,.6)*.7);
    col=mix(col,C3*.38,blob(uv,p3,.55)*.55);
    col=mix(col,C4*.32,blob(uv,p4,.6)*.5*(.4+k));
    float v=smoothstep(1.4,.2,length((gl_FragCoord.xy/r-.5)*vec2(1.2,1.)));
    col*=mix(.45,1.,v);
    gl_FragColor=vec4(col,1.);}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, "r"), uT = gl.getUniformLocation(pr, "t"), uS = gl.getUniformLocation(pr, "s");
  const dpr = Math.min(devicePixelRatio, 1.5) * 0.5; // soft gradient — render at half res
  const size = () => { c.width = innerWidth * dpr; c.height = innerHeight * dpr; gl.viewport(0, 0, c.width, c.height); };
  size(); addEventListener("resize", size);
  let scroll = 0;
  const draw = (ms) => {
    gl.uniform2f(uR, c.width, c.height); gl.uniform1f(uT, reduced ? 20 : ms / 1000 + 20); gl.uniform1f(uS, scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  if (reduced) draw(0); else gsap.ticker.add((t) => draw(t * 1000));
  return (v) => { scroll = v; if (reduced) draw(0); };
}
const setAuroraScroll = aurora();

/* ---------- smooth scroll ---------- */
let lenis;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href"); if (id.length < 2) return;
    const el = document.querySelector(id); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { offset: -20 });
  }));
}
ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => setAuroraScroll(s.progress) });

/* ---------- split helpers ---------- */
document.querySelectorAll("[data-split]").forEach((el) => {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) frag.append(w);
          else { const s = document.createElement("span"); s.className = "wd"; s.textContent = w; frag.append(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        if (n.tagName === "EM") { n.classList.add("wd"); } else walk(n);
      }
    });
  };
  walk(el);
});

/* ---------- intro ---------- */
function intro() {
  const loader = document.querySelector(".loader");
  if (reduced) { loader.remove(); gsap.set(".contour .cl", { strokeDashoffset: 0 }); return; }
  document.body.classList.add("loading");
  gsap.set(".hero-title .w", { yPercent: 110 });
  gsap.set(".reveal-up", { y: 24, opacity: 0 });
  gsap.set(".sculpt", { opacity: 0, scale: .85 });
  gsap.set(".hero-phone", { y: 120, opacity: 0, rotate: -6, scale: .9 });
  gsap.set(".float-chip,.orbit", { opacity: 0, scale: .8 });
  gsap.set(".nav", { y: -40, opacity: 0 });
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.to(".loader-ring", { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, 0)
    .to(".loader-path", { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }, 0.1)
    .to(".loader-word span", { y: 0, duration: 0.9, stagger: 0.08 }, 0.6)
    .to(".loader-s", { scale: 14, opacity: 0, duration: 1.1, ease: "expo.in" }, 1.7)
    .to(".loader-word", { opacity: 0, y: -10, duration: 0.4 }, 1.7)
    .to(".loader", { clipPath: "circle(0% at 50% 50%)", duration: 1, ease: "expo.inOut" }, 2.1)
    .add(() => { loader.remove(); document.body.classList.remove("loading"); })
    .to(".nav", { y: 0, opacity: 1, duration: 1 }, 2.5)
    .to(".hero-title .w", { yPercent: 0, duration: 1.3, stagger: 0.08 }, 2.4)
    .to(".reveal-up", { y: 0, opacity: 1, duration: 1.1, stagger: 0.1 }, 2.7)
    .to(".contour .cl", { strokeDashoffset: 0, duration: 2.4, stagger: 0.12, ease: "power2.inOut" }, 2.3)
    .to(".sculpt", { opacity: 1, scale: 1, duration: 2, ease: "expo.out" }, 2.2)
    .to(".orbit", { opacity: 1, scale: 1, duration: 1.6 }, 2.4)
    .to(".hero-phone", { y: 0, opacity: 1, rotate: 0, scale: 1, duration: 1.6 }, 2.6)
    .to(".mpin", { scale: 1, duration: .8, stagger: .12, ease: "back.out(3)" }, 3.4)
    .to(".float-chip", { opacity: 1, scale: 1, duration: 1, stagger: 0.15, ease: "back.out(2)" }, 3.2);
  gsap.set(".loader", { clipPath: "circle(100% at 50% 50%)" });
}
intro();

if (!reduced) {
  /* hero idle float + pointer parallax */
  gsap.to(".c1", { y: -14, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(".c2", { y: 14, duration: 3.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
  const stage = document.querySelector(".hero-stage");
  if (matchMedia("(pointer:fine)").matches) {
    const qx = gsap.quickTo(".hero-phone", "rotationY", { duration: 1, ease: "power3" });
    const qy = gsap.quickTo(".hero-phone", "rotationX", { duration: 1, ease: "power3" });
    const cx = gsap.quickTo(".sculpt", "x", { duration: 1.4, ease: "power3" });
    const cy = gsap.quickTo(".sculpt-body", "rotationY", { duration: 1.6, ease: "power3" });
    gsap.set(".hero-stage", { perspective: 1200 });
    addEventListener("pointermove", (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      qx(nx * 16); qy(-ny * 12); cx(nx * -36); cy(nx * 10);
    });
  }
  gsap.to(".body-glow", { opacity: .4, scale: 1.04, transformOrigin: "50% 60%", duration: 3.5, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(".sculpt", { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  /* hero scroll-out */
  gsap.to(".hero-copy", { yPercent: -18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(stage, { yPercent: 12, scale: 0.92, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* manifesto word scrub */
  gsap.to(".big-text .wd", { opacity: 1, stagger: 0.08, ease: "none",
    scrollTrigger: { trigger: ".manifesto", start: "top 75%", end: "bottom 55%", scrub: true } });

  /* headings reveal */
  document.querySelectorAll(".h2[data-split], .dl-title").forEach((h) => {
    gsap.from(h.querySelectorAll(".wd"), { yPercent: 60, opacity: 0, rotateX: -40, duration: 1.1, stagger: 0.06, ease: "expo.out",
      scrollTrigger: { trigger: h, start: "top 85%" } });
  });
  gsap.utils.toArray(".fcard,.bx,.sc-card").forEach((el, i) => {
    gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", delay: (i % 3) * 0.08, scrollTrigger: { trigger: el, start: "top 90%" } });
  });
  gsap.from(".dl-mark", { scale: 0.4, rotate: -90, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".download", start: "top 70%" } });
  gsap.fromTo(".dl-glow", { scale: 0.6 }, { scale: 1.15, ease: "none", scrollTrigger: { trigger: ".download", start: "top bottom", end: "bottom bottom", scrub: true } });
  gsap.to(".mq-track", { x: "-=200", ease: "none", scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: true } });

  /* score bars + ring */
  gsap.utils.toArray(".mlist,.comp").forEach((l) => gsap.from(l.querySelectorAll(".bar i"), { scaleX: 0, duration: 1, stagger: 0.04, ease: "expo.out", scrollTrigger: { trigger: l, start: "top 95%" } }));
  gsap.fromTo(".sring", { strokeDashoffset: 1 }, { strokeDashoffset: .18, duration: 2, ease: "expo.out", scrollTrigger: { trigger: ".sbox-score", start: "top 80%" }, onComplete: () => gsap.to(".sring", { strokeDashoffset: .13, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" }) });
  gsap.set(".mpin", { scale: 0, transformOrigin: "center", transformBox: "fill-box" });
  /* live pose skeleton: hip thrust loop */
  const rep = gsap.timeline({ repeat: -1, repeatDelay: 0.3, defaults: { duration: 0.9, ease: "sine.inOut" } });
  const up = { torso: "M 80 245 L 160 215", thigh: "M 160 215 L 215 220" };
  const down = { torso: "M 80 245 L 160 250", thigh: "M 160 250 L 215 220" };
  let n = 7; const rc = document.querySelector(".rep-count");
  rep.to(".b-torso", { attr: { d: up.torso } }, 0).to(".b-thigh", { attr: { d: up.thigh } }, 0).to(".j-hip,.hip-glow", { attr: { cy: 215 } }, 0).to(".hip-lbl", { opacity: 1 }, 0)
     .to(".b-torso", { attr: { d: down.torso } }, 1.2).to(".b-thigh", { attr: { d: down.thigh } }, 1.2).to(".j-hip,.hip-glow", { attr: { cy: 250 } }, 1.2).to(".hip-lbl", { opacity: 0 }, 1.2)
     .add(() => { n = n >= 10 ? 1 : n + 1; rc.textContent = n; }, 0.9);
}

/* ---------- story: steps drive phone screens ---------- */
const steps = [...document.querySelectorAll(".step")];
const screens = [...document.querySelectorAll(".story-phone .sc")];
let cur = 0;
const show = (i) => {
  if (i === cur) return; cur = i;
  steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
  screens.forEach((s, k) => s.classList.toggle("is-on", k === i));
  if (i === 1 && !reduced) gsap.fromTo(".plan-row", { x: 30, opacity: 0 }, { x: 0, opacity: (k, el) => el.classList.contains("rest") ? .45 : 1, stagger: .08, duration: .7, ease: "expo.out" });
  if (i === 3 && !reduced) {
    gsap.fromTo(".mb i", { scaleX: 0 }, { scaleX: 1, stagger: 0.06, duration: 1, ease: "expo.out" });
  }
};
const mm = gsap.matchMedia();
mm.add("(min-width: 981px)", () => {
  ScrollTrigger.create({
    trigger: ".story", start: "top top", end: "+=" + innerHeight * 3, pin: ".story-pin", scrub: true,
    onUpdate: (s) => show(Math.min(3, Math.floor(s.progress * 4))),
  });
  if (!reduced) gsap.fromTo(".story-phone", { rotateY: -18, rotateX: 6 }, { rotateY: 14, rotateX: -4, ease: "none",
    scrollTrigger: { trigger: ".story", start: "top top", end: "+=" + innerHeight * 3, scrub: true } });
});
mm.add("(max-width: 980px)", () => {
  steps.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: "top 75%", end: "bottom 40%", onToggle: (e) => e.isActive && show(i) }));
});

/* ---------- card spotlight ---------- */
document.querySelectorAll(".fcard").forEach((c) => c.addEventListener("pointermove", (e) => {
  const r = c.getBoundingClientRect();
  c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px");
}));

/* ---------- magnetic store buttons ---------- */
if (!reduced && matchMedia("(pointer:fine)").matches) {
  document.querySelectorAll(".store:not(.ghost),.btn").forEach((b) => {
    const xT = gsap.quickTo(b, "x", { duration: 0.6, ease: "power3" }), yT = gsap.quickTo(b, "y", { duration: 0.6, ease: "power3" });
    b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); xT((e.clientX - r.left - r.width / 2) * 0.25); yT((e.clientY - r.top - r.height / 2) * 0.35); });
    b.addEventListener("pointerleave", () => { xT(0); yT(0); });
  });
}

/* ---------- store links: placeholder until listings are public ---------- */
const STORE = { play: "", ios: "" }; // fill with real listing URLs at launch
const toast = Object.assign(document.createElement("div"), { className: "toast", role: "status" });
document.body.append(toast);
document.querySelectorAll("[data-store]").forEach((a) => {
  const url = STORE[a.dataset.store];
  if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; return; }
  a.addEventListener("click", (e) => {
    e.preventDefault();
    toast.textContent = "Early access — ask Vineeth for your private invite link ✨";
    toast.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove("show"), 3200);
  });
});

/* nav: hide on scroll down, show on scroll up */
{ const nav = document.querySelector(".nav"); let last = 0;
  addEventListener("scroll", () => { const y = scrollY; if (Math.abs(y - last) < 4) return; nav.classList.toggle("hide", y > 200 && y > last); last = y; }, { passive: true }); }

/* ---------- living mockups ---------- */
const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
// count-up numbers when they enter view
document.querySelectorAll("[data-count]").forEach((el) => {
  const to = +el.dataset.count;
  if (reduced) return;
  ScrollTrigger.create({ trigger: el, start: "top 92%", once: false, onEnter: () => {
    const o = { v: 0 }; gsap.to(o, { v: to, duration: 1.6, ease: "expo.out", onUpdate: () => (el.textContent = Math.round(o.v)) });
  } });
});
if (!reduced) {
  // timers
  document.querySelectorAll(".tick-up").forEach((el) => { let t = +el.dataset.start; setInterval(() => (el.textContent = fmt(++t)), 1000); });
  document.querySelectorAll(".tick-down").forEach((el) => { let t = +el.dataset.start; setInterval(() => { t = t <= 0 ? 45 : t - 1; el.textContent = fmt(t); }, 1000); });
  document.querySelectorAll(".cycle").forEach((el) => { const v = el.dataset.vals.split(","); let i = 0; setInterval(() => { i = (i + 1) % v.length; gsap.fromTo(el, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .4 }); el.textContent = v[i]; }, 2600); });
  // hero phone: week dots light up in sequence, start button shimmer
  gsap.fromTo(".hero-phone .d.done", { scale: .6 }, { scale: 1, duration: .6, ease: "back.out(3)", stagger: .3, repeat: -1, repeatDelay: 4 });
  gsap.to(".tc-btn", { boxShadow: "0 0 0 6px rgba(30,20,16,.15)", duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
  // muscle bars breathing (app + scores section + dashboard)
  gsap.utils.toArray(".mb i, .mlist .bar i, .comp .bar i, .parts i").forEach((b, i) => {
    gsap.to(b, { "--k": () => gsap.utils.random(.9, 1.06), duration: () => gsap.utils.random(2, 3.5), yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2 + i * .1 });
  });
  // plan rows stagger when visible, then the 'now' row glows
  gsap.to(".plan-row.now .pc", { boxShadow: "0 0 24px rgba(255,138,61,.45)", duration: 1.4, yoyo: true, repeat: -1 });
  // dashboard: trend line draws, dot pulses, history list rotates, diet items fill in
  const tl = gsap.timeline({ scrollTrigger: { trigger: ".browser", start: "top 75%" } });
  tl.from(".browser", { rotateX: 18, y: 80, opacity: 0, duration: 1.4, ease: "expo.out" })
    .from(".tr-line", { strokeDashoffset: 1, duration: 2, ease: "power2.inOut" }, .3)
    .from(".tr-area", { opacity: 0, duration: 1.2 }, 1)
    .from(".parts i", { scaleX: 0, duration: 1.2, stagger: .06, ease: "expo.out" }, .4)
    .from(".diet li", { x: -20, opacity: 0, stagger: .25, duration: .6 }, 1)
    .from(".hist li", { y: 14, opacity: 0, stagger: .12, duration: .6 }, .6);
  gsap.to(".tr-dot", { attr: { r: 9 }, opacity: .5, duration: 1, yoyo: true, repeat: -1 });
  const hist = document.querySelector(".hist");
  const extra = [["Lower A", "Hip thrust 4×10 · 10/10 clean", "Now"], ["Cardio", "40 min walk · +12 pts", "Now"], ["Upper", "Lateral raise · Row", "Now"]];
  let hi = 0;
  setInterval(() => {
    if (!hist) return;
    const [b, sp, e] = extra[hi++ % extra.length];
    const li = document.createElement("li"); li.innerHTML = `<b>${b}</b><span>${sp}</span><em>${e}</em>`;
    hist.prepend(li); hist.lastElementChild.remove();
    gsap.from(li, { height: 0, opacity: 0, background: "rgba(255,138,61,.3)", duration: .8, ease: "expo.out" });
    hist.querySelectorAll("li em").forEach((x, k) => k > 0 && x.textContent === "Now" && (x.textContent = "Today"));
  }, 4200);
  // dashboard score subtly updates
  const ds = document.querySelector(".d-score b"); let dv = 82;
  setInterval(() => { dv = dv >= 86 ? 82 : dv + 1; ds.textContent = dv; gsap.fromTo(ds, { scale: 1.12 }, { scale: 1, duration: .5 }); }, 5200);
  // big sculpt ring gently fills/adjusts
  // cardio points pulse
  gsap.to(".pts", { scale: 1.06, transformOrigin: "left center", duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
}
