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

  function fitFont(ctx, text, weight, family, maxSize, maxWidth) {
    let size = maxSize;
    ctx.font = `${weight} ${size}px '${family}', sans-serif`;
    while (size > 18 && ctx.measureText(text).width > maxWidth) {
      size -= 2;
      ctx.font = `${weight} ${size}px '${family}', sans-serif`;
    }
    return size;
  }

  function handleFromName(name) {
    const slug = (name || "you").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 16);
    return "tapp.africa/" + (slug || "you");
  }

  function getQRCanvas(text, size) {
    if (typeof QRCode === "undefined") return null;
    const holder = document.createElement("div");
    new QRCode(holder, { text, width: size, height: size, colorDark: "#14100d", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
    return holder.querySelector("canvas");
  }

  function drawFace({ colorA, colorB, back, name, role }) {
    const W = 1024, H = 645;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    const safeName = (name || "Your Name").trim() || "Your Name";
    const safeRole = (role || "").trim();

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
      const nameSize = fitFont(ctx, safeName, 700, "Unbounded", 46, W - 140);
      ctx.font = `700 ${nameSize}px 'Unbounded', sans-serif`;
      ctx.fillText(safeName, 70, H - 110);
      if (safeRole) {
        const roleSize = fitFont(ctx, safeRole, 500, "Space Grotesk", 30, W - 140);
        ctx.font = `500 ${roleSize}px 'Space Grotesk', sans-serif`;
        ctx.globalAlpha = 0.85;
        ctx.fillText(safeRole, 70, H - 62);
        ctx.globalAlpha = 1;
      }
    } else {
      roundRectPath(ctx, 70, 70, 92, 66, 12);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fill();

      const handle = handleFromName(safeName);
      const qrCanvas = getQRCanvas("https://" + handle, 260);
      if (qrCanvas) {
        const qrSize = 130, pad = 14, qrX = W - 70 - qrSize, qrY = 70;
        roundRectPath(ctx, qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2, 14);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
      }

      ctx.fillStyle = "#fff";
      const handleSize = fitFont(ctx, handle, 600, "Space Grotesk", 34, W - 140);
      ctx.font = `600 ${handleSize}px 'Space Grotesk', sans-serif`;
      ctx.fillText(handle, 70, H - 80);
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

  const nameInput = document.getElementById("customName");
  const roleInput = document.getElementById("customRole");

  function readSaved(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  let colors = {
    a: readSaved("tapp_custom_color_a", "#e8622c"),
    b: readSaved("tapp_custom_color_b", "#ff2e82"),
  };
  let profile = {
    name: readSaved("tapp_custom_name", nameInput ? nameInput.value : "Amara Boateng"),
    role: readSaved("tapp_custom_role", roleInput ? roleInput.value : "Founder · Studio Kente"),
  };
  if (nameInput) nameInput.value = profile.name;
  if (roleInput) roleInput.value = profile.role;

  function persist() {
    try {
      localStorage.setItem("tapp_custom_name", profile.name);
      localStorage.setItem("tapp_custom_role", profile.role);
      localStorage.setItem("tapp_custom_color_a", colors.a);
      localStorage.setItem("tapp_custom_color_b", colors.b);
    } catch (e) {
      /* private browsing or storage disabled — customization just won't persist */
    }
  }

  function buildMaterials() {
    const edge = edgeMaterial(colors.a);
    const front = new THREE.MeshStandardMaterial({ map: drawFace({ colorA: colors.a, colorB: colors.b, back: false, name: profile.name, role: profile.role }), roughness: 0.45, metalness: 0.12 });
    const back = new THREE.MeshStandardMaterial({ map: drawFace({ colorA: colors.b, colorB: colors.a, back: true, name: profile.name, role: profile.role }), roughness: 0.45, metalness: 0.12 });
    return [edge, edge, edge, edge, front, back];
  }

  const card = new THREE.Mesh(geometry, buildMaterials());
  card.rotation.x = -0.15;
  card.rotation.y = 0.5;
  scene.add(card);

  function repaintMaterials() {
    card.material.forEach((m) => m.dispose());
    card.material = buildMaterials();
    persist();
  }

  function setColors(a, b) {
    colors = { a, b };
    repaintMaterials();
  }

  function setProfile(name, role) {
    profile = { name, role };
    repaintMaterials();
  }

  const swatchEls = document.querySelectorAll(".card-viewer__swatches .swatch");
  swatchEls.forEach((sw) => {
    if (sw.dataset.a === colors.a && sw.dataset.b === colors.b) {
      swatchEls.forEach((s) => s.classList.remove("is-active"));
      sw.classList.add("is-active");
    }
    sw.addEventListener("click", () => {
      swatchEls.forEach((s) => s.classList.remove("is-active"));
      sw.classList.add("is-active");
      setColors(sw.dataset.a, sw.dataset.b);
    });
  });

  if (nameInput) {
    nameInput.addEventListener("input", () => setProfile(nameInput.value, roleInput ? roleInput.value : profile.role));
  }
  if (roleInput) {
    roleInput.addEventListener("input", () => setProfile(nameInput ? nameInput.value : profile.name, roleInput.value));
  }

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
