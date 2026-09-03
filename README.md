# TAPP African

Marketing site for **TAPP** — a smart NFC business card for African creators,
founders and teams. One tap shares your contact info, socials, portfolio and
payment links with anyone's phone, no app required on their end.

Design direction is inspired by the bold, color-blocked, hand-annotated
editorial style of [aardvarkbookclub.com](https://www.aardvarkbookclub.com/)
(flat saturated color sections, chunky rounded display type, hand-drawn
marker annotations, tilted 3D product renders, and a horizontal carousel
with circular nav arrows), adapted to TAPP's own African-inspired product
and palette.

## Pages

- **`index.html`** — Home: hero, marquee, a teaser of each other page, a
  "connects" integrations cloud (app chips wired to a central TAPP hub,
  flying in on scroll), features grid, stats, testimonials, CTA.
- **`story.html`** — "Our Story": a scroll-driven narrative walking through
  six behavioral-science ideas (the forgetting curve, loss aversion, the
  primacy effect, reciprocity, staying current, the peak-end rule) and why
  they explain why a tap beats a paper card. A single Three.js particle
  system morphs through six formations as you scroll past each beat.
- **`card.html`** — "The Card": an interactive drag-to-rotate 3D card
  (Three.js, with a live canvas-texture front/back you can recolor), a
  lanyard/badge showcase you can grab and swing, the designs carousel,
  the "how it works" steps, the packaging section, and the full features
  grid.
- **`pricing.html`** — Pricing plans, stats, FAQ, and a closing CTA.

## Stack

Plain HTML/CSS/JS — no build step.

- `css/style.css` — all styling (CSS custom properties, responsive layout)
- `js/script.js` — shared interactions on every page: nav, mobile menu, FAQ
  accordion, carousels, plus GSAP + ScrollTrigger scroll animations
- `js/three-hero.js` — Home only: ambient particle "network" behind the hero
- `js/connects.js` — Home only: draws the integrations cloud's connector
  lines (via live `getBoundingClientRect` math) and its scroll-triggered
  entrance; degrades to a plain scrollable chip row on narrow screens
- `js/three-story.js` — Story only: the morphing scrollytelling particle scene
- `js/three-card.js` — Card only: the interactive 3D card viewer
- `js/lanyard.js` — Card only: the draggable, swinging lanyard badge
- GSAP, ScrollTrigger, and Three.js are all loaded from cdnjs

Every animated piece degrades gracefully. If GSAP/ScrollTrigger fails to
load, each page force-reveals its GSAP-hidden content (opacity 0 by default,
meant to be revealed on scroll/load) via a `no-anim` class after a short
timeout, and every core interaction (menu, FAQ, carousels) works without
GSAP at all. If Three.js fails to load, the affected canvas areas simply
stay empty — their containers already have a matching CSS background, so
nothing looks broken.

## Running locally

No build step needed — just serve the folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
