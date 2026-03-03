import { animate, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@11.13.1/+esm";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function runPageIntro() {
  if (reducedMotion) return;

  animate("body", { opacity: [0, 1] }, { duration: 0.45, easing: "ease-out" });

  const heroTargets = Array.from(document.querySelectorAll(".page > *")).slice(0, 6);
  if (heroTargets.length > 0) {
    animate(
      heroTargets,
      { opacity: [0, 1], transform: ["translateY(18px)", "translateY(0px)"] },
      { duration: 0.55, delay: stagger(0.06), easing: "ease-out" }
    );
  }
}

function wireRevealOnScroll() {
  if (reducedMotion) return;

  const selectors = [
    ".card",
    ".book-card",
    ".media-card",
    ".quote-card",
    ".article-card",
    ".gallery-item",
    "section",
    "article",
    "figure",
    ".page > div",
    ".page > p"
  ];

  const seen = new Set();
  const targets = document.querySelectorAll(selectors.join(","));

  targets.forEach((el) => {
    if (seen.has(el)) return;
    seen.add(el);
    if (el.dataset.motionReady === "1") return;
    el.dataset.motionReady = "1";
    el.style.opacity = "0";
    el.style.transform = "translateY(22px)";

    inView(
      el,
      () => {
        if (el.dataset.motionDone === "1") return;
        el.dataset.motionDone = "1";
        animate(
          el,
          { opacity: [0, 1], transform: ["translateY(22px)", "translateY(0px)"] },
          { duration: 0.6, easing: "ease-out" }
        );
      },
      { margin: "0px 0px -12% 0px" }
    );
  });
}

function wireLinkTension() {
  if (reducedMotion) return;
  const links = document.querySelectorAll(".page a");
  links.forEach((link) => {
    if (link.dataset.motionLink === "1") return;
    link.dataset.motionLink = "1";

    link.addEventListener("mouseenter", () => {
      animate(
        link,
        { transform: ["translateY(0px)", "translateY(-2px)"], opacity: [1, 0.9, 1] },
        { duration: 0.25, easing: "ease-out" }
      );
    });
  });
}

function initMotion() {
  runPageIntro();
  wireRevealOnScroll();
  wireLinkTension();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMotion, { once: true });
} else {
  initMotion();
}

document.addEventListener("spa:navigated", initMotion);
