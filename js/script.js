/* ==========================================================================
   TAPP African — interactions & animations
   Core interactions (menu, FAQ, carousels) always run; GSAP-powered
   animation flourishes are additive and degrade gracefully if GSAP
   fails to load.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const hasGSAP = typeof gsap !== "undefined";
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Mobile menu (always) ---------- */
  const burger = document.getElementById("burgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  burger.addEventListener("click", () => mobileMenu.classList.toggle("is-open"));
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => mobileMenu.classList.remove("is-open"))
  );

  /* ---------- Nav scroll state (always) ---------- */
  const nav = document.getElementById("siteNav");
  const updateNav = () => nav.classList.toggle("is-scrolled", window.scrollY > 60);
  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();

  /* ---------- Swatch color switcher (always) ---------- */
  const heroCard = document.getElementById("heroCard");
  document.querySelectorAll(".swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      document.querySelectorAll(".swatch").forEach((s) => s.classList.remove("is-active"));
      sw.classList.add("is-active");
      if (hasGSAP) {
        gsap.to(heroCard, { "--card-a": sw.dataset.a, "--card-b": sw.dataset.b, duration: 0.5 });
      } else {
        heroCard.style.setProperty("--card-a", sw.dataset.a);
        heroCard.style.setProperty("--card-b", sw.dataset.b);
      }
    });
  });

  /* ---------- Generic horizontal carousel (always) ---------- */
  function initCarousel(trackId, prevId, nextId) {
    const track = document.getElementById(trackId);
    const prev = document.getElementById(prevId);
    const next = document.getElementById(nextId);
    if (!track) return;
    const step = () => {
      const card = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).gap) || 22;
      return card ? card.getBoundingClientRect().width + gap : 300;
    };
    prev && prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next && next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  }
  initCarousel("designTrack", "designPrev", "designNext");
  initCarousel("testTrack", "testPrev", "testNext");

  /* ---------- FAQ accordion (always) ---------- */
  document.querySelectorAll(".faq-item__q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      const answer = item.querySelector(".faq-item__a");
      const isOpen = item.classList.contains("is-open");

      document.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          openItem.querySelector(".faq-item__a").style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove("is-open");
        answer.style.maxHeight = null;
      } else {
        item.classList.add("is-open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
  document.querySelectorAll(".faq-item.is-open .faq-item__a").forEach((a) => {
    a.style.maxHeight = a.scrollHeight + "px";
  });

  /* ==========================================================================
     Everything below is GSAP-powered polish — skipped entirely if the
     GSAP CDN failed to load, leaving the core site above fully usable.
     ========================================================================== */
  if (!hasGSAP) {
    if (window.__tappForceReveal) window.__tappForceReveal();
    return;
  }

  /* ---------- Preloader + hero intro ---------- */
  const preloader = document.getElementById("preloader");

  function playHeroIntro() {
    gsap.to(".hero__title .line span", { y: "0%", duration: 0.9, stagger: 0.12, ease: "power4.out" });
    gsap.fromTo(
      [".hero__sub", ".hero__cta", ".hero__note"],
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, delay: 0.3, ease: "power3.out" }
    );
    gsap.fromTo(
      "#heroCard",
      { opacity: 0, scale: 0.85, rotate: 6 },
      { opacity: 1, scale: 1, duration: 1, delay: 0.4, ease: "back.out(1.6)" }
    );
    gsap.fromTo(".hero__ship-note", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.9 });
  }

  if (document.readyState === "complete") {
    runPreloaderOut();
  } else {
    window.addEventListener("load", runPreloaderOut);
  }

  function runPreloaderOut() {
    if (!preloader) {
      playHeroIntro();
      return;
    }
    gsap
      .timeline({ defaults: { ease: "power3.inOut" }, onComplete: () => preloader.remove() })
      .to("#preloaderMark", { y: -30, opacity: 0, duration: 0.5, delay: 0.3 })
      .to(preloader, { yPercent: -100, duration: 0.7 }, "-=0.2")
      .call(playHeroIntro, [], "-=0.5");
  }

  /* ---------- Scroll progress bar ---------- */
  gsap.to("#progressBar", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.2 },
  });

  /* ---------- Hero card tilt on mousemove ---------- */
  const heroVisual = document.querySelector(".hero__visual");
  if (heroVisual && heroCard && matchMedia("(hover: hover)").matches) {
    heroVisual.addEventListener("mousemove", (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(heroCard, {
        rotateY: -10 + x * 22,
        rotateX: 8 - y * 22,
        rotate: -9 + x * 4,
        duration: 0.5,
        ease: "power2.out",
        overwrite: true,
      });
    });
    heroVisual.addEventListener("mouseleave", () => {
      gsap.to(heroCard, { rotateY: -10, rotateX: 0, rotate: -9, duration: 0.6, ease: "power3.out" });
    });
  }

  /* ---------- Scroll reveals ---------- */
  gsap.utils.toArray(".reveal").forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: (i % 4) * 0.08,
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  gsap.utils.toArray(".fan-card").forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 60,
      duration: 0.8,
      delay: i * 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".fan-wrap", start: "top 80%" },
    });
  });

  /* ---------- Stat counters ---------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = el.dataset.decimal ? 1 : 0;
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => {
            const v = decimals ? (obj.val / 10).toFixed(1) : Math.round(obj.val);
            el.textContent = v.toLocaleString();
          },
        });
      },
    });
  });

  /* ---------- Cursor dot (desktop only) ---------- */
  const cursorDot = document.getElementById("cursorDot");
  if (matchMedia("(hover: hover)").matches) {
    window.addEventListener("mousemove", (e) => {
      gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
    });
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => gsap.to(cursorDot, { scale: 2.4, duration: 0.25 }));
      el.addEventListener("mouseleave", () => gsap.to(cursorDot, { scale: 1, duration: 0.25 }));
    });
  } else if (cursorDot) {
    cursorDot.style.display = "none";
  }
});
