import "@fontsource/instrument-serif/400-italic.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";

function preserveHashOnLangSwitch() {
  document.querySelectorAll("a.lang-switch").forEach((link) => {
    link.addEventListener("click", (event) => {
      const { hash } = window.location;
      if (!hash || hash === "#") return;
      event.preventDefault();
      const target = new URL(link.getAttribute("href"), window.location.href);
      target.hash = hash;
      window.location.assign(`${target.pathname}${target.search}${target.hash}`);
    });
  });
}

function closeNavOnEscape() {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll("details.nav-details[open]").forEach((menu) => {
      menu.open = false;
    });
    document.querySelectorAll(".faq details[open]").forEach((item) => {
      item.open = false;
    });
  });
}

/** Lightweight 2D MI demo: list tap → body highlight; auto-cycles when idle. */
function initMuscleDemo() {
  const root = document.querySelector("[data-mi-demo]");
  const list = document.querySelector("[data-mi-list]");
  if (!root || !list) return;

  const body = root.querySelector("[data-mi-body]");
  const spot = root.querySelector("[data-mi-spot]");
  const chip = root.querySelector("[data-mi-chip]");
  const items = [...list.querySelectorAll("[data-muscle]")];
  if (!body || !items.length) return;

  const spots = {
    glutes: { x: "50%", y: "62%", color: "var(--muscle-glutes)", view: "back", img: "glutes" },
    quads: { x: "42%", y: "58%", color: "var(--muscle-quads)", view: "front", img: "front" },
    hamstrings: { x: "50%", y: "60%", color: "var(--muscle-hamstrings)", view: "back", img: "back" },
    calves: { x: "50%", y: "82%", color: "var(--muscle-calves)", view: "front", img: "front" },
    core: { x: "50%", y: "42%", color: "var(--muscle-core)", view: "front", img: "front" },
    back: { x: "50%", y: "36%", color: "var(--muscle-back)", view: "back", img: "back" },
    shoulders: { x: "62%", y: "24%", color: "var(--muscle-shoulders)", view: "front", img: "front" },
    arms: { x: "18%", y: "40%", color: "var(--muscle-arms)", view: "front", img: "arms" },
  };

  const srcFor = (key) => {
    // Prefer polished artwork; use live highlight stills only for glutes/arms demos.
    if (key === "glutes") return root.dataset.glutesSrc || root.dataset.backSrc;
    if (key === "arms") return root.dataset.armsSrc || root.dataset.frontSrc;
    if (key === "back") return root.dataset.backSrc;
    return root.dataset.frontSrc;
  };

  let index = 0;
  let timer = 0;
  let paused = false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function apply(muscle) {
    const cfg = spots[muscle] || spots.glutes;
    items.forEach((el) => {
      const on = el.dataset.muscle === muscle;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll(".muscle-view-btn").forEach((btn) => {
      const on = btn.dataset.miView === cfg.view;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    root.style.setProperty("--spot-x", cfg.x);
    root.style.setProperty("--spot-y", cfg.y);
    root.style.setProperty("--spot-color", cfg.color);
    root.classList.add("is-highlighting");
    if (spot) spot.dataset.muscle = muscle;
    if (chip) {
      const active = items.find((el) => el.dataset.muscle === muscle);
      const name = active?.querySelector(".mi-demo__name")?.textContent?.trim();
      if (name) chip.textContent = name;
    }
    const nextSrc = srcFor(cfg.img);
    if (nextSrc && body.getAttribute("src") !== nextSrc) {
      body.setAttribute("src", nextSrc);
    }
  }

  // Preload demo images so view swaps stay instant
  ["frontSrc", "backSrc", "glutesSrc", "armsSrc"].forEach((key) => {
    const href = root.dataset[key];
    if (!href) return;
    const img = new Image();
    img.decoding = "async";
    img.src = href;
  });

  function cycle() {
    if (paused || reduce) return;
    index = (index + 1) % items.length;
    apply(items[index].dataset.muscle);
  }

  function arm() {
    window.clearInterval(timer);
    if (!reduce) timer = window.setInterval(cycle, 2800);
  }

  items.forEach((el, i) => {
    const activate = () => {
      paused = true;
      index = i;
      apply(el.dataset.muscle);
      window.clearTimeout(el._resume);
      el._resume = window.setTimeout(() => {
        paused = false;
        arm();
      }, 7000);
    };
    el.addEventListener("click", activate);
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        activate();
      }
    });
  });

  document.querySelectorAll(".muscle-view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      paused = true;
      const view = btn.dataset.miView;
      const pick = items.find((el) => (spots[el.dataset.muscle] || {}).view === view) || items[0];
      index = items.indexOf(pick);
      apply(pick.dataset.muscle);
      window.setTimeout(() => {
        paused = false;
        arm();
      }, 7000);
    });
  });

  index = Math.max(0, items.findIndex((el) => el.dataset.muscle === "quads"));
  apply(items[index].dataset.muscle);
  arm();
}

preserveHashOnLangSwitch();
closeNavOnEscape();
initMuscleDemo();
