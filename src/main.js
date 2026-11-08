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

preserveHashOnLangSwitch();
closeNavOnEscape();
