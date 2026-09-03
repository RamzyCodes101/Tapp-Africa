/* ==========================================================================
   TAPP African — Checkout
   Reads ?plan= from the URL, builds a live order summary, and opens
   Paystack's inline popup to collect payment. No backend: this collects
   payment client-side only. For real order fulfillment you still need
   either a small server endpoint or at least a Paystack webhook + email
   notification, since verifying a transaction server-side requires the
   SECRET key, which must never live in client-side code like this file.
   ========================================================================== */

(function () {
  // TODO: replace with your real Paystack public key (starts with pk_test_ or pk_live_).
  // Find it in your Paystack dashboard under Settings > API Keys & Webhooks.
  const PAYSTACK_PUBLIC_KEY = "YOUR_PAYSTACK_PUBLIC_KEY";
  const CURRENCY = "GHS";

  const PLANS = {
    starter: {
      name: "Starter",
      desc: "For your first tap into digital networking.",
      unit: "/card",
      priceGHS: 230,
      minQty: 1,
    },
    pro: {
      name: "Pro",
      desc: "Eco wood finish plus payment links and full analytics.",
      unit: "/card",
      priceGHS: 410,
      minQty: 1,
    },
    business: {
      name: "Business",
      desc: "Matching cards and shared analytics for your whole team.",
      unit: "/seat",
      priceGHS: 350,
      minQty: 5,
    },
  };

  const params = new URLSearchParams(window.location.search);
  const planKey = PLANS[params.get("plan")] ? params.get("plan") : "pro";
  const plan = PLANS[planKey];

  const els = {
    title: document.getElementById("checkoutPlanTitle"),
    planName: document.getElementById("summaryPlanName"),
    planDesc: document.getElementById("summaryPlanDesc"),
    unitPrice: document.getElementById("summaryUnitPrice"),
    qtyLine: document.getElementById("summaryQty"),
    total: document.getElementById("summaryTotal"),
    qtyValue: document.getElementById("qtyValue"),
    qtyMinus: document.getElementById("qtyMinus"),
    qtyPlus: document.getElementById("qtyPlus"),
    swatches: document.querySelectorAll("#checkoutSwatches .swatch"),
    summaryCard: document.getElementById("summaryCard"),
    summaryCardColor: document.getElementById("summaryCardColor"),
    summaryCardName: document.getElementById("summaryCardName"),
    form: document.getElementById("checkoutForm"),
    payButton: document.getElementById("payButton"),
    errorBox: document.getElementById("checkoutError"),
    notice: document.getElementById("checkoutNotice"),
    checkoutSection: document.getElementById("checkout"),
    successSection: document.getElementById("checkoutSuccess"),
    successRef: document.getElementById("successRef"),
    fullName: document.getElementById("cFullName"),
    email: document.getElementById("cEmail"),
    phone: document.getElementById("cPhone"),
    address: document.getElementById("cAddress"),
  };

  if (!els.form) return;

  let qty = plan.minQty;
  let colorLabel = els.swatches.length ? els.swatches[0].dataset.label : "";

  function formatGHS(amount) {
    return "₵" + amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function render() {
    els.title.textContent = plan.name + " plan checkout";
    els.planName.textContent = plan.name + " plan";
    els.planDesc.textContent = plan.desc;
    els.unitPrice.textContent = formatGHS(plan.priceGHS) + " " + plan.unit;
    els.qtyLine.textContent = "× " + qty;
    els.total.textContent = formatGHS(plan.priceGHS * qty);
    els.qtyValue.textContent = qty;
  }
  render();

  /* ---------- quantity stepper ---------- */
  els.qtyMinus.addEventListener("click", () => {
    if (qty > plan.minQty) {
      qty--;
      render();
    }
  });
  els.qtyPlus.addEventListener("click", () => {
    if (qty < 50) {
      qty++;
      render();
    }
  });

  /* ---------- colorway swatches (also update the live mini-card) ---------- */
  els.swatches.forEach((sw) => {
    sw.addEventListener("click", () => {
      els.swatches.forEach((s) => s.classList.remove("is-active"));
      sw.classList.add("is-active");
      colorLabel = sw.dataset.label;
      els.summaryCardColor.textContent = colorLabel;
      if (window.gsap) {
        gsap.to(els.summaryCard, { "--card-a": sw.dataset.a, "--card-b": sw.dataset.b, duration: 0.4 });
      } else {
        els.summaryCard.style.setProperty("--card-a", sw.dataset.a);
        els.summaryCard.style.setProperty("--card-b", sw.dataset.b);
      }
    });
  });

  /* ---------- keep the mini-card name in sync with the form ---------- */
  els.fullName.addEventListener("input", () => {
    els.summaryCardName.textContent = els.fullName.value || "Your name here";
  });

  /* ---------- prefill from any customization saved on the Card page ---------- */
  (function prefillFromCardPage() {
    let savedName, savedColorA;
    try {
      savedName = localStorage.getItem("tapp_custom_name");
      savedColorA = localStorage.getItem("tapp_custom_color_a");
    } catch (e) {
      return;
    }
    if (savedName) {
      els.fullName.value = savedName;
      els.summaryCardName.textContent = savedName;
    }
    if (savedColorA) {
      const match = Array.from(els.swatches).find((s) => s.dataset.a === savedColorA);
      if (match) match.click();
    }
  })();

  function showError(msg) {
    els.errorBox.textContent = msg;
    els.errorBox.hidden = false;
  }
  function clearError() {
    els.errorBox.hidden = true;
  }

  if (PAYSTACK_PUBLIC_KEY === "YOUR_PAYSTACK_PUBLIC_KEY") {
    els.notice.hidden = false;
  }

  /* ---------- submit -> Paystack popup ---------- */
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearError();

    if (!els.form.checkValidity()) {
      els.form.reportValidity();
      return;
    }

    if (PAYSTACK_PUBLIC_KEY === "YOUR_PAYSTACK_PUBLIC_KEY") {
      showError("Checkout isn't connected to Paystack yet — add your public key in js/checkout.js.");
      return;
    }

    if (typeof PaystackPop === "undefined") {
      showError("Payment couldn't load — check your connection and try again.");
      return;
    }

    const total = plan.priceGHS * qty;

    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: els.email.value,
      amount: Math.round(total * 100), // Paystack expects the smallest currency unit (pesewas for GHS)
      currency: CURRENCY,
      ref: "TAPP-" + Date.now(),
      metadata: {
        custom_fields: [
          { display_name: "Plan", variable_name: "plan", value: plan.name },
          { display_name: "Quantity", variable_name: "quantity", value: String(qty) },
          { display_name: "Card colorway", variable_name: "card_colorway", value: colorLabel },
          { display_name: "Full name", variable_name: "full_name", value: els.fullName.value },
          { display_name: "Phone", variable_name: "phone", value: els.phone.value },
          { display_name: "Delivery address", variable_name: "delivery_address", value: els.address.value },
        ],
      },
      callback: function (response) {
        els.checkoutSection.hidden = true;
        els.successSection.hidden = false;
        els.successRef.textContent = response.reference;
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      onClose: function () {
        // user closed the popup without paying — nothing to do
      },
    });

    handler.openIframe();
  });
})();
