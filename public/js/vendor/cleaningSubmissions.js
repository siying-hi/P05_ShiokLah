import { apiFetch } from "/js/utility/api.js";

const cleaningSubmissionForm = document.getElementById("cleaningSubmissionForm");
const submissionStatus = document.getElementById("submissionStatus");
const cleaningDateInput = document.querySelector('input[name="cleaningDate"]');
const stallNameInput = document.getElementById("stallName");
const submissionHistoryList = document.getElementById("submissionHistoryList");
const refreshSubmissions = document.getElementById("refreshSubmissions");
const cleaningPhotosInput = document.querySelector('input[name="cleaningPhotos"]');
const photoPreview = document.getElementById("photoPreview");

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

async function loadSubmissions() {
  try {
    const response = await apiFetch("/api/vendor/cleaning-submissions", {
      credentials: "include"
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Unable to load submissions.");

    stallNameInput.value = data.stall?.stall_name || "No stall assigned";
    const submissions = data.submissions || [];
    submissionHistoryList.innerHTML = submissions.length
      ? submissions.map((submission) => `
          <article class="history-card">
            <div>
              <strong>${escapeHtml(submission.cleaning_type)} — ${escapeHtml(submission.cleaning_date)}</strong>
              <p>${escapeHtml(submission.cleaning_description)}</p>
            </div>
            <span class="history-status ${escapeHtml(String(submission.status).toLowerCase())}">${escapeHtml(submission.status)}</span>
            <div class="history-details">
              <span><b>Cleaning time:</b> ${escapeHtml(submission.cleaning_time || "Not provided")}</span>
              <span><b>Reason for submission:</b> ${escapeHtml(submission.submission_reason || "Not provided")}</span>
            </div>
            <div class="history-photos">
              ${(submission.photo_urls || []).map((url, index) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener"><img src="${escapeHtml(url)}" alt="Submitted cleaning photo ${index + 1}"></a>`).join("")}
            </div>
            <p class="review-reason"><b>Officer reason:</b> ${escapeHtml(submission.review_remarks || "Awaiting officer review")}</p>
            ${submission.review_date ? `<small>Reviewed ${escapeHtml(submission.review_date)} by ${escapeHtml(submission.reviewed_by || "NEA Officer")}</small>` : ""}
          </article>
        `).join("")
      : "<p>No cleaning submissions have been sent yet.</p>";
  } catch (error) {
    submissionHistoryList.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  }
}

if (cleaningDateInput && !cleaningDateInput.value) {
  cleaningDateInput.value = new Date().toISOString().slice(0, 10);
}

if (cleaningSubmissionForm && submissionStatus) {
  cleaningSubmissionForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(cleaningSubmissionForm);
    const selectedPhotos = Array.from(formData.getAll("cleaningPhotos"))
      .filter((file) => file && file.name);
    if (selectedPhotos.length > 6) {
      submissionStatus.textContent = "You can submit a maximum of 6 photos.";
      return;
    }
    const photos = await Promise.all(selectedPhotos.map(fileToPayload));

    const payload = {
      cleaningType: formData.get("cleaningType"),
      cleaningDate: formData.get("cleaningDate"),
      cleaningTime: formData.get("cleaningTime"),
      cleaningDescription: formData.get("cleaningDescription"),
      submissionReason: formData.get("submissionReason"),
      photos,
      watermarkConfirmed: formData.get("watermarkConfirmed") === "on"
    };

    submissionStatus.textContent = "Submitting cleaning evidence...";

    try {
      const response = await apiFetch("/api/vendor/cleaning-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.errors) ? data.errors.join(" ") : data.message;
        throw new Error(message || "Submission failed.");
      }

      submissionStatus.textContent = `${data.message} Submission #${data.submissionId} for ${data.stallName}.`;
      cleaningSubmissionForm.reset();
      photoPreview.innerHTML = "";
      if (cleaningDateInput) cleaningDateInput.value = new Date().toISOString().slice(0, 10);
      await loadSubmissions();
    } catch (error) {
      submissionStatus.textContent = error.message;
    }
  });
}

function fileToPayload(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error(`${file.name} is larger than 8 MB.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

if (cleaningPhotosInput && photoPreview) {
  cleaningPhotosInput.addEventListener("change", () => {
    photoPreview.innerHTML = "";
    Array.from(cleaningPhotosInput.files || []).forEach((file) => {
      const image = document.createElement("img");
      image.src = URL.createObjectURL(file);
      image.alt = `Preview of ${file.name}`;
      image.onload = () => URL.revokeObjectURL(image.src);
      photoPreview.appendChild(image);
    });
  });
}

if (refreshSubmissions) refreshSubmissions.addEventListener("click", loadSubmissions);
loadSubmissions();
