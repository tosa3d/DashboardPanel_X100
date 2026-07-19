const GAMING_HERO_FEATURES = [
  {
    id: "stable",
    title: "حفظ کیفیت کانکشن",
    subtitle: "در تمامی شرایط کشور",
    asset: "Contant/sh.png",
    active: true
  },
  {
    id: "ping",
    title: "کاهش پینگ",
    subtitle: "در بازی‌های آنلاین",
    asset: "Contant/s.png"
  },
  {
    id: "quality",
    title: "افزایش کیفیت کانکشن",
    subtitle: "در بازی‌های آنلاین",
    asset: "Contant/k.png"
  },
  {
    id: "download",
    title: "دانلود و آپدیت از سرورهای اختصاصی",
    subtitle: "با بالاترین سرعت",
    asset: "Contant/m.png"
  }
];

function createHeroFeatureCard(feature, index) {
  const card = document.createElement("article");
  card.className = `gaming-hero__feature-card gaming-hero__feature-card--${feature.id}`;
  if (feature.active) card.classList.add("gaming-hero__feature-card--active");
  card.tabIndex = 0;
  card.style.setProperty("--feature-delay", `${180 + index * 90}ms`);

  const icon = document.createElement("div");
  icon.className = "gaming-hero__feature-icon";
  icon.setAttribute("aria-hidden", "true");
  const iconImage = document.createElement("img");
  iconImage.src = feature.asset;
  iconImage.alt = "";
  iconImage.decoding = "async";
  icon.append(iconImage);

  const title = document.createElement("h3");
  title.textContent = feature.title;

  const subtitle = document.createElement("p");
  subtitle.textContent = feature.subtitle;

  const plus = document.createElement("button");
  plus.type = "button";
  plus.className = "gaming-hero__feature-plus";
  plus.setAttribute("aria-label", `جزئیات بیشتر درباره ${feature.title}`);
  plus.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';

  card.append(icon, title, subtitle, plus);
  return card;
}

function initGamingHeroBackground(root) {
  const particleLayer = root.querySelector("[data-hero-particles]");
  if (!particleLayer) return;

  const fragment = document.createDocumentFragment();
  const colors = ["#26bbff", "#72d3ff", "#00daf8", "#e4e1e6", "#3b82f6"];

  for (let index = 0; index < 46; index += 1) {
    const particle = document.createElement("i");
    particle.className = "gaming-hero__particle";
    particle.style.left = `${3 + Math.random() * 94}%`;
    particle.style.top = `${2 + Math.random() * 76}%`;
    particle.style.setProperty("--particle-size", `${(0.8 + Math.random() * 1.8).toFixed(2)}px`);
    particle.style.setProperty("--particle-opacity", (0.2 + Math.random() * 0.55).toFixed(2));
    particle.style.setProperty("--particle-duration", `${(3.4 + Math.random() * 4.8).toFixed(2)}s`);
    particle.style.setProperty("--particle-delay", `${(-Math.random() * 4).toFixed(2)}s`);
    particle.style.setProperty("--particle-color", colors[index % colors.length]);
    fragment.append(particle);
  }

  particleLayer.append(fragment);
}

