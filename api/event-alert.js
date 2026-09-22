const crypto = require("node:crypto");
const { notify } = require("./_lib/notifications");

function setting(name) {
  return process["env"][name];
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function validSecret(received, expected) {
  const left = Buffer.from(String(received || ""));
  const right = Buffer.from(String(expected || ""));
  return left.length > 0 && left.length === right.length && crypto.timingSafeEqual(left, right);
}

function first(source, keys) {
  for (const key of keys) {
    const parts = key.split(".");
    let value = source;
    for (const part of parts) value = value && typeof value === "object" ? value[part] : undefined;
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return "";
}

function normalise(type, body) {
  const firstName = first(body, ["first_name", "firstName", "contact.first_name", "contact.firstName"]);
  const lastName = first(body, ["last_name", "lastName", "contact.last_name", "contact.lastName"]);
  const contactId = first(body, ["contact_id", "contactId", "contact.id", "id"]);
  const locationId = setting("GHL_LOCATION_ID");

  return {
    ...body,
    contact: first(body, ["full_name", "fullName", "contact.name", "name"]) || `${firstName} ${lastName}`.trim(),
    phone: first(body, ["phone", "contact.phone"]),
    email: first(body, ["email", "contact.email"]),
    instagram: first(body, ["instagram", "contact.instagram", "contact.contexto_instagram_jonathan"]),
    status: first(body, ["appointmentStatus", "appointment_status", "status", "appointment.status"]),
    startTime: first(body, ["startTime", "start_time", "appointment.startTime", "appointment.start_time"]),
    calendar: first(body, ["calendarName", "calendar_name", "appointment.calendarName", "appointment.calendar_name"]),
    reason: first(body, ["reason", "message", "body"]) || (type === "human_handoff" ? "El agente ha solicitado intervención." : ""),
    contactUrl: contactId && locationId
      ? `https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${contactId}`
      : "",
    conversationUrl: type === "human_handoff" && locationId
      ? `https://app.gohighlevel.com/v2/location/${locationId}/conversations/conversations`
      : "",
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { ok: false });
  }

  const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
  const receivedSecret = req.headers["x-alert-key"] || url.searchParams.get("key");
  if (!validSecret(receivedSecret, setting("ALERT_WEBHOOK_SECRET"))) {
    return send(res, 401, { ok: false });
  }
  if (Number(req.headers["content-length"] || 0) > 16384) return send(res, 413, { ok: false });

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch {
    return send(res, 400, { ok: false });
  }

  const type = String(body.event || url.searchParams.get("event") || "");
  const onlyTelegram = url.searchParams.get("channel") === "telegram";

  try {
    const deliveries = await notify(type, normalise(type, body), onlyTelegram ? ["telegram"] : ["email", "telegram"]);
    return send(res, 200, { ok: true, deliveries });
  } catch (error) {
    console.error("event_alert_rejected", { code: error.message });
    return send(res, 400, { ok: false });
  }
};
