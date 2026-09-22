const CONFIG = {
  formEndpoint: "/api/request-demo",
};

const form = document.querySelector("#demo-form");
const status = document.querySelector("#form-status");
const startedAt = Date.now();

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
