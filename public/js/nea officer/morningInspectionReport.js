// NEA morning-report logic: validates and submits inspection report details.
const morningInspectionForm = document.getElementById("morningInspectionForm");
const formStatus = document.getElementById("formStatus");
const hawkerCentreInput = document.querySelector('input[name="hawkerCentre"]');
const stallNameInput = document.querySelector('input[name="stallName"]');
const notesInput = document.querySelector('textarea[name="notes"]');
const dateInput = document.querySelector('input[name="inspectionDate"]');
const timeInput = document.querySelector('input[name="inspectionTime"]');
const reportParams = new URLSearchParams(window.location.search);

function setDefaultInspectionDateTime() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5);

  if (dateInput && !dateInput.value) {
    dateInput.value = date;
  }

  if (timeInput && !timeInput.value) {
    timeInput.value = time;
  }
}

setDefaultInspectionDateTime();

function setFieldValue(input, value) {
  if (input && value && !input.value) {
    input.value = value;
  }
}

async function loadInspectionContext() {
  const stallId = reportParams.get("stallId");
  const complaintId = reportParams.get("complaintId");
  const complaintText = reportParams.get("complaint");

  setFieldValue(stallNameInput, reportParams.get("stallName"));
  setFieldValue(hawkerCentreInput, reportParams.get("hawkerCentre"));

  if (complaintText && notesInput && !notesInput.value) {
    notesInput.value = `Inspection opened from hygiene complaint${complaintId ? ` #${complaintId}` : ""}: ${complaintText}`;
  }

  if (complaintId && formStatus) {
    formStatus.textContent = `Opened from hygiene complaint #${complaintId}. Complete the morning inspection report below.`;
  }

  if (!stallId) return;

  try {
    const response = await fetch("/api/nea-officer/hygiene", { credentials: "include" });
    if (!response.ok) return;

    const stalls = await response.json();
    const stall = Array.isArray(stalls)
      ? stalls.find((item) => String(item.stall_id) === String(stallId))
      : null;

    if (!stall) return;

    setFieldValue(stallNameInput, stall.stall_name);
    setFieldValue(hawkerCentreInput, stall.location);
  } catch (error) {
    // The report still works with the values passed through the URL.
  }
}

loadInspectionContext();

if (morningInspectionForm && formStatus) {
  morningInspectionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "Morning inspection report is ready for officer records.";
  });
}
