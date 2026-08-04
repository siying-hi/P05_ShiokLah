// NEA complaint logic: loads complaint records and supports officer case actions.
const complaintsTableBody = document.getElementById("complaintsTableBody");
const complaintsStatus = document.getElementById("complaintsStatus");
const refreshBtn = document.getElementById("refreshBtn");
const searchInput = document.getElementById("searchInput");
const complaintsCount = document.getElementById("complaintsCount");
let allComplaints = [];

const fallbackComplaints = [
  {
    complaint_id: 9001,
    order_id: 1,
    patron_id: 1,
    patron_name: "alice wong",
    patron_email: "alicewong@gmail.com",
    complaint_description: "Hygiene issue: table and serving counter looked dirty during collection.",
    date_submitted: "2026-07-15T13:05:00.000Z",
    item_name: "Chicken Curry",
    stall_id: 1,
    stall_name: "Banana Leaf Nasi Lemak",
    stall_location: "Test",
    vendor_id: 1,
    vendor_name: "johnathon goh",
    vendor_email: "johnathonwong@gmail.com"
  },
  {
    complaint_id: 9002,
    order_id: 2,
    patron_id: 1,
    patron_name: "alice wong",
    patron_email: "alicewong@gmail.com",
    complaint_description: "Food hygiene complaint: saw oil stains and unclean utensils near the frying station.",
    date_submitted: "2026-07-15T13:35:00.000Z",
    item_name: "White Carrot Cake",
    stall_id: 2,
    stall_name: "Boon Lay Fried Carrot Cake",
    stall_location: "Jurong West Hawker Centre #01-12",
    vendor_id: 2,
    vendor_name: "Mei Lin",
    vendor_email: "meilin@example.com"
  },
  {
    complaint_id: 9003,
    order_id: 3,
    patron_id: 1,
    patron_name: "alice wong",
    patron_email: "alicewong@gmail.com",
    complaint_description: "Cleanliness complaint: pest spotted near the stall collection counter.",
    date_submitted: "2026-07-15T19:10:00.000Z",
    item_name: "Butter Chicken Curry",
    stall_id: 3,
    stall_name: "I. Mohamed Ismail Food Stall",
    stall_location: "Jurong West Hawker Centre #01-18",
    vendor_id: 3,
    vendor_name: "Rajesh Kumar",
    vendor_email: "rajesh@example.com"
  }
];
 
function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
 
  return date.toLocaleString("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildInspectionLink(complaint) {
  const params = new URLSearchParams();

  if (complaint.stall_id) {
    params.set("stallId", complaint.stall_id);
  }

  if (complaint.complaint_id) {
    params.set("complaintId", complaint.complaint_id);
  }

  if (complaint.stall_name) {
    params.set("stallName", complaint.stall_name);
  }

  if (complaint.stall_location) {
    params.set("hawkerCentre", complaint.stall_location);
  }

  if (complaint.complaint_description) {
    params.set("complaint", complaint.complaint_description);
  }

  const queryString = params.toString();
  return queryString
    ? `/nea-officer/morning-inspection-report/?${queryString}`
    : "/nea-officer/morning-inspection-report/";
}
 
function renderComplaints(complaints) {
  complaintsTableBody.innerHTML = "";
  complaintsCount.textContent = complaints?.length || 0;
 
  if (!complaints || complaints.length === 0) {
    complaintsStatus.textContent = allComplaints.length ? "No complaints match your search." : "No complaints found.";
    complaintsStatus.hidden = false;
    return;
  }
 
  complaintsStatus.hidden = true;
 
  complaints.forEach((complaint) => {
    const row = document.createElement("tr");
 
    row.innerHTML = `
      <td>${escapeHtml(complaint.complaint_id)}</td>
      <td>
        <strong>${escapeHtml(complaint.patron_name || `Patron ${complaint.patron_id}`)}</strong>
        <span>${escapeHtml(complaint.patron_email || "")}</span>
      </td>
      <td>
        <strong>${escapeHtml(complaint.stall_name || "Unknown stall")}</strong>
        <span>${escapeHtml(complaint.stall_location || "")}</span>
      </td>
      <td>
        <strong>${escapeHtml(complaint.vendor_name || `Vendor ${complaint.vendor_id}`)}</strong>
        <span>${escapeHtml(complaint.vendor_email || "")}</span>
      </td>
      <td>
        <strong>${escapeHtml(complaint.item_name || "Order item")}</strong>
        <span>Order #${escapeHtml(complaint.order_id)}</span>
      </td>
      <td>${escapeHtml(complaint.complaint_description || "No description provided")}</td>
      <td>${escapeHtml(formatDate(complaint.date_submitted))}</td>
      <td>
        <a class="inspect-button" href="${escapeHtml(buildInspectionLink(complaint))}">Inspect</a>
      </td>
    `;
 
    complaintsTableBody.appendChild(row);
  });
}

function filterComplaints() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    renderComplaints(allComplaints);
    return;
  }

  renderComplaints(allComplaints.filter((complaint) => [
    complaint.complaint_id,
    complaint.patron_name,
    complaint.patron_email,
    complaint.stall_name,
    complaint.stall_location,
    complaint.vendor_name,
    complaint.vendor_email,
    complaint.item_name,
    complaint.complaint_description
  ].some((value) => String(value || "").toLowerCase().includes(query))));
}
 
async function loadComplaints() {
  complaintsStatus.textContent = "Loading complaints...";
  complaintsStatus.hidden = false;
  complaintsTableBody.innerHTML = "";
 
  try {
    const response = await fetch("/api/nea-officer/complaints");
 
    if (!response.ok) {
      complaintsStatus.textContent = "Showing sample hygiene complaints.";
      allComplaints = fallbackComplaints;
      filterComplaints();
      return;
    }
 
    const complaints = await response.json();
    allComplaints = complaints.length ? complaints : fallbackComplaints;
    filterComplaints();
  } catch (error) {
    complaintsStatus.textContent = "Showing sample hygiene complaints.";
    allComplaints = fallbackComplaints;
    filterComplaints();
  }
}
 
refreshBtn.addEventListener("click", loadComplaints);
searchInput.addEventListener("input", filterComplaints);
 
loadComplaints();
