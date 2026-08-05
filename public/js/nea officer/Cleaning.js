// NEA cleaning-review logic: displays evidence and processes officer decisions.
const API_BASE = "/api/nea-officer/cleaning-submissions";

let vendors = [];
const state = { filter: "all", sort: "date-desc" };

const grid = document.getElementById("grid");
const tabsEl = document.getElementById("tabs");
const sortSelect = document.getElementById("sortSelect");
const cardTemplate = document.getElementById("cardTemplate");
const emptyTemplate = document.getElementById("emptyState");
const reviewStatus = document.getElementById("reviewStatus");
const photoModal = document.getElementById("photoModal");
const photoModalTitle = document.getElementById("photoModalTitle");
const photoModalMeta = document.getElementById("photoModalMeta");
const photoModalImage = document.getElementById("photoModalImage");
const photoModalWatermark = document.getElementById("photoModalWatermark");
const photoModalDetails = document.getElementById("photoModalDetails");
const photoModalGallery = document.getElementById("photoModalGallery");
const closePhotoModal = document.getElementById("closePhotoModal");
const modalApproveBtn = document.getElementById("modalApproveBtn");
const modalRejectBtn = document.getElementById("modalRejectBtn");
const reviewModal = document.getElementById("reviewModal");
const reviewModalTitle = document.getElementById("reviewModalTitle");
const reviewModalStall = document.getElementById("reviewModalStall");
const closeReviewModal = document.getElementById("closeReviewModal");
const reviewForm = document.getElementById("reviewForm");
const reviewReason = document.getElementById("reviewReason");
const rejectDueDateRow = document.getElementById("rejectDueDateRow");
const reviewDueDate = document.getElementById("reviewDueDate");
const reviewFormError = document.getElementById("reviewFormError");
const cancelReviewBtn = document.getElementById("cancelReviewBtn");
const submitReviewBtn = document.getElementById("submitReviewBtn");

let activeReviewVendorId = null;
let pendingDecision = null;

const submittedCleaningPhotoMap = {
  "banana leaf nasi lemak picture.jpg": "/images/cleaning-submissions/banana-leaf-cleaning-watermarked-1.svg",
  "set meal a picture.jpg": "/images/cleaning-submissions/banana-leaf-before-watermarked.svg",
  "boon lay fried carrot cake & kway teow mee picture.jpg": "/images/cleaning-submissions/boon-lay-counter-watermarked.svg",
  "i.mohamed ismail food stall picture.jpg": "/images/cleaning-submissions/ismail-counter-missing-watermark.svg",
  "black carrot cake picture.jpg": "/images/cleaning-submissions/boon-lay-deep-clean-before.svg"
};

function fmtDate(value) {
  if (!value) return "No date";
  const dt = new Date(`${value}T00:00:00`);
  return dt.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });
}

function defaultRejectDueDate() {
  const due = new Date();
  due.setDate(due.getDate() + 3);
  return due.toISOString().split("T")[0];
}

function isOnTime(vendor) {
  if (!vendor.cleaningDate || !vendor.dueDate) return true;
  return vendor.cleaningDate <= vendor.dueDate;
}

function setStatus(message, type = "info") {
  if (!reviewStatus) return;
  reviewStatus.textContent = message || "";
  reviewStatus.className = `review-status ${message ? "visible" : ""} ${type}`.trim();
}

function submittedPhotoUrl(vendor) {
  if (!vendor.photoUrl) return "";

  const filename = String(vendor.photoUrl).split("/").pop().toLowerCase();
  return submittedCleaningPhotoMap[filename] || vendor.photoUrl;
}

function buildWatermark(vendor) {
  const tile = document.createElement("div");
  tile.className = "watermark-tile";
  const label = `NEA VERIFIED - ${vendor.vendorId} - ${fmtDate(vendor.cleaningDate)}`;

  for (let i = 0; i < 12; i += 1) {
    const span = document.createElement("span");
    span.textContent = label;
    tile.appendChild(span);
  }

  return tile;
}

function fillWatermarkTile(tile, vendor) {
  tile.innerHTML = "";
  const label = `NEA VERIFIED - ${vendor.vendorId} - ${fmtDate(vendor.cleaningDate)}`;

  for (let i = 0; i < 18; i += 1) {
    const span = document.createElement("span");
    span.textContent = label;
    tile.appendChild(span);
  }
}

