/* ==========================================================================
   TAPP African — Story page: morphing Three.js particle scrollytelling
   One particle system reshapes itself through six formations as the
   reader scrolls past six psychology beats. Fully optional: if Three.js
   or GSAP/ScrollTrigger fail to load, the CSS fallback gradient behind
   the canvas carries the section and the text panels still fade in via
   plain CSS (see .story-panel.is-active in style.css).
   ========================================================================== */

(function () {
  if (typeof THREE === "undefined" || !window.gsap || !window.ScrollTrigger) return;

  const canvas = document.getElementById("storyCanvas");
  const stage = document.querySelector(".story-visual");
  const panels = document.querySelectorAll(".story-panel");
  if (!canvas || !stage || !panels.length) return;

  gsap.registerPlugin(ScrollTrigger);

  const N = 1400;

  /* ---------- shape generators (each returns a Float32Array of N*3) ---------- */
  function rand(a, b) { return a + Math.random() * (b - a); }

  function randSpherePoint(radius) {
    let x, y, z, d;
    do {
      x = rand(-1, 1); y = rand(-1, 1); z = rand(-1, 1);
      d = x * x + y * y + z * z;
    } while (d > 1 || d === 0);
    const scale = radius * Math.cbrt(Math.random());
    const len = Math.sqrt(d);
    return [(x / len) * scale, (y / len) * scale, (z / len) * scale];
  }

  function cardOutlinePoint(t, w, h) {
    const perim = 2 * (w + h);
    let d = ((t % 1) + 1) % 1 * perim;
    if (d < w) return [-w / 2 + d, h / 2];
    d -= w;
    if (d < h) return [w / 2, h / 2 - d];
    d -= h;
    if (d < w) return [w / 2 - d, -h / 2];
    d -= w;
    return [-w / 2, -h / 2 + d];
  }

  function shapeChaos() {
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      arr[i * 3] = rand(-7, 7);
      arr[i * 3 + 1] = rand(-4, 4);
      arr[i * 3 + 2] = rand(-4, 3);
    }
    return arr;
  }

  function shapeCardBreak() {
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const [bx, by] = cardOutlinePoint(i / N, 6, 3.6);
      arr[i * 3] = bx + rand(-2.2, 2.2);
      arr[i * 3 + 1] = by - rand(0.3, 2.6);
      arr[i * 3 + 2] = rand(-2, 2);
    }
    return arr;
  }

  function shapeHandshake() {
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      if (i % 7 === 0) {
        const t = Math.random();
        arr[i * 3] = -3 + t * 6 + rand(-0.3, 0.3);
        arr[i * 3 + 1] = rand(-0.3, 0.3);
        arr[i * 3 + 2] = rand(-0.3, 0.3);
      } else {
        const cx = i % 2 === 0 ? -3 : 3;
        const [x, y, z] = randSpherePoint(1.7);
        arr[i * 3] = cx + x;
        arr[i * 3 + 1] = y;
        arr[i * 3 + 2] = z;
      }
    }
    return arr;
  }

  function shapeRipple() {
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const ring = i % 6;
      const radius = (ring + 1) * 0.85;
      const angle = rand(0, Math.PI * 2);
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = rand(-0.5, 0.5);
      arr[i * 3 + 2] = Math.sin(angle) * radius * 0.6;
    }
    return arr;
  }

  function shapeGatherGlow() {
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const [x, y, z] = randSpherePoint(1.15);
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }

  function shapeCardFinal() {
    const arr = new Float32Array(N * 3);
    const outlineCount = Math.floor(N * 0.55);
    for (let i = 0; i < N; i++) {
      if (i < outlineCount) {
        const [bx, by] = cardOutlinePoint(i / outlineCount, 6, 3.6);
        arr[i * 3] = bx;
        arr[i * 3 + 1] = by;
        arr[i * 3 + 2] = rand(-0.15, 0.15);
      } else {
        arr[i * 3] = rand(-2.9, 2.9);
        arr[i * 3 + 1] = rand(-1.7, 1.7);
        arr[i * 3 + 2] = rand(-0.15, 0.15);
      }
    }
    return arr;
  }

  const scenes = [
    { shape: shapeChaos, color: 0xd9d2c8 },
    { shape: shapeCardBreak, color: 0xff2e82 },
    { shape: shapeHandshake, color: 0x35dde0 },
    { shape: shapeRipple, color: 0xffd53d },
    { shape: shapeGatherGlow, color: 0xe8622c },
    { shape: shapeCardFinal, color: 0xffffff },
  ];

  /* ---------- three.js setup ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.z = 11;

  const group = new THREE.Group();
  scene.add(group);

  function makeDotTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  let current = scenes[0].shape();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(current.slice(), 3));
  const material = new THREE.PointsMaterial({
    size: 0.09,
    map: makeDotTexture(),
    color: scenes[0].color,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pointCloud = new THREE.Points(geometry, material);
  group.add(pointCloud);

  function resize() {
    const rect = stage.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  let raf;
  function tick() {
    group.rotation.y += 0.0012;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else tick();
  });

  const posAttr = geometry.attributes.position;

  function morphTo(sceneIndex) {
    const target = scenes[sceneIndex].shape();
    const start = current.slice();
    const proxy = { t: 0 };
    gsap.killTweensOf(proxy);
    gsap.to(proxy, {
      t: 1,
      duration: 1.4,
      ease: "power2.inOut",
      onUpdate() {
        for (let i = 0; i < current.length; i++) {
          current[i] = start[i] + (target[i] - start[i]) * proxy.t;
          posAttr.array[i] = current[i];
        }
        posAttr.needsUpdate = true;
      },
    });
    const targetColor = new THREE.Color(scenes[sceneIndex].color);
    gsap.to(material.color, { r: targetColor.r, g: targetColor.g, b: targetColor.b, duration: 1.4, ease: "power2.inOut" });
  }

  /* ---------- scroll-driven scene switching ---------- */
  panels.forEach((panel, i) => {
    ScrollTrigger.create({
      trigger: panel,
      start: "top 55%",
      end: "bottom 45%",
      onEnter: () => { panel.classList.add("is-active"); morphTo(i); },
      onEnterBack: () => { panel.classList.add("is-active"); morphTo(i); },
      onLeave: () => panel.classList.remove("is-active"),
      onLeaveBack: () => panel.classList.remove("is-active"),
    });
  });
})();