class MouseParallaxScene {
  constructor(root, cards) {
    this.root = root;
    this.cards = cards;
    this.abortController = new AbortController();
    this.signal = this.abortController.signal;
    this.frameId = 0;
    this.isPointerInside = false;
    this.rect = null;
    this.state = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      rotateX: 0,
      rotateY: 0,
      hoverRotateX: 0,
      hoverRotateY: 0
    };
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.finePointer = window.matchMedia("(pointer: fine)");
    this.desktopLayout = window.matchMedia("(min-width: 761px)");
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerEnter = this.handlePointerEnter.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);
    this.render = this.render.bind(this);
    this.updateMode = this.updateMode.bind(this);
    this.bindEvents();
    this.updateMode();
  }

  get enabled() {
    return !this.reduceMotion.matches && this.finePointer.matches && this.desktopLayout.matches;
  }

  bindEvents() {
    const options = { signal: this.signal };
    this.root.addEventListener("pointerenter", this.handlePointerEnter, options);
    this.root.addEventListener("pointermove", this.handlePointerMove, options);
    this.root.addEventListener("pointerleave", this.handlePointerLeave, options);
    this.root.addEventListener("pointerover", (event) => this.handleCardEnter(event), options);
    this.root.addEventListener("pointerout", (event) => this.handleCardLeave(event), options);
    this.root.addEventListener("focusin", (event) => this.handleCardEnter(event), options);
    this.root.addEventListener("focusout", (event) => this.handleCardLeave(event), options);
    this.reduceMotion.addEventListener("change", this.updateMode, options);
    this.finePointer.addEventListener("change", this.updateMode, options);
    this.desktopLayout.addEventListener("change", this.updateMode, options);

    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.isPointerInside) this.rect = this.root.getBoundingClientRect();
      });
      this.resizeObserver.observe(this.root);
    }
  }

  updateMode() {
    if (this.enabled) return;
    this.isPointerInside = false;
    this.root.classList.remove("is-tracking", "is-card-hovered");
    this.cards.forEach((card) => card.classList.remove("is-hovered"));
    this.state.targetX = 0;
    this.state.targetY = 0;
    this.state.hoverRotateX = 0;
    this.state.hoverRotateY = 0;
    this.scheduleRender();
  }

  handlePointerEnter() {
    if (!this.enabled) return;
    this.isPointerInside = true;
    this.rect = this.root.getBoundingClientRect();
    this.root.classList.add("is-tracking");
    this.scheduleRender();
  }

  handlePointerMove(event) {
    if (!this.enabled || !this.rect) return;
    const normalizedX = ((event.clientX - this.rect.left) / this.rect.width) * 2 - 1;
    const normalizedY = ((event.clientY - this.rect.top) / this.rect.height) * 2 - 1;
    this.state.targetX = Math.max(-1, Math.min(1, normalizedX));
    this.state.targetY = Math.max(-1, Math.min(1, normalizedY));
    this.scheduleRender();
  }

  handlePointerLeave() {
    this.isPointerInside = false;
    this.root.classList.remove("is-tracking");
    this.state.targetX = 0;
    this.state.targetY = 0;
    this.scheduleRender();
  }

  handleCardEnter(event) {
    const card = event.target.closest(".gaming-feature");
    if (!card || !this.root.contains(card)) return;
    if (event.relatedTarget && card.contains(event.relatedTarget)) return;

    this.cards.forEach((item) => item.classList.toggle("is-hovered", item === card));
    this.root.classList.add("is-card-hovered");
    if (this.enabled) {
      this.state.hoverRotateX = Number(card.dataset.hoverRotateX || 0);
      this.state.hoverRotateY = Number(card.dataset.hoverRotateY || 0);
      this.scheduleRender();
    }
  }

  handleCardLeave(event) {
    const card = event.target.closest(".gaming-feature");
    if (!card || !this.root.contains(card)) return;
    if (event.relatedTarget && card.contains(event.relatedTarget)) return;
    if (card.matches(":focus-within") && event.type === "pointerout") return;

    card.classList.remove("is-hovered");
    if (!this.cards.some((item) => item.classList.contains("is-hovered"))) {
      this.root.classList.remove("is-card-hovered");
      this.state.hoverRotateX = 0;
      this.state.hoverRotateY = 0;
      this.scheduleRender();
    }
  }

  scheduleRender() {
    if (!this.frameId) this.frameId = window.requestAnimationFrame(this.render);
  }

  render() {
    this.frameId = 0;
    const lerpAmount = 0.085;
    const state = this.state;
    state.x += (state.targetX - state.x) * lerpAmount;
    state.y += (state.targetY - state.y) * lerpAmount;

    const targetRotateX = Math.max(-3.6, Math.min(3.6, -state.targetY * 3.2 + state.hoverRotateX));
    const targetRotateY = Math.max(-5, Math.min(5, state.targetX * 4.5 + state.hoverRotateY));
    state.rotateX += (targetRotateX - state.rotateX) * lerpAmount;
    state.rotateY += (targetRotateY - state.rotateY) * lerpAmount;

    this.root.style.setProperty("--hero-rotate-x", `${state.rotateX.toFixed(3)}deg`);
    this.root.style.setProperty("--hero-rotate-y", `${state.rotateY.toFixed(3)}deg`);
    this.root.style.setProperty("--hero-bg-x", `${(state.x * 14).toFixed(2)}px`);
    this.root.style.setProperty("--hero-bg-y", `${(state.y * 10).toFixed(2)}px`);
    this.root.style.setProperty("--hero-bg-rotate-x", `${(-state.y * 1.5).toFixed(3)}deg`);
    this.root.style.setProperty("--hero-bg-rotate-y", `${(state.x * 2.2).toFixed(3)}deg`);
    this.root.style.setProperty("--hero-center-x", `${(state.x * 7).toFixed(2)}px`);
    this.root.style.setProperty("--hero-center-y", `${(state.y * 5).toFixed(2)}px`);
    this.root.style.setProperty("--hero-copy-x", `${(-state.x * 3).toFixed(2)}px`);
    this.root.style.setProperty("--hero-copy-y", `${(-state.y * 2).toFixed(2)}px`);
    this.root.style.setProperty("--hero-actions-x", `${(state.x * 5.5).toFixed(2)}px`);
    this.root.style.setProperty("--hero-actions-y", `${(state.y * 4.5).toFixed(2)}px`);
    this.root.style.setProperty("--hero-fg-x", `${(state.x * 34).toFixed(2)}px`);
    this.root.style.setProperty("--hero-fg-y", `${(state.y * 13).toFixed(2)}px`);

    this.cards.forEach((card) => {
      const movement = Number(card.dataset.movement || 12);
      card.style.setProperty("--card-parallax-x", `${(-state.x * movement).toFixed(2)}px`);
      card.style.setProperty("--card-parallax-y", `${(-state.y * movement * 0.68).toFixed(2)}px`);
    });

    const stillMoving =
      Math.abs(state.targetX - state.x) > 0.002 ||
      Math.abs(state.targetY - state.y) > 0.002 ||
      Math.abs(targetRotateX - state.rotateX) > 0.002 ||
      Math.abs(targetRotateY - state.rotateY) > 0.002;

    if (stillMoving) this.scheduleRender();
  }

  destroy() {
    this.abortController.abort();
    this.resizeObserver?.disconnect();
    if (this.frameId) window.cancelAnimationFrame(this.frameId);
  }
}

function initGamingHero() {
  const root = document.querySelector("[data-gaming-hero]");
  if (!root) return;

  const featuresContainer = document.querySelector("[data-hero-features]");
  const cards = GAMING_HERO_FEATURES.map((feature, index) => createHeroFeatureCard(feature, index));
  featuresContainer?.append(...cards);
  initGamingHeroBackground(root);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let entranceTimer = 0;
  let entranceObserver = null;

  const revealHero = () => {
    root.classList.add("is-ready");
    entranceTimer = window.setTimeout(() => root.classList.add("is-interactive"), reduceMotion ? 0 : 1250);
  };

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealHero();
  } else {
    entranceObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      revealHero();
      observer.disconnect();
    }, { threshold: 0.12 });
    entranceObserver.observe(root);
  }

  const parallaxScene = new MouseParallaxScene(root, []);
  window.addEventListener("pagehide", () => {
    window.clearTimeout(entranceTimer);
    entranceObserver?.disconnect();
    parallaxScene.destroy();
  }, { once: true });
}

document.addEventListener("DOMContentLoaded", initGamingHero);
