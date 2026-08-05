import { apiFetch } from "../utility/api.js";

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value == null ? "" : String(value);
  return element.innerHTML;
}

function ensureStyles() {
  if (document.querySelector('link[data-patron-hygiene-alerts]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/css/patron/patronHygieneAlerts.css";
  link.dataset.patronHygieneAlerts = "true";
  document.head.appendChild(link);
}

export async function loadPatronHygieneAlerts() {
  try {
    ensureStyles();
    const response = await apiFetch("/api/patron/hygiene-alerts");
    if (!response.ok) return;
    const alerts = await response.json();
    const alert = alerts[0];
    if (!alert || document.querySelector(".patron-hygiene-alert")) return;

    const popup = document.createElement("aside");
    popup.className = "patron-hygiene-alert";
    popup.setAttribute("role", "alertdialog");
    popup.setAttribute("aria-live", "assertive");
    popup.innerHTML = `
      <button type="button" class="patron-alert-close" aria-label="Close hygiene alert">&times;</button>
      <p class="patron-alert-label">Important hygiene update</p>
      <h2>${escapeHtml(alert.stallName)} is now Grade D</h2>
      <p>The NEA officer assigned this stall a Grade D hygiene rating.</p>
      <dl>
        ${alert.score != null ? `<div><dt>Score</dt><dd>${escapeHtml(alert.score)} / 100</dd></div>` : ""}
        <div><dt>Inspection date</dt><dd>${escapeHtml(alert.inspectionDate)}</dd></div>
        <div><dt>Officer remarks</dt><dd>${escapeHtml(alert.remarks)}</dd></div>
      </dl>
      <a href="/stall-menu?stall=${encodeURIComponent(alert.stallId)}">View stall</a>`;
    document.body.appendChild(popup);

    popup.querySelector(".patron-alert-close").addEventListener("click", async () => {
      popup.remove();
      await apiFetch(`/api/patron/hygiene-alerts/${alert.id}/read`, { method: "PATCH" });
      loadPatronHygieneAlerts();
    });
  } catch (error) {
    console.error("Unable to load patron hygiene alerts.", error);
  }
}
