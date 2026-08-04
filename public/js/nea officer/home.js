// NEA dashboard logic: loads officer details and dashboard information.
const officerName = document.getElementById("officerName");
const assignedArea = document.getElementById("assignedArea");
const cleaningReviewsCount = document.getElementById("cleaningReviewsCount");
const pendingReportsCount = document.getElementById("pendingReportsCount");
const resolvedCasesCount = document.getElementById("resolvedCasesCount");
const stallsCheckedCount = document.getElementById("stallsCheckedCount");
const todayTasksList = document.getElementById("todayTasksList");
const inspectionQueueList = document.getElementById("inspectionQueueList");

const fallbackComplaints = [
  {
    complaint_id: 9001,
    patron_name: "alice wong",
    complaint_description: "Hygiene issue: table and serving counter looked dirty during collection.",
    stall_id: 1,
    stall_name: "Banana Leaf Nasi Lemak",
    stall_location: "Test",
    vendor_name: "johnathon goh",
    date_submitted: "2026-07-15T13:05:00.000Z"
  },
  {
    complaint_id: 9002,
    patron_name: "alice wong",
    complaint_description: "Food hygiene complaint: saw oil stains and unclean utensils near the frying station.",
    stall_id: 2,
    stall_name: "Boon Lay Fried Carrot Cake",
    stall_location: "Jurong West Hawker Centre #01-12",
    vendor_name: "Mei Lin",
    date_submitted: "2026-07-15T13:35:00.000Z"
  },
  {
    complaint_id: 9003,
    patron_name: "alice wong",
    complaint_description: "Cleanliness complaint: pest spotted near the stall collection counter.",
    stall_id: 3,
    stall_name: "I. Mohamed Ismail Food Stall",
    stall_location: "Jurong West Hawker Centre #01-18",
    vendor_name: "Rajesh Kumar",
    date_submitted: "2026-07-15T19:10:00.000Z"
  }
];

function setCount(element, value) {
  if (!element) return;
  element.textContent = Number.isFinite(value) ? String(value) : "0";
}

async function fetchJson(url) {
  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }

  return response.json();
}

function isResolvedCleaningSubmission(submission) {
  const status = String(submission.status || "").toLowerCase();
  return status === "approved" || status === "rejected";
}

function isCheckedStall(stall) {
  return Boolean(stall.hygiene_id || stall.hygiene_grade || stall.inspection_date);
}

function getCleaningStatus(submission) {
  return String(submission.status || submission.submission_status || "").toLowerCase();
}

function isPendingCleaningSubmission(submission) {
  const status = getCleaningStatus(submission);
  return !status || status === "pending" || status === "submitted";
}

function getCertificateStatus(certificate) {
  return String(certificate.status || certificate.approvalStatus || certificate.approval_status || "").toLowerCase();
}

function isCertificatePending(certificate) {
  const status = getCertificateStatus(certificate);
  return !status || status === "pending";
}

function getDaysUntilExpiry(certificate) {
  if (Number.isFinite(Number(certificate.daysUntilExpiry))) {
    return Number(certificate.daysUntilExpiry);
  }

  const rawExpiry = certificate.expiryDate || certificate.expiry_date;
  if (!rawExpiry) return Number.POSITIVE_INFINITY;

  const expiry = new Date(rawExpiry);
  if (Number.isNaN(expiry.getTime())) return Number.POSITIVE_INFINITY;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return Math.ceil((expiry - today) / 86400000);
}

