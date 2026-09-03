/* ==========================================================================
   TAPP African — Card page: interactive, drag-to-rotate 3D card
   A real Three.js mesh textured to look like the physical TAPP card.
   Drag to spin it (with inertia), it auto-idles when left alone, and
   the color swatches redraw the canvas texture live.
   Degrades gracefully: if Three.js fails to load, the stage keeps its
   CSS gradient background and the swatches still work via three-card's
   sibling logic in script.js (heroCard fallback), so nothing breaks.
   ========================================================================== */

(function () {
  if (typeof THREE === "undefined") return;

  const stage = document.querySelector(".card-viewer__stage");
  const canvas = document.getElementById("cardCanvas");
  if (!stage || !canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 6.2);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe3b0, 0.5);
  rim.position.set(-4, -2, 2);
  scene.add(rim);

  /* ---------- draw card face as a canvas texture ---------- */
  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawFace({ colorA, colorB, back }) {
    const W = 1024, H = 645;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");

    roundRectPath(ctx, 0, 0, W, H, 56);
    ctx.clip();
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, colorA);
    grad.addColorStop(1, colorB);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.beginPath();
    ctx.ellipse(W * 0.85, H * 0.1, 260, 260, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(20,16,13,0.12)";
    ctx.beginPath();
    ctx.ellipse(W * 0.1, H * 0.95, 200, 200, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!back) {
      roundRectPath(ctx, 70, 70, 92, 66, 12);
      const chipGrad = ctx.createLinearGradient(70, 70, 162, 136);
      chipGrad.addColorStop(0, "rgba(255,255,255,0.95)");
      chipGrad.addColorStop(1, "rgba(255,255,255,0.55)");
      ctx.fillStyle = chipGrad;
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(830, 90);
      ctx.bezierCurveTo(860, 60, 890, 60, 920, 90);
      ctx.moveTo(800, 110);
      ctx.bezierCurveTo(845, 65, 900, 65, 945, 110);
      ctx.globalAlpha = 0.6;
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = "#fff";
      ctx.font = "700 46px 'Unbounded', sans-serif";
      ctx.fillText("Amara Boateng", 70, H - 110);
      ctx.font = "500 30px 'Space Grotesk', sans-serif";
      ctx.globalAlpha = 0.85;
      ctx.fillText("Founder · Studio Kente", 70, H - 62);
      ctx.globalAlpha = 1;
    } else {
      roundRectPath(ctx, 70, 70, 92, 66, 12);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "600 34px 'Space Grotesk', sans-serif";
      ctx.fillText("tapp.africa/amara", 70, H - 80);
      ctx.font = "500 24px 'Space Grotesk', sans-serif";
      ctx.globalAlpha = 0.75;
      ctx.fillText("TAP TO CONNECT", 70, H - 42);
      ctx.globalAlpha = 1;
    }

    return new THREE.CanvasTexture(c);
  }

  /* ---------- build card mesh ---------- */
  const W = 3.4, H = 2.14, D = 0.06;
  const geometry = new THREE.BoxGeometry(W, H, D, 1, 1, 1);

  function edgeMaterial(colorA) {
    return new THREE.MeshStandardMaterial({ color: colorA, roughness: 0.6, metalness: 0.1 });
  }

  let colors = { a: "#e8622c", b: "#ff2e82" };

  function buildMaterials() {
    const edge = edgeMaterial(colors.a);
    const front = new THREE.MeshStandardMaterial({ map: drawFace({ colorA: colors.a, colorB: colors.b, back: false }), roughness: 0.45, metalness: 0.12 });
    const back = new THREE.MeshStandardMaterial({ map: drawFace({ colorA: colors.b, colorB: colors.a, back: true }), roughness: 0.45, metalness: 0.12 });
    return [edge, edge, edge, edge, front, back];
  }

  const card = new THREE.Mesh(geometry, buildMaterials());
  card.rotation.x = -0.15;
  card.rotation.y = 0.5;
  scene.add(card);

  function repaint(a, b) {
    colors = { a, b };
    card.material.forEach((m) => m.dispose());
    card.material = buildMaterials();
  }

  document.querySelectorAll(".card-viewer__swatches .swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      document.querySelectorAll(".card-viewer__swatches .swatch").forEach((s) => s.classList.remove("is-active"));
      sw.classList.add("is-active");
      repaint(sw.dataset.a, sw.dataset.b);
    });
  });

  /* ---------- sizing ---------- */
  function resize() {
    const rect = stage.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---------- drag to rotate, with inertia + idle spin ---------- */
  let dragging = false;
  let lastX = 0, lastY = 0;
  let velY = 0, velX = 0;
  let idleTimer = null;
  const IDLE_DELAY = 2200;

  function clearIdle() { if (idleTimer) clearTimeout(idleTimer); idleTimer = null; }
  function armIdle() {
    clearIdle();
    idleTimer = setTimeout(() => { idle = true; }, IDLE_DELAY);
  }
  let idle = true;
  armIdle();

  stage.addEventListener("pointerdown", (e) => {
    dragging = true;
    idle = false;
    clearIdle();
    lastX = e.clientX; lastY = e.clientY;
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    velY = dx * 0.006;
    velX = dy * 0.006;
    card.rotation.y += velY;
    card.rotation.x = Math.max(-0.9, Math.min(0.9, card.rotation.x + velX));
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    armIdle();
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointerleave", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  let raf;
  function tick() {
    if (!dragging) {
      if (idle) {
        card.rotation.y += 0.006;
        card.rotation.x += (-0.15 - card.rotation.x) * 0.02;
      } else {
        card.rotation.y += velY;
        card.rotation.x = Math.max(-0.9, Math.min(0.9, card.rotation.x + velX));
        velY *= 0.94;
        velX *= 0.94;
      }
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else tick();
  });

  if (window.gsap) {
    gsap.fromTo(canvas, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1, ease: "power3.out", delay: 0.2 });
  }
})();
