import { getFeedback, getComplaints } from "./reviewsAPI.js";

const feedbackList = document.getElementById("feedbackList");
const complaintList = document.getElementById("complaintList");

const emptyState = document.getElementById("emptyState");

const reviewCount = document.getElementById("reviewCount");
const reviewCountLabel = document.getElementById("reviewCountLabel");

const sectionTitle = document.getElementById("sectionTitle");
const sectionDescription = document.getElementById("sectionDescription");

const filterButtons = document.querySelectorAll(".filter-btn");

let feedback = [];
let complaints = [];

document.addEventListener("DOMContentLoaded", init);

async function init() {

    try {

        feedback = await getFeedback();
        complaints = await getComplaints();

        renderFeedback();

    } catch (err) {

        console.error(err);

    }

    setupFilters();

}

function stars(rating) {

    return "★".repeat(rating) + "☆".repeat(5 - rating);

}

function formatDate(date) {

    return new Date(date).toLocaleDateString("en-GB");

}

// Feedback
function renderFeedback() {

    feedbackList.innerHTML = "";

    reviewCount.textContent = feedback.length;
    reviewCountLabel.textContent = "Feedback";

    if (feedback.length === 0) {

        showEmpty(
            "No feedback yet",
            "Customer feedback will appear here."
        );

        return;
    }

    emptyState.style.display = "none";

    feedback.forEach(item => {

        feedbackList.insertAdjacentHTML("beforeend", createFeedbackCard(item));

    });

}

function createFeedbackCard(item) {

    return `

    <div class="review-card">

        <div class="review-header">

            <div>

                <h3>Order #${item.order_id}</h3>

                <span class="review-date">
                    ${formatDate(item.date_submitted)}
                </span>

            </div>

        </div>

        <div class="review-stars">

            ${stars(item.food_rating)}

        </div>

        <div class="review-ratings">

            <span><strong>Food:</strong> ${item.food_rating}/5</span>

            <span>•</span>

            <span><strong>Service:</strong> ${item.service_rating}/5</span>

            <span>•</span>

            <span><strong>Atmosphere:</strong> ${item.atmosphere_rating}/5</span>

        </div>

        <p class="review-description">

            ${item.feedback_description}

        </p>

    </div>

    `;

}

// Complaints
function renderComplaints() {

    complaintList.innerHTML = "";

    reviewCount.textContent = complaints.length;
    reviewCountLabel.textContent = "Complaints";

    if (complaints.length === 0) {

        showEmpty(
            "No complaints",
            "Customer complaints will appear here."
        );

        return;
    }

    emptyState.style.display = "none";

    complaints.forEach(item => {

        complaintList.insertAdjacentHTML(
            "beforeend",
            createComplaintCard(item)
        );

    });

}

function createComplaintCard(item) {

    return `

<div class="review-card complaint-card">

    <div class="review-header">

        <div>

            <h3>Order #${item.order_id}</h3>

            <span class="review-date">
                ${formatDate(item.date_submitted)}
            </span>

        </div>

        <span class="complaint-status status-${item.complaint_status.toLowerCase()}">

            ${item.complaint_status}

        </span>

    </div>

    <div class="complaint-section">

        <label>Food Issue</label>

        <p>${item.food_issue || "-"}</p>

    </div>

    <div class="complaint-section">

        <label>Service Issue</label>

        <p>${item.service_issue || "-"}</p>

    </div>

    <div class="complaint-section">

        <label>Additional Comments</label>

        <p>${item.additional_comments || "-"}</p>

    </div>

</div>

`;

}

function showEmpty(title, description) {

    feedbackList.innerHTML = "";
    complaintList.innerHTML = "";

    emptyState.style.display = "block";

    document.getElementById("emptyTitle").textContent = title;
    document.getElementById("emptyDescription").textContent = description;

}

function setupFilters() {

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            filterButtons.forEach(b => b.classList.remove("active"));

            button.classList.add("active");

            const filter = button.dataset.filter;

            if (filter === "feedback") {

                feedbackList.style.display = "flex";
                complaintList.style.display = "none";

                renderFeedback();

            } else {

                feedbackList.style.display = "none";
                complaintList.style.display = "flex";

                renderComplaints();

            }

        });

    });

}