/* ==========================================================================
   TAPP African — Card page: live "tap" demo
   Click the card (or the button): it travels to the phone, an NFC-style
   ripple fires from the contact point, the phone buzzes, and the lock
   screen gives way to a populated profile — the actual product moment,
   dramatized. Falls back to an instant, un-animated toggle if GSAP isn't
   available, so the demo still works either way.
   ========================================================================== */

(function () {
  const card = document.getElementById("demoCard");
  const btn = document.getElementById("tapDemoBtn");
  const phone = document.querySelector(".tap-demo__phone");
  const lock = document.getElementById("demoLock");
  const profile = document.getElementById("demoProfile");
  const avatar = document.getElementById("demoAvatar");
  const saved = document.getElementById("demoSaved");
  const contact = document.getElementById("demoContact");
  const rings = contact ? Array.from(contact.querySelectorAll(".tap-demo__ring")) : [];
  const nameEl = document.getElementById("demoName");
  const roleEl = document.getElementById("demoRole");
  const linkPills = profile ? Array.from(profile.querySelectorAll(".tap-demo__links a")) : [];

  if (!card || !btn || !phone || !lock || !profile) return;

  const hasGSAP = typeof gsap !== "undefined";

  if (!hasGSAP) {
    /* ---------- no-animation fallback: instant toggle, still functional ---------- */
    function toggleSimple() {
      const showing = profile.classList.toggle("is-shown");
      lock.style.opacity = showing ? "0" : "1";
      profile.style.opacity = showing ? "1" : "0";
      if (saved) saved.style.opacity = showing ? "1" : "0";
    }
    card.addEventListener("click", toggleSimple);
    btn.addEventListener("click", toggleSimple);
    return;
  }

  const BASE_ROTATE = -6;
  gsap.set(card, { rotate: BASE_ROTATE, transformOrigin: "center center" });

  let playing = false;

  function resetState() {
    gsap.killTweensOf([card, phone, lock, avatar, saved, nameEl, roleEl, ...linkPills, ...rings]);
    gsap.set(card, { x: 0, y: 0, rotate: BASE_ROTATE });
    gsap.set(phone, { x: 0 });
    gsap.set(lock, { opacity: 1, y: 0 });
    gsap.set(profile, { opacity: 0 });
    gsap.set(avatar, { scale: 0 });
    gsap.set([nameEl, roleEl], { opacity: 0, y: 12 });
    gsap.set(linkPills, { opacity: 0, y: 10 });
    gsap.set(saved, { opacity: 0, scale: 0.6 });
    gsap.set(rings, { scale: 0, opacity: 0 });
  }

  function burstRings() {
    rings.forEach((ring, i) => {
      gsap.fromTo(
        ring,
        { scale: 0, opacity: 0.85 },
        { scale: 3.2 + i * 0.7, opacity: 0, duration: 0.9, delay: i * 0.15, ease: "power2.out" }
      );
    });
  }

  function playDemo() {
    if (playing) return;
    playing = true;
    resetState();

    const cardRect = card.getBoundingClientRect();
    const targetRect = contact.getBoundingClientRect();
    const dx = targetRect.left + targetRect.width / 2 - (cardRect.left + cardRect.width / 2);
    const dy = targetRect.top + targetRect.height / 2 - (cardRect.top + cardRect.height / 2);

    const tl = gsap.timeline({ onComplete: () => { playing = false; } });

    tl.to(card, { x: dx, y: dy, rotate: -2, duration: 0.55, ease: "power2.inOut" })
      .call(burstRings, [], "-=0.05")
      .to(phone, { x: "+=3", duration: 0.045, repeat: 7, yoyo: true, ease: "power1.inOut" }, "<")
      .to(lock, { opacity: 0, y: -14, duration: 0.3, ease: "power2.in" }, "+=0.15")
      .to(profile, { opacity: 1, duration: 0.01 }, "<")
      .fromTo(avatar, { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2.2)" }, "-=0.05")
      .fromTo([nameEl, roleEl], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, "-=0.25")
      .fromTo(linkPills, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.07 }, "-=0.2")
      .fromTo(saved, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.4)" }, "-=0.1")
      .to(card, { x: 0, y: 0, rotate: BASE_ROTATE, duration: 0.6, ease: "power2.inOut" }, "+=0.6");
  }

  card.addEventListener("click", playDemo);
  btn.addEventListener("click", playDemo);
})();
