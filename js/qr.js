/* ==========================================================================
   TAPP African — generic QR code renderer
   Renders a real, scannable QR into any element carrying data-qr-text.
   For someone whose phone doesn't support NFC, scanning the code opens
   the same profile a tap would. Degrades to a simple "scan" glyph if the
   qrcodejs CDN fails to load, instead of leaving an empty white box.
   ========================================================================== */

(function () {
  const targets = document.querySelectorAll("[data-qr-text]");
  if (!targets.length) return;

  targets.forEach((el) => {
    if (typeof QRCode === "undefined") {
      el.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:60%;height:60%;color:var(--ink)"><path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      return;
    }
    new QRCode(el, {
      text: el.dataset.qrText,
      width: 180,
      height: 180,
      colorDark: "#14100d",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M,
    });
  });
})();
