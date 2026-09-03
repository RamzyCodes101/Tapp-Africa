/* ==========================================================================
   TAPP African — Home "connects" integrations cloud
   Draws connector lines from each app chip to the central TAPP hub (using
   live getBoundingClientRect math so it holds up across breakpoints), then
   plays a scroll-triggered entrance: hub pops in, chips fly in from further
   out in their own direction, lines fade in once they land. Chips idle-float
   via CSS regardless of JS. On mobile the whole cloud becomes a plain
   scrollable chip row (see the media query in style.css) and this script
   simply no-ops the line/entrance logic for that layout.
   ========================================================================== */

(function () {
  const cloud = document.getElementById("connectsCloud");
  const hub = cloud ? cloud.querySelector(".connects__hub") : null;
  const lineLayer = document.getElementById("connectsLines");
  const chips = cloud ? Array.from(cloud.querySelectorAll(".connect-chip")) : [];

  if (!cloud || !hub || !lineLayer || !chips.length) return;

  function isCloudLayout() {
    return window.matchMedia("(min-width: 769px)").matches;
  }

  function buildLines() {
    lineLayer.innerHTML = "";
    if (!isCloudLayout()) return;

    const cloudRect = cloud.getBoundingClientRect();
    const hubRect = hub.getBoundingClientRect();
    const hubCenter = {
      x: hubRect.left + hubRect.width / 2 - cloudRect.left,
      y: hubRect.top + hubRect.height / 2 - cloudRect.top,
    };

    chips.forEach((chip) => {
      const r = chip.getBoundingClientRect();
      const chipCenter = {
        x: r.left + r.width / 2 - cloudRect.left,
        y: r.top + r.height / 2 - cloudRect.top,
      };
      const dx = hubCenter.x - chipCenter.x;
      const dy = hubCenter.y - chipCenter.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      const line = document.createElement("div");
      line.className = "connects__line";
      line.style.left = chipCenter.x + "px";
      line.style.top = chipCenter.y + "px";
      line.style.width = dist + "px";
      line.style.transform = `rotate(${angle}deg)`;
      lineLayer.appendChild(line);
    });
  }

  buildLines();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildLines, 150);
  });

  const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (!hasGSAP || !isCloudLayout()) return;

  ScrollTrigger.create({
    trigger: cloud,
    start: "top 78%",
    once: true,
    onEnter: () => {
      gsap.set(lineLayer, { opacity: 0 });
      gsap.from(hub, { scale: 0, opacity: 0, duration: 0.6, ease: "back.out(2)" });
      gsap.from(chips, {
        opacity: 0,
        scale: 0.4,
        x: (i, el) => (parseFloat(el.style.getPropertyValue("--tx")) - 50) * 2,
        y: (i, el) => (parseFloat(el.style.getPropertyValue("--ty")) - 50) * 2,
        duration: 0.7,
        stagger: 0.08,
        delay: 0.2,
        ease: "back.out(1.6)",
        onComplete: () => {
          buildLines();
          gsap.to(lineLayer, { opacity: 1, duration: 0.6 });
        },
      });
    },
  });
})();
