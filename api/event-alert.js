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

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { ok: false });
  }

  const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
  if (!validSecret(url.searchParams.get("key"), setting("ALERT_WEBHOOK_SECRET"))) {
    return send(res, 401, { ok: false });
  }
  if (Number(req.headers["content-length"] || 0) > 16384) return send(res, 413, { ok: false });

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch {
    return send(res, 400, { ok: false });
  }

  const type = String(body.event || "");
  const onlyTelegram = url.searchParams.get("channel") === "telegram";

  try {
    const deliveries = await notify(type, body, onlyTelegram ? ["telegram"] : ["email", "telegram"]);
    return send(res, 200, { ok: true, deliveries });
  } catch (error) {
    console.error("event_alert_rejected", { code: error.message });
    return send(res, 400, { ok: false });
  }
};
