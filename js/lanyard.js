/* ==========================================================================
   TAPP African — Card page: draggable, swinging lanyard badge
   Idles with a gentle pendulum sway; grab and drag to swing it, release
   and it springs back with an elastic ease. Pure enhancement — if GSAP
   isn't available the badge just sits still, which still looks fine.
   ========================================================================== */

(function () {
  const hang = document.querySelector(".lanyard-hang");
  if (!hang || !window.gsap) return;

  let idleTween;
  function startIdle() {
    idleTween = gsap.to(hang, { rotate: 5, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
  }
  gsap.set(hang, { rotate: -5, transformOrigin: "top center" });
  startIdle();

  let dragging = false;
  let startX = 0;
  let startRotate = 0;

  hang.addEventListener("pointerdown", (e) => {
    dragging = true;
    if (idleTween) idleTween.kill();
    gsap.killTweensOf(hang);
    startX = e.clientX;
    startRotate = gsap.getProperty(hang, "rotate");
    hang.setPointerCapture(e.pointerId);
  });

  hang.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const delta = e.clientX - startX;
    const rot = Math.max(-45, Math.min(45, startRotate + delta * 0.4));
    gsap.set(hang, { rotate: rot });
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    gsap.to(hang, {
      rotate: 0,
      duration: 1.1,
      ease: "elastic.out(1, 0.35)",
      onComplete: () => {
        gsap.set(hang, { rotate: -5 });
        startIdle();
      },
    });
  }

  hang.addEventListener("pointerup", endDrag);
  hang.addEventListener("pointerleave", endDrag);
  hang.addEventListener("pointercancel", endDrag);
})();
