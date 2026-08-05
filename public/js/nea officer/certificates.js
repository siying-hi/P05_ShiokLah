// NEA certificate logic: loads, groups, searches, views, approves, rejects, and notifies.
const API_BASE = "/api/nea-officer/certificates";

const tableBody = document.getElementById("certificatesTableBody");
const certificateStatus = document.getElementById("certificateStatus");
const refreshBtn = document.getElementById("refreshBtn");
const certificateSearch = document.getElementById("certificateSearch");
const searchBtn = document.getElementById("searchBtn");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const expiringCount = document.getElementById("expiringCount");
const sentCount = document.getElementById("sentCount");
const certificateModal = document.getElementById("certificateModal");
const certificateModalTitle = document.getElementById("certificateModalTitle");
const certificateModalBody = document.getElementById("certificateModalBody");
const closeCertificateModal = document.getElementById("closeCertificateModal");

let certificateRecords = [];
let activeSearchTerm = "";

refreshBtn.addEventListener("click", loadCertificates);
searchBtn.addEventListener("click", applyCertificateSearch);
clearSearchBtn.addEventListener("click", clearCertificateSearch);
certificateSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    applyCertificateSearch();
  }
});
closeCertificateModal.addEventListener("click", hideCertificateModal);
certificateModal.addEventListener("click", (event) => {
  if (event.target === certificateModal) hideCertificateModal();
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getDaysUntilExpiry(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
}


function certificateMatchesSearch(record, term) {
  if (!term) return true;

  const haystack = [
    record.vendorName,
    record.vendorEmail,
    record.stallName,
    record.stallLocation,
    record.certificateName,
    record.certificateNumber,
    record.issueDate,
    record.expiryDate,
    record.issuingAuthority,
    record.status,
    record.notificationStatus
  ].join(" ").toLowerCase();

  return haystack.includes(term.toLowerCase());
}

function getVisibleCertificates() {
  return certificateRecords.filter((record) => certificateMatchesSearch(record, activeSearchTerm));
}

function applyCertificateSearch() {
  activeSearchTerm = certificateSearch.value.trim();
  renderCertificates(getVisibleCertificates());
}

function clearCertificateSearch() {
  certificateSearch.value = "";
  activeSearchTerm = "";
  renderCertificates(certificateRecords);
}
function updateSummary(records) {
  totalCount.textContent = records.length;
  pendingCount.textContent = records.filter((record) => getStatusGroup(record) === "pending").length;
  expiringCount.textContent = records.filter((record) => record.notificationDue).length;
  sentCount.textContent = records.filter((record) => record.notificationStatus === "Sent").length;
}

function getApprovalClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "approved") return "approved";
  if (normalized === "rejected") return "rejected";
  return "pending";
}

function showCertificateModal(record) {
  certificateModalTitle.textContent = record.certificateName || "Certificate Details";

  const certificatePreview = record.certificateUrl
    ? `<a class="certificate-file-link" href="${escapeHtml(record.certificateUrl)}" target="_blank" rel="noopener">Open uploaded certificate</a>`
    : `<div class="certificate-missing">No uploaded certificate file is available for this record yet.</div>`;

  certificateModalBody.innerHTML = `
    <dl class="certificate-detail-list">
      <div><dt>Vendor</dt><dd>${escapeHtml(record.vendorName)}</dd></div>
      <div><dt>Email</dt><dd>${escapeHtml(record.vendorEmail)}</dd></div>
      <div><dt>Stall</dt><dd>${escapeHtml(record.stallName)}</dd></div>
      <div><dt>Certificate</dt><dd>${escapeHtml(record.certificateName)}</dd></div>
      <div><dt>Certificate No.</dt><dd>${escapeHtml(record.certificateNumber)}</dd></div>
      <div><dt>Issued By</dt><dd>${escapeHtml(record.issuingAuthority)}</dd></div>
      <div><dt>Issue Date</dt><dd>${escapeHtml(record.issueDate)}</dd></div>
      <div><dt>Expiry Date</dt><dd>${escapeHtml(record.expiryDate)}</dd></div>
      <div><dt>Status</dt><dd>${escapeHtml(record.status)}</dd></div>
    </dl>
    ${certificatePreview}
  `;

  certificateModal.hidden = false;
}

