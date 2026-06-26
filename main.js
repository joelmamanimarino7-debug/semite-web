(function () {
  "use strict";

  const data    = window.__SEMITE__ || {};
  const $       = (sel, sc) => (sc || document).querySelector(sel);
  const $$      = (sel, sc) => Array.from((sc || document).querySelectorAll(sel));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ────────── NAV ────────── */
  function initNav() {
    const nav    = $(".nav");
    const toggle = $(".nav-toggle");
    const mobile = $(".nav-mobile");
    if (!nav) return;

    // Solidify on scroll
    const threshold = 60;
    function checkScroll() {
      if (window.scrollY > threshold) nav.classList.add("is-solid");
      else nav.classList.remove("is-solid");
    }
    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    // Mobile toggle
    if (toggle && mobile) {
      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        if (expanded) {
          mobile.hidden = true;
        } else {
          mobile.hidden = false;
        }
      });
      // Close on link click
      $$("a", mobile).forEach(a => {
        a.addEventListener("click", () => {
          mobile.hidden = true;
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* ────────── SMOOTH ANCHOR SCROLL ────────── */
  function initSmoothScroll() {
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      window.scrollTo({
        top: el.getBoundingClientRect().top + scrollY - 80,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ────────── REVEAL ON SCROLL ────────── */
  function initReveals() {
    const els = $$(".reveal");
    if (!els.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const delay = parseFloat(e.target.dataset.delay || 0);
        setTimeout(() => e.target.classList.add("is-visible"), delay * 1000);
        io.unobserve(e.target);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });

    // Stagger siblings inside the same parent
    const parents = new Set();
    els.forEach(el => { if (el.parentElement) parents.add(el.parentElement); });
    parents.forEach(parent => {
      const siblings = $$(".reveal", parent);
      if (siblings.length > 1) {
        siblings.forEach((el, i) => {
          if (!el.dataset.delay) el.dataset.delay = (i * 0.1).toFixed(1);
        });
      }
    });

    els.forEach(el => io.observe(el));

    // Safety: force-reveal anything still hidden after 6s
    setTimeout(() => {
      $$(".reveal:not(.is-visible)").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ────────── COUNT-UP ────────── */
  function initCountUp() {
    const nums = $$("[data-count-to]");
    if (!nums.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el     = e.target;
        const target = parseInt(el.dataset.countTo, 10);
        const suffix = el.textContent.replace(/[0-9]/g, "");
        const dur    = 1600;
        const start  = performance.now();
        io.unobserve(el);

        function step(now) {
          const progress = Math.min((now - start) / dur, 1);
          const eased    = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });

    nums.forEach(el => io.observe(el));
  }

  /* ────────── TILT ────────── */
  function initTilt() {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const cards = $$("[data-tilt]");
    const MAX   = 8;

    cards.forEach(card => {
      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const cx   = rect.width  / 2;
        const cy   = rect.height / 2;
        const dx   = (e.clientX - rect.left - cx) / cx;
        const dy   = (e.clientY - rect.top  - cy) / cy;
        card.style.transform = `perspective(800px) rotateY(${dx * MAX}deg) rotateX(${-dy * MAX}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform .4s cubic-bezier(0.16,1,0.3,1)";
        card.style.transform  = "";
        setTimeout(() => { card.style.transition = ""; }, 400);
      });
    });
  }

  /* ────────── FAQ ACCORDION ────────── */
  function initFAQ() {
    var list = document.querySelector("[data-faq]");
    if (!list) return;
    list.addEventListener("click", function(e) {
      var btn = e.target.closest(".faq-question");
      if (!btn) return;
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var answer   = btn.nextElementSibling;
      // Close all others
      list.querySelectorAll(".faq-question[aria-expanded='true']").forEach(function(b) {
        if (b !== btn) {
          b.setAttribute("aria-expanded", "false");
          b.nextElementSibling.hidden = true;
        }
      });
      btn.setAttribute("aria-expanded", String(!expanded));
      answer.hidden = expanded;
    });
  }

  /* ────────── PENSUM ACCORDION ────────── */
  function initPensum() {
    var wrap = document.querySelector("[data-pensum]");
    if (!wrap) return;
    wrap.addEventListener("click", function(e) {
      var btn = e.target.closest(".pensum-head");
      if (!btn) return;
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var body = btn.nextElementSibling;
      btn.setAttribute("aria-expanded", String(!expanded));
      body.hidden = expanded;
    });
  }

  /* ────────── FORM → WHATSAPP ────────── */
  function initForm() {
    var WA_NUMBER = "59162788381";
    var form = $(".contact-form");
    if (!form) return;

    form.addEventListener("submit", function(e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var nombre   = (form.querySelector("#f-nombre")   || {}).value || "";
      var email    = (form.querySelector("#f-email")    || {}).value || "";
      var telefono = (form.querySelector("#f-telefono") || {}).value || "";
      var mensaje  = (form.querySelector("#f-mensaje")  || {}).value || "";

      var lines = ["Hola, me interesa inscribirme al *SEMITE ADB*."];
      if (nombre)   lines.push("*Nombre:* " + nombre);
      if (email)    lines.push("*Correo:* " + email);
      if (telefono) lines.push("*Teléfono:* " + telefono);
      if (mensaje)  lines.push("*Mensaje:* " + mensaje);

      var text = encodeURIComponent(lines.join("\n"));
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + text, "_blank", "noopener,noreferrer");
    });
  }

  /* ────────── GSAP HERO PARALLAX ────────── */
  function initHeroParallax() {
    if (!window.gsap || !window.ScrollTrigger || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const heroBg = $(".hero-bg-img");
    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }
  }

  /* ────────── BOOT ────────── */
  function boot() {
    safe(initNav,         "initNav");
    safe(initSmoothScroll,"initSmoothScroll");
    safe(initReveals,     "initReveals");
    safe(initCountUp,     "initCountUp");
    safe(initTilt,        "initTilt");
    safe(initFAQ,         "initFAQ");
    safe(initPensum,      "initPensum");
    safe(initForm,        "initForm");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initHeroParallax,   "initHeroParallax");
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