function openPhotoModal(vendor) {
  const normalizedStatus = String(vendor.status || "pending").toLowerCase();
  const disabled = normalizedStatus !== "pending";
  const reviewPhotoUrl = submittedPhotoUrl(vendor);

  activeReviewVendorId = vendor.id;
  photoModalTitle.textContent = vendor.stall;
  photoModalMeta.textContent = `${vendor.vendorName} | ${fmtDate(vendor.cleaningDate)} | ${vendor.status}`;
  photoModalDetails.innerHTML = `
    <p><b>Cleaning type:</b> ${vendor.schedule || "Not provided"}</p>
    <p><b>Cleaning time:</b> ${vendor.cleaningTime || "Not provided"}</p>
    <p><b>Description:</b> ${vendor.cleaningDescription || "Not provided"}</p>
    <p><b>Reason for submission:</b> ${vendor.submissionReason || "Not provided"}</p>`;
  const allPhotos = vendor.photoUrls?.length ? vendor.photoUrls : (reviewPhotoUrl ? [reviewPhotoUrl] : []);
  photoModalGallery.innerHTML = "";
  allPhotos.forEach((url, index) => {
    const button = document.createElement("button");
    button.type = "button";
    const thumb = document.createElement("img");
    thumb.src = url;
    thumb.alt = `Submitted photo ${index + 1}`;
    button.appendChild(thumb);
    button.addEventListener("click", () => { photoModalImage.src = url; });
    photoModalGallery.appendChild(button);
  });

  if (reviewPhotoUrl) {
    photoModalImage.src = reviewPhotoUrl;
    photoModalImage.alt = `Large cleaning photo submitted by ${vendor.stall}`;
    photoModalImage.hidden = false;
  } else {
    photoModalImage.src = "";
    photoModalImage.alt = "";
    photoModalImage.hidden = true;
  }

  photoModalWatermark.hidden = true;
  if (modalApproveBtn) modalApproveBtn.disabled = disabled;
  if (modalRejectBtn) modalRejectBtn.disabled = disabled;
  photoModal.classList.toggle("no-photo", !reviewPhotoUrl);
  photoModal.hidden = false;
}

function closePhotoPreview() {
  activeReviewVendorId = null;
  photoModal.hidden = true;
  photoModalImage.src = "";
}

function buildCard(vendor) {
  const node = cardTemplate.content.cloneNode(true);
  const card = node.querySelector(".card");
  const normalizedStatus = String(vendor.status || "pending").toLowerCase();
  const disabled = normalizedStatus !== "pending";
  const onTime = isOnTime(vendor);

  card.dataset.id = vendor.id;

  const photoWrap = node.querySelector(".photo-wrap");
  const img = node.querySelector(".photo-wrap img");
  const reviewPhotoUrl = submittedPhotoUrl(vendor);
  if (reviewPhotoUrl) {
    img.src = reviewPhotoUrl;
    img.alt = `Cleaning photo submitted by ${vendor.stall}`;
    img.title = "Open photo to inspect watermark";
  } else {
    img.removeAttribute("src");
    img.alt = "No picture submitted";
    img.hidden = true;
    const missing = document.createElement("div");
    missing.className = "missing-photo";
    missing.textContent = "No picture submitted";
    photoWrap.appendChild(missing);
  }
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", `Open ${vendor.stall} cleaning submission to inspect watermark`);
  card.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    openPhotoModal(vendor);
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPhotoModal(vendor);
    }
  });

  const badge = node.querySelector(".badge");
  badge.textContent = normalizedStatus;
  badge.classList.add(normalizedStatus);

  node.querySelector(".stall-name").textContent = vendor.stall;
  node.querySelector(".stall-no").textContent = `Stall ${vendor.stallNo}`;
  node.querySelector(".vendor-id").textContent = vendor.vendorId;
  node.querySelector(".schedule-text").textContent = `Schedule: ${vendor.schedule}`;

  const ontimeEl = node.querySelector(".ontime-text");
  ontimeEl.textContent = `${onTime ? "On time" : "Late"} - ${fmtDate(vendor.cleaningDate)}`;
  ontimeEl.classList.add(onTime ? "ok" : "late");

  const approveBtn = node.querySelector(".btn.approve");
  const rejectBtn = node.querySelector(".btn.reject");
  approveBtn.disabled = disabled;
  rejectBtn.disabled = disabled;
  approveBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    openReviewForm(vendor.id, "approved");
  });
  rejectBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    openReviewForm(vendor.id, "rejected");
  });

  const note = node.querySelector(".decided-note");
  if (disabled) {
    const reviewedText = vendor.reviewDate ? ` on ${vendor.reviewDate}` : "";
    note.textContent = `Marked ${normalizedStatus}${reviewedText}. Officer review complete.`;
  }

  return node;
}

function render() {
  grid.innerHTML = "";

  const list = vendors
    .filter((vendor) => state.filter === "all" || vendor.status === state.filter)
    .sort((a, b) => {
      if (state.sort === "date-desc") return String(b.cleaningDate || "").localeCompare(String(a.cleaningDate || ""));
      if (state.sort === "date-asc") return String(a.cleaningDate || "").localeCompare(String(b.cleaningDate || ""));
      if (state.sort === "stall") return String(a.stall || "").localeCompare(String(b.stall || ""));
      return 0;
    });

  if (list.length === 0) {
    grid.appendChild(emptyTemplate.content.cloneNode(true));

    if (vendors.length === 0) {
      const h3 = grid.querySelector(".empty h3");
      const p = grid.querySelector(".empty p");
      if (h3) h3.textContent = "No cleaning submissions yet";
      if (p) p.textContent = "Once vendors upload their watermarked cleaning photos, they will appear here for you to review.";
    }

    return;
  }

  list.forEach((vendor) => grid.appendChild(buildCard(vendor)));
}