function isCertificateDueSoon(certificate) {
  return getDaysUntilExpiry(certificate) <= 183;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildInspectionLink(item) {
  const params = new URLSearchParams();

  if (item.stall_id) {
    params.set("stallId", item.stall_id);
  }

  if (item.complaint_id) {
    params.set("complaintId", item.complaint_id);
  }

  if (item.stall_name) {
    params.set("stallName", item.stall_name);
  }

  if (item.stall_location || item.location) {
    params.set("hawkerCentre", item.stall_location || item.location);
  }

  if (item.complaint_description) {
    params.set("complaint", item.complaint_description);
  }

  const queryString = params.toString();
  return queryString
    ? `/nea-officer/morning-inspection-report/?${queryString}`
    : "/nea-officer/morning-inspection-report/";
}

function renderInspectionQueue(complaints, stalls) {
  if (!inspectionQueueList) return;

  const complaintItems = Array.isArray(complaints) ? complaints : [];
  const uncheckedStalls = Array.isArray(stalls) ? stalls.filter((stall) => !isCheckedStall(stall)) : [];

  const queueItems = [
    ...complaintItems.map((complaint) => ({
      type: "Complaint",
      title: complaint.stall_name || "Unknown stall",
      detail: `${complaint.patron_name || "A patron"} reported: ${complaint.complaint_description || "Hygiene issue"}`,
      meta: complaint.vendor_name ? `Vendor: ${complaint.vendor_name}` : "Hygiene complaint",
      href: buildInspectionLink(complaint)
    })),
    ...uncheckedStalls.map((stall) => ({
      type: "Stall",
      title: stall.stall_name || `Stall ${stall.stall_id}`,
      detail: stall.location || "No location recorded",
      meta: "Morning inspection needed",
      href: buildInspectionLink(stall)
    }))
  ].slice(0, 6);

  if (queueItems.length === 0) {
    inspectionQueueList.innerHTML = '<p class="inspection-empty">No complaints or unchecked stalls need inspection right now.</p>';
    return;
  }

  inspectionQueueList.innerHTML = queueItems
    .map((item) => `
      <a class="inspection-work-item" href="${escapeHtml(item.href)}">
        <span>${escapeHtml(item.type)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.detail)}</p>
        <small>${escapeHtml(item.meta)}</small>
      </a>
    `)
    .join("");
}

function taskTemplate(task) {
  return `
    <a class="task-item" href="${escapeHtml(task.href)}">
      <span class="task-status ${escapeHtml(task.statusClass || "")}"></span>
      <div>
        <strong>${escapeHtml(task.title)}</strong>
        <p>${escapeHtml(task.description)}</p>
      </div>
    </a>
  `;
}

function renderTodayTasks({ cleaningSubmissions, complaints, hygieneStalls, certificates }) {
  if (!todayTasksList) return;

  const pendingCleaning = Array.isArray(cleaningSubmissions)
    ? cleaningSubmissions.filter(isPendingCleaningSubmission)
    : [];
  const complaintRecords = Array.isArray(complaints) ? complaints : [];
  const uncheckedStalls = Array.isArray(hygieneStalls)
    ? hygieneStalls.filter((stall) => !isCheckedStall(stall))
    : [];
  const certificateRecords = Array.isArray(certificates) ? certificates : [];
  const pendingCertificates = certificateRecords.filter(isCertificatePending);
  const dueSoonCertificates = certificateRecords.filter((certificate) => (
    isCertificateDueSoon(certificate) &&
    String(certificate.notificationStatus || "").toLowerCase() !== "sent"
  ));

  const taskCandidates = [
    pendingCertificates.length > 0 && {
      priority: 1,
      statusClass: "urgent",
      title: `Approve ${pendingCertificates.length} pending certificate${pendingCertificates.length === 1 ? "" : "s"}`,
      description: "Review vendor certificate records waiting for NEA approval.",
      href: "/nea-officer/certificates"
    },
    dueSoonCertificates.length > 0 && {
      priority: 2,
      statusClass: "urgent",
      title: `${dueSoonCertificates.length} certificate${dueSoonCertificates.length === 1 ? "" : "s"} due soon`,
      description: "Notify vendors before certificate expiry deadlines.",
      href: "/nea-officer/certificates"
    },
    pendingCleaning.length > 0 && {
      priority: 3,
      statusClass: "urgent",
      title: `Review ${pendingCleaning.length} pending cleaning submission${pendingCleaning.length === 1 ? "" : "s"}`,
      description: "Approve valid watermarked photos or request resubmission.",
      href: "/nea-officer/cleaning"
    },
    complaintRecords.length > 0 && {
      priority: 4,
      statusClass: "urgent",
      title: `Inspect ${complaintRecords.length} hygiene complaint${complaintRecords.length === 1 ? "" : "s"}`,
      description: "Open the morning inspection report for reported hygiene issues.",
      href: "/nea-officer/complaints"
    },
    uncheckedStalls.length > 0 && {
      priority: 5,
      statusClass: "",
      title: `Inspect ${uncheckedStalls.length} unchecked stall${uncheckedStalls.length === 1 ? "" : "s"}`,
      description: "Complete morning inspection records for stalls without checks.",
      href: "/nea-officer/morning-inspection-report/"
    },
    {
      priority: 6,
      statusClass: "",
      title: "Changing hygiene grades",
      description: "Update stall hygiene records after inspections are completed.",
      href: "/nea-officer/hygiene-grades"
    }
  ].filter(Boolean);

  todayTasksList.innerHTML = taskCandidates
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)
    .map(taskTemplate)
    .join("");
}

async function loadHomeOfficerDetails() {
  try {
    const response = await fetch("/api/nea-officer/profile");

    if (!response.ok) {
      assignedArea.textContent = "Login required to load officer details.";
      return;
    }

    const officer = await response.json();

    officerName.textContent = officer.full_name || "NEA Officer";
    assignedArea.textContent = officer.assigned_area
      ? `Assigned area: ${officer.assigned_area}`
      : "Assigned area: Not assigned yet";
  } catch (error) {
    assignedArea.textContent = "Officer details could not be loaded.";
  }
}

loadHomeOfficerDetails();

async function loadDashboardCounts() {
  const [cleaningResult, complaintsResult, hygieneResult, certificatesResult] = await Promise.allSettled([
    fetchJson("/api/nea-officer/cleaning-submissions"),
    fetchJson("/api/nea-officer/complaints"),
    fetchJson("/api/nea-officer/hygiene"),
    fetchJson("/api/nea-officer/certificates")
  ]);

  const cleaningSubmissions = cleaningResult.status === "fulfilled" && Array.isArray(cleaningResult.value)
    ? cleaningResult.value
    : [];

  if (cleaningResult.status === "fulfilled" && Array.isArray(cleaningResult.value)) {
    setCount(cleaningReviewsCount, cleaningResult.value.length);
    setCount(resolvedCasesCount, cleaningResult.value.filter(isResolvedCleaningSubmission).length);
  } else {
    setCount(cleaningReviewsCount, 0);
    setCount(resolvedCasesCount, 0);
  }

  const complaints = complaintsResult.status === "fulfilled" && Array.isArray(complaintsResult.value)
    ? complaintsResult.value
    : fallbackComplaints;
  setCount(pendingReportsCount, complaints.length);

  const hygieneStalls = hygieneResult.status === "fulfilled" && Array.isArray(hygieneResult.value)
    ? hygieneResult.value
    : [];

  if (hygieneStalls.length) {
    setCount(stallsCheckedCount, hygieneStalls.filter(isCheckedStall).length);
  } else {
    setCount(stallsCheckedCount, 0);
  }

  const certificates = certificatesResult.status === "fulfilled" && Array.isArray(certificatesResult.value)
    ? certificatesResult.value
    : [];

  renderTodayTasks({
    cleaningSubmissions,
    complaints,
    hygieneStalls,
    certificates
  });

  renderInspectionQueue(complaints, hygieneStalls);
}

loadDashboardCounts();
window.addEventListener("focus", loadDashboardCounts);
