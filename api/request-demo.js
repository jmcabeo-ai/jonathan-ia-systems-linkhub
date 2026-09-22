const crypto = require("node:crypto");
const { notify } = require("./_lib/notifications");

const API_BASE = "https://services.leadconnectorhq.com";
const TASK_TITLE = "Preparar muestra web gratuita";
const TAG = "IG_MUESTRA_WEB_SOLICITADA";

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function cleanHandle(value) {
  return String(value || "").trim().replace(/^@/, "").toLowerCase();
}

function exactHandle(value) {
  return String(value || "").trim().toLowerCase().replace(/^instagram\s+@?/, "").replace(/^@/, "");
}

function setting(name) {
  return process["env"][name];
}

async function ghl(path, options = {}, version = "v3") {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${setting("GHL_PRIVATE_INTEGRATION_TOKEN")}`,
      Version: version,
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try { data = JSON.parse(text); } catch { data = {}; }
  }
  if (!response.ok) {
    const error = new Error(`provider_${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function resolveContact(instagram) {
  const locationId = setting("GHL_LOCATION_ID");
  const query = new URLSearchParams({ locationId, query: instagram, limit: "20" });
  const search = await ghl(`/contacts/?${query}`, { method: "GET" }, "2021-07-28");
  const candidates = Array.isArray(search.contacts) ? search.contacts : [];
  const fields = ["contactName", "firstName", "lastName", "companyName"];
  const exact = candidates.filter((contact) => fields.some((field) => exactHandle(contact[field]) === instagram));

  if (exact.length === 1) return exact[0];

  const created = await ghl("/contacts/", {
    method: "POST",
    body: JSON.stringify({
      locationId,
      firstName: instagram,
      name: instagram,
      source: "Landing muestra web gratuita",
      tags: [TAG],
    }),
  });
  return created.contact;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { ok: false });
  }

  if (!setting("GHL_PRIVATE_INTEGRATION_TOKEN") || !setting("GHL_LOCATION_ID") || !setting("GHL_ASSIGNEE_ID")) {
    return send(res, 503, { ok: false });
  }

  if (Number(req.headers["content-length"] || 0) > 4096) return send(res, 413, { ok: false });

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin) {
    try {
      if (new URL(origin).host !== host) return send(res, 403, { ok: false });
    } catch {
      return send(res, 403, { ok: false });
    }
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch {
    return send(res, 400, { ok: false });
  }

  const instagram = cleanHandle(body.instagram);
  const idea = String(body.idea || "").trim().slice(0, 300);
  const website = String(body.website || "").trim();
  const startedAt = Number(body.startedAt || 0);
  const elapsed = Date.now() - startedAt;

  if (website) return send(res, 200, { ok: true });
  if (!body.consent || !/^[a-z0-9._]{2,30}$/.test(instagram)) return send(res, 400, { ok: false });
  if (!Number.isFinite(elapsed) || elapsed < 1200 || elapsed > 86400000) return send(res, 400, { ok: false });

  try {
    const contact = await resolveContact(instagram);
    if (!contact || !contact.id) throw new Error("contact_missing");

    await ghl(`/contacts/${contact.id}/tags`, {
      method: "POST",
      body: JSON.stringify({ tags: [TAG] }),
    });

    const fingerprint = crypto.createHash("sha256").update(`${instagram}\n${idea}`).digest("hex").slice(0, 12);
    const marker = `[muestra-web:${fingerprint}]`;
    const notesData = await ghl(`/contacts/${contact.id}/notes`, { method: "GET" });
    const notes = Array.isArray(notesData.notes) ? notesData.notes : [];
    const alreadyRecorded = notes.some((note) => String(note.body || "").includes(marker));

    if (!alreadyRecorded) {
      const noteBody = [
        marker,
        `Solicitud de muestra web desde la landing para @${instagram}.`,
        idea ? `Quiere mejorar: ${idea}` : "No indicó una mejora concreta.",
        "Consentimiento de contacto registrado en el formulario.",
      ].join("\n");

      await ghl(`/contacts/${contact.id}/notes`, {
        method: "POST",
        body: JSON.stringify({
          userId: setting("GHL_ASSIGNEE_ID"),
          title: "Solicitud de muestra web",
          body: noteBody,
          pinned: true,
          color: "#00C8FF",
        }),
      });

      const tasksData = await ghl(`/contacts/${contact.id}/tasks`, { method: "GET" });
      const tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : [];
      const pendingTask = tasks.some((task) => task.title === TASK_TITLE && !task.completed);

      if (!pendingTask) {
        await ghl(`/contacts/${contact.id}/tasks`, {
          method: "POST",
          body: JSON.stringify({
            title: TASK_TITLE,
            body: `Revisar @${instagram} y preparar su propuesta. ${idea || "Sin indicación adicional."}`,
            dueDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            completed: false,
            assignedTo: setting("GHL_ASSIGNEE_ID"),
          }),
        });
      }

      const locationId = setting("GHL_LOCATION_ID");
      const contactUrl = `https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${contact.id}`;
      await notify("demo_requested", {
        instagram: `@${instagram}`,
        idea: idea || "No indicó una mejora concreta.",
        contactUrl,
      });
    }

    return send(res, 200, { ok: true });
  } catch (error) {
    console.error("request_demo_failed", { code: error.message, status: error.status || null });
    return send(res, 502, { ok: false });
  }
};
