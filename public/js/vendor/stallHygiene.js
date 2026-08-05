const stallSummary = document.getElementById("stallSummary");
const currentGrade = document.getElementById("currentGrade");
const gradeHistory = document.getElementById("gradeHistory");
const refreshGrades = document.getElementById("refreshGrades");

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

async function loadVendorGrades() {
  try {
    const response = await fetch("/api/vendor/hygiene-grades", {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("accessToken") || ""}` },
      credentials: "include"
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to load hygiene grades.");

    stallSummary.textContent = `${data.stall.stall_name} · ${data.stall.location || "Location not added"}`;
    const grades = data.grades || [];
    const latest = grades[0];
    currentGrade.innerHTML = latest
      ? `<div class="grade-circle grade-${escapeHtml(latest.hygiene_grade)}">${escapeHtml(latest.hygiene_grade)}</div><div><span>Latest grade</span><h2>${escapeHtml(latest.score ?? "No score")} / 100</h2><p>Inspected ${escapeHtml(latest.inspection_date)} by ${escapeHtml(latest.inspection_by || "NEA Officer")}</p><p>${escapeHtml(latest.remarks || "No remarks")}</p></div>`
      : "<p>Your stall has not received a hygiene grade yet.</p>";
    gradeHistory.innerHTML = grades.length
      ? `<div class="grade-table-wrap"><table><thead><tr><th>Grade</th><th>Score</th><th>Date</th><th>Officer</th><th>Remarks</th></tr></thead><tbody>${grades.map((grade) => `<tr><td><b>${escapeHtml(grade.hygiene_grade)}</b></td><td>${escapeHtml(grade.score ?? "—")}</td><td>${escapeHtml(grade.inspection_date)}</td><td>${escapeHtml(grade.inspection_by || "NEA Officer")}</td><td>${escapeHtml(grade.remarks || "—")}</td></tr>`).join("")}</tbody></table></div>`
      : "<p>No inspection history is available yet.</p>";
  } catch (error) {
    currentGrade.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    gradeHistory.innerHTML = "";
  }
}

refreshGrades.addEventListener("click", loadVendorGrades);
loadVendorGrades();
