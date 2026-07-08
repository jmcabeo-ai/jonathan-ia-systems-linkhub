(function () {
  var routeTargets = {
    "/mapa": "mapa",
    "/auditoria": "auditoria",
    "/mesaflow": "mesaflow"
  };

  var targetId = routeTargets[window.location.pathname.toLowerCase()];
  if (targetId) {
    window.setTimeout(function () {
      var target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest("[data-track]");
    if (!link) return;

    var payload = {
      event: link.getAttribute("data-track"),
      href: link.getAttribute("href"),
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);

    if (window.location.hostname === "localhost" || window.location.protocol === "file:") {
      console.info("[linkhub]", payload);
    }
  });
})();
