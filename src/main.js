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

/**
 * 2D MI demo: list tap swaps a pre-rendered plate+mask composite so the
 * highlight sits exactly on the selected muscle (no radial glow).
 * Assets: public/images/anatomy/mi-v4/highlights/female-{front|back}-{region}-800w.webp
 */
function initMuscleDemo() {
  const root = document.querySelector("[data-mi-demo]");
  const list = document.querySelector("[data-mi-list]");
  if (!root || !list) return;

  const plate = root.querySelector("[data-mi-plate]");
  const chip = root.querySelector("[data-mi-chip]");
  const items = [...list.querySelectorAll("[data-muscle]")];
  if (!plate || !items.length) return;

  const base = root.dataset.highlightBase; // .../highlights/
  const regionView = {
    glutes: "back",
    hamstrings: "back",
    back: "back",
    quads: "front",
    core: "front",
    calves: "front",
    shoulders: "front",
    arms: "front",
  };
  const bothViews = new Set(["calves", "shoulders", "arms"]);

  let index = 0;
  let timer = 0;
  let paused = false;
  let view = "front";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function srcFor(muscle, v) {
    return `${base}female-${v}-${muscle}-800w.webp`;
  }

  function apply(muscle) {
    if (!bothViews.has(muscle)) view = regionView[muscle] || "front";
    const href = srcFor(muscle, view);

    items.forEach((el) => {
      const on = el.dataset.muscle === muscle;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll(".muscle-view-btn").forEach((btn) => {
      const on = btn.dataset.miView === view;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });

    if (plate.getAttribute("src") !== href) plate.setAttribute("src", href);
    root.style.setProperty("--spot-color", `var(--muscle-${muscle})`);
    root.classList.add("is-highlighting");
    root.dataset.view = view;
    root.dataset.muscle = muscle;

    if (chip) {
      const active = items.find((el) => el.dataset.muscle === muscle);
      const name = active?.querySelector(".mi-demo__name")?.textContent?.trim();
      if (name) chip.textContent = name;
    }
  }

  function cycle() {
    if (paused || reduce) return;
    index = (index + 1) % items.length;
    apply(items[index].dataset.muscle);
  }

  function arm() {
    window.clearInterval(timer);
    if (!reduce) timer = window.setInterval(cycle, 3000);
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
      }, 8000);
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
      view = btn.dataset.miView === "back" ? "back" : "front";
      const order =
        view === "back"
          ? ["glutes", "hamstrings", "back", "calves", "shoulders", "arms"]
          : ["quads", "core", "calves", "shoulders", "arms"];
      const pick =
        order.map((m) => items.find((el) => el.dataset.muscle === m)).find(Boolean) || items[0];
      index = items.indexOf(pick);
      apply(pick.dataset.muscle);
      window.setTimeout(() => {
        paused = false;
        arm();
      }, 8000);
    });
  });

  // Preload all highlight frames
  ["front", "back"].forEach((v) => {
    const regions =
      v === "front"
        ? ["arms", "calves", "core", "quads", "shoulders"]
        : ["arms", "back", "calves", "glutes", "hamstrings", "shoulders"];
    regions.forEach((m) => {
      const img = new Image();
      img.decoding = "async";
      img.src = srcFor(m, v);
    });
  });

  index = Math.max(0, items.findIndex((el) => el.dataset.muscle === "quads"));
  apply(items[index].dataset.muscle);
  arm();
}

preserveHashOnLangSwitch();
closeNavOnEscape();
initMuscleDemo();