function hideCertificateModal() {
  certificateModal.hidden = true;
}

function getStatusGroup(record) {
  const normalized = String(record.status || "").toLowerCase();
  if (normalized === "approved") return "approved";
  if (normalized === "rejected") return "disapproved";
  return "pending";
}

function renderGroupedCertificates(records) {
  const groups = [
    { key: "pending", label: "Pending Certificates" },
    { key: "disapproved", label: "Disapproved Certificates" },
    { key: "approved", label: "Approved Certificates" }
  ];

  return groups.map((group) => {
    const groupRecords = records.filter((record) => getStatusGroup(record) === group.key);
    return certificateGroupPanelTemplate(group.label, groupRecords);
  }).join("");
}

function certificateGroupPanelTemplate(label, records) {
  return `
    <section class="certificate-group-panel">
      <div class="group-heading">
        <h2>${label}</h2>
        <strong>${records.length}</strong>
      </div>
      ${records.length ? certificateTableTemplate(records) : `<p class="empty-cell">No ${label.toLowerCase()} found.</p>`}
    </section>
  `;
}

function certificateTableTemplate(records) {
  return `
    <div class="table-wrapper">
      <table class="certificates-table">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Stall</th>
            <th>Certificate</th>
            <th>Expiry</th>
            <th>Approval</th>
            <th>Notification</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(certificateRowTemplate).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function certificateMessagePanel(message) {
  return `
    <section class="certificate-group-panel">
      <p class="empty-cell">${message}</p>
    </section>
  `;
}

function certificateRowTemplate(record) {
  const daysLeft = getDaysUntilExpiry(record.expiryDate);
  const approvalClass = getApprovalClass(record.status);
  const notificationClass = record.notificationStatus === "Sent"
    ? "sent"
    : record.notificationDue
      ? "due"
      : "not-due";
  const notificationLabel = record.notificationStatus === "Sent"
    ? "Sent"
    : record.notificationDue
      ? "Due"
      : "Not Due";

  return `
    <tr>
      <td>
        <button class="cell-link certificate-view-btn" type="button" data-action="view" data-id="${record.certificateId}">
          <span class="cell-title">${escapeHtml(record.vendorName)}</span>
          <span class="cell-subtitle">${escapeHtml(record.vendorEmail)}</span>
        </button>
      </td>
      <td>
        <span class="cell-title">${escapeHtml(record.stallName)}</span>
        <span class="cell-subtitle">${escapeHtml(record.stallLocation)}</span>
      </td>
      <td>
        <button class="cell-link certificate-view-btn" type="button" data-action="view" data-id="${record.certificateId}">
          <span class="cell-title">${escapeHtml(record.certificateName)}</span>
          <span class="cell-subtitle">${escapeHtml(record.certificateNumber)}</span>
        </button>
      </td>
      <td>
        <span class="cell-title">${escapeHtml(record.expiryDate)}</span>
        <span class="cell-subtitle">${daysLeft} day(s) left</span>
      </td>
      <td><span class="badge ${approvalClass}">${escapeHtml(record.status)}</span></td>
      <td><span class="badge ${notificationClass}">${notificationLabel}</span></td>
      <td>
        <div class="actions-cell">
          <button class="action-btn disapprove-btn" data-action="disapprove" data-id="${record.certificateId}" ${record.status === "Rejected" ? "disabled" : ""}>Disapprove</button>
          <button class="action-btn approve-btn" data-action="approve" data-id="${record.certificateId}" ${record.status === "Approved" ? "disabled" : ""}>Approve</button>
          <button class="action-btn notify-btn" data-action="notify" data-id="${record.certificateId}" ${!record.notificationDue || record.notificationStatus === "Sent" ? "disabled" : ""}>Notify</button>
        </div>
      </td>
    </tr>
  `;
}

function renderCertificates(records) {
  updateSummary(records);

  if (!records.length) {
    tableBody.innerHTML = certificateMessagePanel("No certificate records found.");
    certificateStatus.textContent = activeSearchTerm ? `No certificate records found for "${activeSearchTerm}".` : "No certificate records found.";
    return;
  }

  certificateStatus.textContent = activeSearchTerm
    ? `${records.length} certificate record(s) match "${activeSearchTerm}".`
    : `${records.length} certificate record(s) loaded. Expiry reminders are checked 6 months in advance.`;

  tableBody.innerHTML = renderGroupedCertificates(records);

  tableBody.querySelectorAll("button[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action, button.dataset.id));
  });
}

async function loadCertificates() {
  certificateStatus.textContent = "Loading certificate records...";
  tableBody.innerHTML = certificateMessagePanel("Loading certificate records...");

  try {
    const response = await fetch(API_BASE);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load certificate records.");
    }

    certificateRecords = data;
    renderCertificates(getVisibleCertificates());
    await sendAutomaticSixMonthNotifications();
  } catch (error) {
    certificateStatus.textContent = error.message || "Certificate records could not be loaded.";
    tableBody.innerHTML = certificateMessagePanel("Certificate records could not be loaded.");
  }
}

async function sendAutomaticSixMonthNotifications() {
  const dueRecords = certificateRecords.filter((record) => (
    record.notificationDue && record.notificationStatus !== "Sent"
  ));

  if (!dueRecords.length) return;

  await Promise.all(dueRecords.map((record) => (
    fetch(`${API_BASE}/${record.certificateId}/notify`, { method: "POST" })
  )));

  await refreshRecordsOnly();
}

async function refreshRecordsOnly() {
  const response = await fetch(API_BASE);
  const data = await response.json();

  if (response.ok) {
    certificateRecords = data;
    renderCertificates(getVisibleCertificates());
  }
}


function markCertificateApproved(certificateId, updatedCertificate) {
  certificateRecords = certificateRecords.map((record) => {
    if (String(record.certificateId) !== String(certificateId)) return record;

    return {
      ...record,
      ...updatedCertificate,
      status: "Approved"
    };
  });

  renderCertificates(getVisibleCertificates());
}
function markCertificateDisapproved(certificateId, updatedCertificate) {
  certificateRecords = certificateRecords.map((record) => {
    if (String(record.certificateId) !== String(certificateId)) return record;

    return {
      ...record,
      ...updatedCertificate,
      status: "Rejected"
    };
  });

  renderCertificates(getVisibleCertificates());
}
async function handleAction(action, certificateId) {
  if (action === "view") {
    const record = certificateRecords.find((item) => String(item.certificateId) === String(certificateId));
    if (record) showCertificateModal(record);
    return;
  }

  if (action === "delete" && !window.confirm("Delete this certificate record?")) {
    return;
  }

  if (action === "disapprove" && !window.confirm("Disapprove this certificate and notify the vendor?")) {
    return;
  }

  const url = action === "delete"
    ? `${API_BASE}/${certificateId}`
    : `${API_BASE}/${certificateId}/${action}`;
  const method = action === "delete" ? "DELETE" : (action === "approve" || action === "disapprove") ? "PUT" : "POST";

  try {
    const response = await fetch(url, { method });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Action failed.");
    }

    certificateStatus.textContent = data.message;

    if (action === "approve") {
      markCertificateApproved(certificateId, data.certificate);
      return;
    }

    if (action === "disapprove") {
      markCertificateDisapproved(certificateId, data.certificate);
      return;
    }

    await refreshRecordsOnly();
  } catch (error) {
    certificateStatus.textContent = error.message || "Action failed.";
  }
}

loadCertificates();



