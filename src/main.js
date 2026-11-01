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
    .to(".orbit", { opacity: 1, scale: 1, duration: 1.6 }, 2.4)
    .to(".hero-phone", { y: 0, opacity: 1, rotate: 0, scale: 1, duration: 1.6 }, 2.6)
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
    const cx = gsap.quickTo(".contour", "x", { duration: 1.4, ease: "power3" });
    gsap.set(".hero-stage", { perspective: 1200 });
    addEventListener("pointermove", (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      qx(nx * 16); qy(-ny * 12); cx(nx * -30);
    });
  }
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
  if (i === 3 && !reduced) {
    gsap.fromTo(".bars i", { scaleY: 0 }, { scaleY: 1, stagger: 0.05, duration: 0.8, ease: "expo.out" });
    gsap.fromTo(".ring-fg", { strokeDashoffset: 1 }, { strokeDashoffset: 0.22, duration: 1.4, ease: "expo.out" });
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
