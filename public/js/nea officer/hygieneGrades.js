// NEA hygiene logic: loads stall grades and submits grade updates.
const API_BASE = "/api/nea-officer/hygiene";

let allStalls = [];
const inspectionParams = new URLSearchParams(window.location.search);
const targetStallId = inspectionParams.get("stallId");
const targetComplaintId = inspectionParams.get("complaintId");

const tableBody = document.getElementById("hygieneTableBody");
const searchInput = document.getElementById("searchInput");
const gradeFilter = document.getElementById("gradeFilter");
const refreshBtn = document.getElementById("refreshBtn");
const statusMessage = document.getElementById("statusMessage");

const modal = document.getElementById("hygieneModal");
const modalTitle = document.getElementById("modalTitle");
const hygieneForm = document.getElementById("hygieneForm");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");

const formStallId = document.getElementById("formStallId");
const formHygieneId = document.getElementById("formHygieneId");
const stallNameDisplay = document.getElementById("stallNameDisplay");
const gradeInput = document.getElementById("gradeInput");
const scoreInput = document.getElementById("scoreInput");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const remarksInput = document.getElementById("remarksInput");

document.addEventListener("DOMContentLoaded", loadHygieneGrades);
refreshBtn.addEventListener("click", loadHygieneGrades);
searchInput.addEventListener("input", renderTable);
gradeFilter.addEventListener("change", renderTable);
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
hygieneForm.addEventListener("submit", handleSubmit);

async function loadHygieneGrades(options = {}) {
  tableBody.innerHTML = messagePanel("Loading hygiene grades...");
  if (!options.preserveStatus) hideStatus();

  try {
    const res = await fetch(API_BASE, { credentials: "include" });

    if (res.status === 401) {
      showStatus("Please log in as an NEA officer to view this page.", "error");
      tableBody.innerHTML = messagePanel("Not logged in.");
      return;
    }

    if (!res.ok) throw new Error("Request failed");

    allStalls = await res.json();
    renderTable();

    if (targetComplaintId) {
      showStatus(`Opened from hygiene complaint #${targetComplaintId}.`, "success");
    }
  } catch (error) {
    tableBody.innerHTML = messagePanel("Failed to load hygiene grades.");
    showStatus("Failed to load hygiene grades.", "error");
  }
}

