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

## Stack

Plain HTML/CSS/JS — no build step.

- `index.html` — page markup
- `css/style.css` — all styling (CSS custom properties, responsive layout)
- `js/script.js` — interactions (nav, mobile menu, FAQ accordion, carousels)
  plus GSAP + ScrollTrigger scroll animations, loaded from cdnjs

If the GSAP CDN fails to load, the site falls back to a fully usable static
version — core interactions (menu, FAQ, carousels) don't depend on GSAP, and
all GSAP-hidden content (opacity 0 by default, meant to be revealed on
scroll/load) is force-revealed via a `no-anim` class after a short timeout.

## Running locally

No build step needed — just serve the folder:

```bash
cd tapp_african
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
