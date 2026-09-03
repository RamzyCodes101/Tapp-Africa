/* ==========================================================================
   TAPP African — Home hero: ambient Three.js "network" background
   A field of nodes connected by faint lines, drifting slowly, tilting
   toward the mouse — a quiet visual echo of "networking".
   Fully optional: if Three.js fails to load, the canvas just stays empty
   and the CSS gradient/blobs behind it carry the hero on their own.
   ========================================================================== */

(function () {
  if (typeof THREE === "undefined") return;

  const canvas = document.getElementById("heroCanvas");
  const hero = document.querySelector(".hero");
  if (!canvas || !hero) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 14;

  const group = new THREE.Group();
  scene.add(group);

  /* ---- circular sprite texture for nicer points ---- */
  function makeDotTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(20,16,13,0.9)");
    g.addColorStop(1, "rgba(20,16,13,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  /* ---- nodes ---- */
  const COUNT = 130;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 13;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const pointsMat = new THREE.PointsMaterial({
    size: 0.22,
    map: makeDotTexture(),
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });
  const points = new THREE.Points(pointsGeo, pointsMat);
  group.add(points);

  /* ---- connecting lines between nearby nodes ---- */
  const linePositions = [];
  const MAX_DIST = 4.2;
  for (let i = 0; i < COUNT; i++) {
    for (let j = i + 1; j < COUNT; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < MAX_DIST) {
        linePositions.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
        );
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x14100d, transparent: true, opacity: 0.1 });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lines);

  /* ---- sizing ---- */
  function resize() {
    const rect = hero.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---- mouse parallax ---- */
  let targetRotX = 0, targetRotY = 0;
  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    targetRotY = x * 0.35;
    targetRotX = y * 0.2;
  });

  /* ---- render loop ---- */
  let raf;
  function tick() {
    group.rotation.y += (targetRotY - group.rotation.y) * 0.03 + 0.0009;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.03;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  /* ---- fade out on scroll past hero (GSAP optional) ---- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.to(canvas, {
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.3 },
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else tick();
  });
})();