function renderTable() {
  const search = searchInput.value.trim().toLowerCase();
  const gradeValue = gradeFilter.value;

  const filtered = allStalls.filter((stall) => {
    const checked = isCheckedStall(stall);
    const matchesSearch =
      !search ||
      stall.stall_name?.toLowerCase().includes(search) ||
      stall.location?.toLowerCase().includes(search) ||
      String(stall.stall_id).includes(search);

    const matchesGrade =
      !gradeValue ||
      (gradeValue === "checked" ? checked :
        gradeValue === "unchecked" ? !checked :
          stall.hygiene_grade === gradeValue);

    return matchesSearch && matchesGrade;
  });

  if (filtered.length === 0) {
    const message = allStalls.length === 0
      ? "No stalls have been added to the database yet."
      : "No stalls match your search.";
    tableBody.innerHTML = messagePanel(message);
    return;
  }

  tableBody.innerHTML = renderGroupedRows(filtered, gradeValue);

  tableBody.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.dataset.stallId));
  });

  tableBody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleDelete(btn.dataset.hygieneId, btn.dataset.stallName));
  });

  const targetRow = targetStallId
    ? tableBody.querySelector(`[data-row-stall-id="${CSS.escape(targetStallId)}"]`)
    : null;

  if (targetRow) {
    targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function renderGroupedRows(stalls, gradeValue) {
  if (gradeValue && gradeValue !== "checked" && gradeValue !== "unchecked") {
    return groupPanelTemplate(`Grade ${gradeValue} Stalls`, stalls);
  }

  const checkedStalls = stalls.filter(isCheckedStall);
  const uncheckedStalls = stalls.filter((stall) => !isCheckedStall(stall));

  if (gradeValue === "checked") {
    return groupPanelTemplate("Checked Stalls", checkedStalls);
  }

  if (gradeValue === "unchecked") {
    return groupPanelTemplate("Unchecked Stalls", uncheckedStalls);
  }

  return [
    groupPanelTemplate("Unchecked Stalls", uncheckedStalls),
    groupPanelTemplate("Checked Stalls", checkedStalls)
  ].join("");
}

function groupPanelTemplate(label, stalls) {
  return `
    <section class="hygiene-group-panel">
      <div class="group-heading">
        <h2>${label}</h2>
        <strong>${stalls.length}</strong>
      </div>
      ${stalls.length ? tableTemplate(stalls) : `<p class="empty-row">No ${label.toLowerCase()} found.</p>`}
    </section>
  `;
}

function tableTemplate(stalls) {
  return `
    <div class="hygiene-table-wrap">
      <table class="hygiene-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Stall</th>
            <th>Vendor</th>
            <th>Location</th>
            <th>Public Items</th>
            <th>Grade</th>
            <th>Score</th>
            <th>Last Inspected</th>
            <th>Inspected By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${stalls.map(rowTemplate).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function messagePanel(message) {
  return `
    <section class="hygiene-group-panel">
      <p class="empty-row">${message}</p>
    </section>
  `;
}

async function handleDelete(hygieneId, stallName) {
  const confirmed = window.confirm(`Delete the hygiene grade record for "${stallName}"? This cannot be undone.`);
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/entry/${hygieneId}`, {
      method: "DELETE",
      credentials: "include"
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to delete hygiene grade.");
    }

    showStatus("Hygiene grade deleted successfully.", "success");
    await loadHygieneGrades();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

function rowTemplate(stall) {
  const vendorName = [stall.first_name, stall.last_name].filter(Boolean).join(" ") || "—";
  const gradeLabel = stall.hygiene_grade || "—";
  const gradeClass = stall.hygiene_grade ? "" : "grade-none";
  const lastInspected = stall.inspection_date ? formatDate(stall.inspection_date) : "Not graded yet";
  const inspectedBy = stall.inspection_by || "—";
  const score = stall.score !== null && stall.score !== undefined ? stall.score : "—";
  const publicItems = Number(stall.visible_menu_items || 0);

  return `
    <tr class="${String(stall.stall_id) === String(targetStallId) ? "inspection-target-row" : ""}" data-row-stall-id="${escapeHtml(stall.stall_id)}">
      <td>${stall.stall_id}</td>
      <td>${escapeHtml(stall.stall_name)}</td>
      <td>${escapeHtml(vendorName)}</td>
      <td>${escapeHtml(stall.location || "—")}</td>
      <td>${publicItems}</td>
      <td><span class="grade-badge ${gradeClass}">${escapeHtml(gradeLabel)}</span></td>
      <td>${escapeHtml(String(score))}</td>
      <td>${escapeHtml(lastInspected)}</td>
      <td>${escapeHtml(inspectedBy)}</td>
      <td class="actions-cell">
        <button class="edit-btn" data-stall-id="${stall.stall_id}">Edit</button>
        ${stall.hygiene_id ? `<button class="delete-btn" data-hygiene-id="${stall.hygiene_id}" data-stall-name="${escapeHtml(stall.stall_name)}">Delete</button>` : ""}
      </td>
    </tr>
  `;
}

function isCheckedStall(stall) {
  return Boolean(stall.hygiene_id || stall.hygiene_grade || stall.inspection_date);
}

function openModal(stallId) {
  const stall = allStalls.find((s) => String(s.stall_id) === String(stallId));
  if (!stall) return;

  formStallId.value = stall.stall_id;
  formHygieneId.value = stall.hygiene_id || "";
  stallNameDisplay.value = stall.stall_name;

  gradeInput.value = stall.hygiene_grade || "";
  scoreInput.value = stall.score ?? "";
  dateInput.value = stall.inspection_date ? stall.inspection_date.slice(0, 10) : today();
  timeInput.value = stall.inspection_time ? stall.inspection_time.slice(0, 5) : "";
  remarksInput.value = stall.remarks || "";

  modalTitle.textContent = stall.hygiene_id ? "Update Hygiene Grade" : "Record Hygiene Grade";

  modal.hidden = false;
}

function closeModal() {
  modal.hidden = true;
  hygieneForm.reset();
}

async function handleSubmit(event) {
  event.preventDefault();

  const stallId = formStallId.value;
  const hygieneId = formHygieneId.value;

  const payload = {
    hygieneGrade: gradeInput.value,
    score: scoreInput.value ? Number(scoreInput.value) : null,
    inspectionDate: dateInput.value,
    inspectionTime: timeInput.value || null,
    remarks: remarksInput.value || null
  };

  const submitBtn = hygieneForm.querySelector(".btn-solid");
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";

  try {
    const url = hygieneId ? `${API_BASE}/entry/${hygieneId}` : `${API_BASE}/${stallId}`;
    const method = hygieneId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to save hygiene grade.");
    }

    closeModal();
    await loadHygieneGrades({ preserveStatus: true });
    showStatus(data.message || "Hygiene grade saved successfully.", "success");
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Grade";
  }
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.hidden = false;
}

function hideStatus() {
  statusMessage.hidden = true;
  statusMessage.textContent = "";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-SG", { day: "2-digit", month: "short", year: "numeric" });
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
