// NEA profile logic: retrieves and renders the signed-in officer's information.
const profileName = document.getElementById("profileName");
const profileRole = document.getElementById("profileRole");
const statusMessage = document.getElementById("statusMessage");
const profileDetails = document.getElementById("profileDetails");
const avatarInitials = document.getElementById("avatarInitials");
const profilePhotoInput = document.getElementById("profilePhotoInput");
const profilePhotoPreview = document.getElementById("profilePhotoPreview");
const settingsToggle = document.getElementById("settingsToggle");
const settingsMenu = document.getElementById("settingsMenu");

const officerId = document.getElementById("officerId");
const officerIdCard = document.getElementById("officerIdCard");
const email = document.getElementById("email");
const emailCard = document.getElementById("emailCard");
const phone = document.getElementById("phone");
const assignedArea = document.getElementById("assignedArea");
const assignedAreaCard = document.getElementById("assignedAreaCard");

const inspectionsMonth = document.getElementById("inspectionsMonth");
const pendingReview = document.getElementById("pendingReview");
const complianceRate = document.getElementById("complianceRate");
const advisoriesIssued = document.getElementById("advisoriesIssued");
const assignedInspections = document.getElementById("assignedInspections");
const pendingFollowUps = document.getElementById("pendingFollowUps");
const resolvedCases = document.getElementById("resolvedCases");

function isThisMonth(dateValue) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function isCheckedStall(stall) {
  return Boolean(stall.hygiene_id || stall.hygiene_grade || stall.inspection_date);
}

function getCertificateGroup(certificate) {
  const status = String(certificate.status || "").toLowerCase();
  if (status === "approved") return "approved";
  if (status === "rejected") return "disapproved";
  return "pending";
}

async function fetchJsonOrEmpty(url) {
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

async function loadProfileWorkSummary() {
  const [hygieneResult, cleaningResult, certificatesResult, complaintsResult] = await Promise.allSettled([
    fetchJsonOrEmpty("/api/nea-officer/hygiene"),
    fetchJsonOrEmpty("/api/nea-officer/cleaning-submissions"),
    fetchJsonOrEmpty("/api/nea-officer/certificates"),
    fetchJsonOrEmpty("/api/nea-officer/complaints")
  ]);

  const hygieneRecords = hygieneResult.status === "fulfilled" ? hygieneResult.value : [];
  const cleaningRecords = cleaningResult.status === "fulfilled" ? cleaningResult.value : [];
  const certificateRecords = certificatesResult.status === "fulfilled" ? certificatesResult.value : [];
  const complaintRecords = complaintsResult.status === "fulfilled" ? complaintsResult.value : [];

  const checkedStalls = hygieneRecords.filter(isCheckedStall);
  const inspectionsThisMonth = checkedStalls.filter((stall) => isThisMonth(stall.inspection_date)).length;
  const compliantStalls = checkedStalls.filter((stall) => ["A", "B"].includes(String(stall.hygiene_grade || "").toUpperCase())).length;
  const compliancePercent = checkedStalls.length ? Math.round((compliantStalls / checkedStalls.length) * 100) : 0;

  const pendingCleaning = cleaningRecords.filter((record) => record.status === "pending").length;
  const resolvedCleaning = cleaningRecords.filter((record) => ["approved", "rejected"].includes(record.status)).length;
  const rejectedCleaning = cleaningRecords.filter((record) => record.status === "rejected").length;

  const pendingCertificates = certificateRecords.filter((record) => getCertificateGroup(record) === "pending").length;
  const approvedCertificates = certificateRecords.filter((record) => getCertificateGroup(record) === "approved").length;
  const disapprovedCertificates = certificateRecords.filter((record) => getCertificateGroup(record) === "disapproved").length;
  const certificateAdvisories = certificateRecords.filter((record) => (
    record.notificationStatus === "Sent" || record.notificationDue || record.rejectionNotificationSentAt
  )).length;

  inspectionsMonth.textContent = inspectionsThisMonth;
  pendingReview.textContent = pendingCleaning + pendingCertificates + complaintRecords.length;
  complianceRate.textContent = `${compliancePercent}%`;
  advisoriesIssued.textContent = certificateAdvisories + rejectedCleaning + disapprovedCertificates;
  assignedInspections.textContent = hygieneRecords.length;
  pendingFollowUps.textContent = pendingCleaning + pendingCertificates + complaintRecords.length;
  resolvedCases.textContent = resolvedCleaning + approvedCertificates + disapprovedCertificates;
}

function getInitials(name) {
  if (!name) return "NEA";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function setSignedOutValues(message) {
  statusMessage.textContent = message;
  statusMessage.classList.remove("success");
  statusMessage.classList.add("error");
  statusMessage.hidden = false;

  profileName.textContent = "Not signed in";
  profileRole.textContent = "-";
  avatarInitials.textContent = "-";
  avatarInitials.hidden = false;
  profilePhotoPreview.hidden = true;

  officerId.textContent = "-";
  officerIdCard.textContent = "-";
  email.textContent = "-";
  emailCard.textContent = "-";
  phone.textContent = "-";
  assignedArea.textContent = "-";
  assignedAreaCard.textContent = "-";

  inspectionsMonth.textContent = "-";
  pendingReview.textContent = "-";
  complianceRate.textContent = "-";
  advisoriesIssued.textContent = "-";
  assignedInspections.textContent = "-";
  pendingFollowUps.textContent = "-";
  resolvedCases.textContent = "-";

  profileDetails.hidden = false;
}

function setSignedInValues(data) {
  profileName.textContent = data.full_name;
  profileRole.textContent = data.role || "NEA Officer";
  avatarInitials.textContent = getInitials(data.full_name);

  officerId.textContent = data.officer_id;
  officerIdCard.textContent = data.officer_id;
  email.textContent = data.email || "Not added";
  emailCard.textContent = data.email || "Not added";
  phone.textContent = data.phone || "Not added";
  assignedArea.textContent = data.assigned_area || "Not assigned";
  assignedAreaCard.textContent = data.assigned_area || "Not assigned";

  inspectionsMonth.textContent = "...";
  pendingReview.textContent = "...";
  complianceRate.textContent = "...";
  advisoriesIssued.textContent = "...";
  assignedInspections.textContent = "...";
  pendingFollowUps.textContent = "...";
  resolvedCases.textContent = "...";

  statusMessage.hidden = true;
  profileDetails.hidden = false;
}

async function loadOfficerProfile() {
  try {
    const response = await fetch("/api/nea-officer/profile");
    const data = await response.json();

    if (!response.ok) {
      setSignedOutValues(data.message || "No NEA officer logged in");
      return;
    }

    setSignedInValues(data);
    await loadProfileWorkSummary();
  } catch (error) {
    setSignedOutValues("The profile server could not be reached.");
  }
}

profilePhotoInput.addEventListener("change", () => {
  const file = profilePhotoInput.files[0];

  if (!file) return;

  profilePhotoPreview.src = URL.createObjectURL(file);
  profilePhotoPreview.hidden = false;
  avatarInitials.hidden = true;
});

if (settingsToggle && settingsMenu) {
  settingsToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = settingsMenu.hidden;
    settingsMenu.hidden = !isOpen;
    settingsToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (settingsMenu.hidden) return;
    if (settingsMenu.contains(event.target)) return;
    settingsMenu.hidden = true;
    settingsToggle.setAttribute("aria-expanded", "false");
  });
}

loadOfficerProfile();
