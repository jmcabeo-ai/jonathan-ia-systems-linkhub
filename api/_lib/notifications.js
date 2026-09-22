const API_BASE = "https://services.leadconnectorhq.com";

function setting(name) {
  return process["env"][name];
}

function text(value, limit = 240) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function escapeHtml(value) {
  return text(value, 500)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const EVENT_DEFINITIONS = {
  demo_requested: {
    title: "Nueva solicitud de muestra web",
    emoji: "🌐",
    fields: [
      ["Instagram", "instagram"],
      ["Quiere mejorar", "idea"],
      ["Contacto en GHL", "contactUrl"],
    ],
  },
  appointment_booked: {
    title: "Nueva cita reservada",
    emoji: "📅",
    fields: [
      ["Contacto", "contact"],
      ["Teléfono", "phone"],
      ["Email", "email"],
      ["Fecha", "startTime"],
      ["Calendario", "calendar"],
      ["Contacto en GHL", "contactUrl"],
    ],
  },
  appointment_rescheduled: {
    title: "Cita reprogramada",
    emoji: "🔄",
    fields: [
      ["Contacto", "contact"],
      ["Nueva fecha", "startTime"],
      ["Calendario", "calendar"],
      ["Contacto en GHL", "contactUrl"],
    ],
  },
  appointment_updated: {
    title: "Cambio de cita",
    emoji: "📅",
    fields: [
      ["Contacto", "contact"],
      ["Estado", "status"],
      ["Teléfono", "phone"],
      ["Email", "email"],
      ["Fecha", "startTime"],
      ["Calendario", "calendar"],
      ["Contacto en GHL", "contactUrl"],
    ],
  },
  appointment_cancelled: {
    title: "Cita cancelada",
    emoji: "❌",
    fields: [
      ["Contacto", "contact"],
      ["Fecha", "startTime"],
      ["Calendario", "calendar"],
      ["Contacto en GHL", "contactUrl"],
    ],
  },
  human_handoff: {
    title: "El agente necesita que intervengas",
    emoji: "🙋",
    fields: [
      ["Contacto", "contact"],
      ["Instagram", "instagram"],
      ["Motivo", "reason"],
      ["Conversación", "conversationUrl"],
    ],
  },
  form_submitted: {
    title: "Nuevo formulario recibido",
    emoji: "📝",
    fields: [
      ["Formulario", "form"],
      ["Contacto", "contact"],
      ["Teléfono", "phone"],
      ["Email", "email"],
      ["Contacto en GHL", "contactUrl"],
    ],
  },
};

function formatEvent(type, input = {}) {
  const definition = EVENT_DEFINITIONS[type];
  if (!definition) throw new Error("unsupported_event");

  const rows = definition.fields
    .map(([label, key]) => [label, text(input[key], key.toLowerCase().includes("url") ? 500 : 240)])
    .filter(([, value]) => value);

  const plain = [
    `${definition.emoji} ${definition.title}`,
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");

  const html = [
    `<h2>${definition.emoji} ${escapeHtml(definition.title)}</h2>`,
    ...rows.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`),
  ].join("");

  return { subject: definition.title, plain, html };
}

async function sendTelegram(message) {
  const token = setting("TELEGRAM_BOT_TOKEN");
  const chatId = setting("TELEGRAM_CHAT_ID");
  if (!token || !chatId) throw new Error("telegram_not_configured");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) throw new Error(`telegram_${response.status}`);
  const result = await response.json();
  if (!result.ok) throw new Error("telegram_rejected");
}

async function sendEmail(subject, html) {
  const token = setting("GHL_PRIVATE_INTEGRATION_TOKEN");
  const contactId = setting("GHL_ALERT_CONTACT_ID");
  const emailTo = setting("ALERT_EMAIL_TO");
  if (!token || !contactId || !emailTo) throw new Error("email_not_configured");

  const response = await fetch(`${API_BASE}/conversations/messages`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Version: "v3",
    },
    body: JSON.stringify({
      type: "Email",
      contactId,
      subject,
      html,
      status: "pending",
      emailTo,
    }),
  });

  if (!response.ok) throw new Error(`email_${response.status}`);
  const result = await response.json();
  if (!result.messageId) throw new Error("email_rejected");
}

async function notify(type, input, channels = ["email", "telegram"]) {
  const event = formatEvent(type, input);
  const requested = new Set(channels);
  const deliveries = [];

  if (requested.has("email")) {
    deliveries.push(["email", sendEmail(event.subject, event.html)]);
  }
  if (requested.has("telegram")) {
    deliveries.push(["telegram", sendTelegram(event.plain)]);
  }

  const settled = await Promise.allSettled(deliveries.map(([, promise]) => promise));
  const result = {};
  settled.forEach((delivery, index) => {
    const channel = deliveries[index][0];
    result[channel] = delivery.status === "fulfilled";
    if (delivery.status === "rejected") {
      console.error("notification_failed", { channel, code: delivery.reason?.message || "unknown" });
    }
  });
  return result;
}

module.exports = { notify };
