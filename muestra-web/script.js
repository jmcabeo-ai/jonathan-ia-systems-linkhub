const CONFIG = {
  formEndpoint: "/api/request-demo",
};

const form = document.querySelector("#demo-form");
const status = document.querySelector("#form-status");
const startedAt = Date.now();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  document.body.classList.add("has-motion");

  const revealTargets = document.querySelectorAll([
    ".portfolio-intro",
    ".portfolio-card",
    ".systems-proof",
    ".section-heading",
    ".value-card",
    ".builder-gallery",
    ".builder-copy",
    ".steps li",
    ".offer-copy",
    ".price-card",
    ".founder-card",
    ".founder-copy",
    ".faq-list",
    ".request-copy",
    ".request-form",
  ].join(","));

  revealTargets.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("reveal-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -9%", threshold: 0.08 });

  revealTargets.forEach((element) => revealObserver.observe(element));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const instagram = String(formData.get("instagram") || "").trim().replace(/^@/, "");
  const idea = String(formData.get("idea") || "").trim();
  const website = String(formData.get("website") || "").trim();
  const consent = formData.get("consent") === "on";

  if (!/^[a-zA-Z0-9._]{2,30}$/.test(instagram)) {
    status.textContent = "Escribe un usuario de Instagram válido.";
    document.querySelector("#instagram").focus();
    return;
  }

  if (!consent) {
    status.textContent = "Necesito que aceptes la política de privacidad para responderte.";
    document.querySelector("#consent").focus();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Enviando…";
  status.textContent = "";

  try {
    const response = await fetch(CONFIG.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instagram, idea, consent, website, startedAt, source: "landing-demo-web-97" }),
    });

    if (!response.ok) throw new Error("request_failed");

    form.reset();
    status.textContent = "Solicitud recibida. Te responderé por Instagram.";
  } catch {
    status.textContent = "No se pudo enviar. Vuelve al chat de Instagram y escribe DEMO.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Quiero mi muestra gratuita";
  }
});