function openReviewForm(id, status) {
  const vendor = vendors.find((item) => item.id === id);
  if (!vendor) return;

  const isReject = status === "rejected";
  pendingDecision = { id, status };
  reviewForm.reset();
  reviewFormError.hidden = true;
  reviewModalTitle.textContent = isReject ? "Reject Submission" : "Approve Submission";
  reviewModalStall.textContent = `${vendor.stall} · ${vendor.vendorName}`;
  rejectDueDateRow.hidden = !isReject;
  reviewDueDate.required = isReject;
  reviewDueDate.value = isReject ? defaultRejectDueDate() : "";
  submitReviewBtn.textContent = isReject ? "Reject Submission" : "Approve Submission";
  submitReviewBtn.classList.toggle("reject", isReject);
  reviewModal.hidden = false;
  reviewReason.focus();
}

function closeReviewForm() {
  pendingDecision = null;
  reviewModal.hidden = true;
  reviewForm.reset();
  reviewFormError.hidden = true;
}

async function submitDecision(event) {
  event.preventDefault();
  if (!pendingDecision) return;

  const { id, status } = pendingDecision;
  const vendor = vendors.find((item) => item.id === id);
  const reason = reviewReason.value.trim();

  if (!vendor || !reason) {
    reviewFormError.textContent = "Please enter a reason for this decision.";
    reviewFormError.hidden = false;
    reviewReason.focus();
    return;
  }

  if (status === "rejected" && !reviewDueDate.value) {
    reviewFormError.textContent = "Please select a resubmission due date.";
    reviewFormError.hidden = false;
    reviewDueDate.focus();
    return;
  }

  const body = { status, remarks: reason };
  if (status === "rejected") body.dueDate = reviewDueDate.value;

  setStatus(`Updating ${vendor.stall}...`);
  submitReviewBtn.disabled = true;
  submitReviewBtn.textContent = "Saving...";

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update cleaning submission.");
    }

    vendors = vendors.map((item) => item.id === id ? data.submission : item);
    render();
    closeReviewForm();
    if (activeReviewVendorId === id) {
      closePhotoPreview();
    }

    if (data.notification?.dueDate) {
      setStatus(`${data.message} Due date: ${fmtDate(data.notification.dueDate)}.`, "success");
    } else {
      setStatus(data.message, "success");
    }
  } catch (error) {
    reviewFormError.textContent = error.message || "Failed to update cleaning submission.";
    reviewFormError.hidden = false;
    setStatus(reviewFormError.textContent, "error");
  } finally {
    submitReviewBtn.disabled = false;
    if (!reviewModal.hidden && pendingDecision) {
      submitReviewBtn.textContent = pendingDecision.status === "rejected" ? "Reject Submission" : "Approve Submission";
    }
  }
}

tabsEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".tab");
  if (!btn) return;

  tabsEl.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
  btn.classList.add("active");
  state.filter = btn.dataset.filter;
  render();
});

sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  render();
});

closePhotoModal.addEventListener("click", closePhotoPreview);
if (modalApproveBtn) {
  modalApproveBtn.addEventListener("click", () => {
    if (activeReviewVendorId) openReviewForm(activeReviewVendorId, "approved");
  });
}
if (modalRejectBtn) {
  modalRejectBtn.addEventListener("click", () => {
    if (activeReviewVendorId) openReviewForm(activeReviewVendorId, "rejected");
  });
}
photoModal.addEventListener("click", (event) => {
  if (event.target === photoModal) closePhotoPreview();
});
closeReviewModal.addEventListener("click", closeReviewForm);
cancelReviewBtn.addEventListener("click", closeReviewForm);
reviewForm.addEventListener("submit", submitDecision);
reviewModal.addEventListener("click", (event) => {
  if (event.target === reviewModal) closeReviewForm();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!reviewModal.hidden) closeReviewForm();
  else if (!photoModal.hidden) closePhotoPreview();
});

async function loadVendors() {
  setStatus("Loading cleaning submissions...");

  const response = await fetch(API_BASE, { credentials: "include" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load cleaning submissions.");
  }

  return data;
}

loadVendors()
  .then((data) => {
    vendors = data;
    setStatus(data.length ? `${data.length} cleaning submission(s) loaded.` : "");
    render();
  })
  .catch((error) => {
    vendors = [];
    setStatus(error.message || "Cleaning submissions could not be loaded.", "error");
    render();
  });
