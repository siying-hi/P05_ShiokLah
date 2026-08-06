const FEEDBACK_API_URL =
    "/api/feedbacks";
const urlParameters =
    new URLSearchParams(
        window.location.search
    );

const selectedOrderId =
    Number(
        urlParameters.get("orderId")
    ) || null;

const selectedStallId =
    Number(
        urlParameters.get("stallId")
    ) || null;

// Check if user has logged in
const accessToken = sessionStorage.getItem("accessToken");

if (!accessToken) {

    alert("Please log in to continue.");

    window.location.href = "/select-role";

}
// Get the login token
function getAccessToken() {
  return sessionStorage.getItem("accessToken");
}


// Send requests to the backend
async function sendRequest(url, options = {}) {
  const token = getAccessToken();

  if (!token) {
    alert("Please log in first.");
    window.location.href = "/select-role";
    return null;
  }

  const response = await fetch(url, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong."
    );
  }

  return data;
}


// Load the logged-in patron's orders
async function loadAllStalls() {
    const stallSelect =
        document.getElementById("fbStallSelect");

    if (!stallSelect) {
        console.error(
            "fbStallSelect was not found."
        );

        return;
    }

    stallSelect.innerHTML = `
        <option value="" disabled selected>
            Loading all stalls...
        </option>
    `;

    try {
        const stalls = await sendRequest(
            `${FEEDBACK_API_URL}/stalls`
        );

        console.log(
            "Stalls returned:",
            stalls
        );

        if (!stalls || stalls.length === 0) {
            stallSelect.innerHTML = `
                <option value="" disabled selected>
                    No stalls found
                </option>
            `;

            return;
        }

        stallSelect.innerHTML = `
            <option value="" disabled selected>
                Choose a food stall...
            </option>
        `;

        stalls.forEach((stall) => {
            const option =
                document.createElement("option");

            option.value = stall.stall_id;
            option.textContent = stall.stall_name;

            stallSelect.appendChild(option);
        });
      if (selectedStallId) {

    stallSelect.value =
        String(selectedStallId);

}
    } catch (error) {
        console.error(
            "Error loading stalls:",
            error
        );

        stallSelect.innerHTML = `
            <option value="" disabled selected>
                Unable to load stalls
            </option>
        `;

        alert(error.message);
    }
}

// Set up clickable stars
function setupStars() {
  const stars = document.querySelectorAll(
    "#pane-fb-submit .star-rating .star"
  );

  stars.forEach((star) => {
    star.addEventListener(
      "click",
      function () {
        const rating =
          Number(this.dataset.value);

        const category =
          this.parentElement.dataset.category;

        if (category === "food") {
          document.getElementById(
            "fbRatingFood"
          ).value = rating;
        }

        if (category === "service") {
          document.getElementById(
            "fbRatingService"
          ).value = rating;
        }

        if (category === "atmosphere") {
          document.getElementById(
            "fbRatingAtmosphere"
          ).value = rating;
        }

        showSelectedStars(
          category,
          rating
        );
      }
    );
  });
}


// Show selected stars
function showSelectedStars(
  category,
  rating
) {
  const container =
    document.querySelector(
      `#pane-fb-submit .star-rating[data-category="${category}"]`
    );

  if (!container) {
    return;
  }

  const stars =
    container.querySelectorAll(".star");

  stars.forEach((star) => {
    const starValue =
      Number(star.dataset.value);

    if (starValue <= rating) {
      star.classList.add("selected");
    } else {
      star.classList.remove("selected");
    }
  });
}


// Reset the stars
function resetStars() {
  document
    .querySelectorAll(
      "#pane-fb-submit .star-rating .star"
    )
    .forEach((star) => {
      star.classList.remove("selected");
    });

  document.getElementById(
    "fbRatingFood"
  ).value = "0";

  document.getElementById(
    "fbRatingService"
  ).value = "0";

  document.getElementById(
    "fbRatingAtmosphere"
  ).value = "0";
}


// Create stars for history cards
function createStars(rating) {
  const roundedRating =
    Math.round(Number(rating) || 0);

  let stars = "";

  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      stars += `
        <span
          style="
            color:#ff9f05;
            font-size:1.3rem;
          "
        >
          &#9733;
        </span>
      `;
    } else {
      stars += `
        <span
          style="
            color:#e0e0e0;
            font-size:1.3rem;
          "
        >
          &#9733;
        </span>
      `;
    }
  }

  return stars;
}


// Format feedback date
function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(date.getTime())
  ) {
    return dateValue;
  }

  return date.toLocaleDateString(
    "en-SG",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );
}


// Load feedback history
async function loadFeedbackHistory() {
  const container =
    document.getElementById(
      "feedbackHistoryList"
    );

  if (!container) {
    return;
  }

  container.innerHTML = `
    <p
      style="
        text-align:center;
        padding:20px;
      "
    >
      Loading all feedback...
    </p>
  `;

  try {
    const feedbacks =
      await sendRequest(
        FEEDBACK_API_URL
      );

    if (!feedbacks) {
      return;
    }

    container.innerHTML = "";

    if (feedbacks.length === 0) {
      container.innerHTML = `
        <p
          style="
            text-align:center;
            padding:20px;
          "
        >
          No feedback submitted yet.
        </p>
      `;

      return;
    }

    feedbacks.forEach(
      (feedback) => {
        const averageRating =
          (
            Number(
              feedback.food_rating
            ) +
            Number(
              feedback.service_rating
            ) +
            Number(
              feedback.atmosphere_rating
            )
          ) / 3;

        const card =
          document.createElement("div");

        card.className =
          "history-card";

        card.innerHTML = `
          <div class="card-header-row">

            <div class="card-meta-info">

              <h3 class="card-stall-dish">
                ${
                  feedback.stall_name ||
                  "Unknown Stall"
                }
              </h3>

              <p class="card-date-id">
                ${formatDate(
                  feedback.date_submitted
                )}
                • #FB-${
                  feedback.feedback_id
                }
              </p>

            </div>

            <div class="stars-display-row">
              ${createStars(
                averageRating
              )}
            </div>

          </div>

          <p>
            Food:
            ${feedback.food_rating}/5

            &nbsp;•&nbsp;

            Service:
            ${feedback.service_rating}/5

            &nbsp;•&nbsp;

            Atmosphere:
            ${feedback.atmosphere_rating}/5
          </p>

          <p class="card-main-content">
            ${
              feedback.feedback_description ||
              "No written comment."
            }
          </p>

          <div class="card-actions-row">

            <button
              type="button"
              class="action-btn edit-btn"
              data-id="${
                feedback.feedback_id
              }"
            >
              Edit
            </button>

            <button
              type="button"
              class="action-btn delete-btn"
              data-id="${
                feedback.feedback_id
              }"
            >
              Delete
            </button>

          </div>
        `;

        container.appendChild(card);
      }
    );

    addHistoryButtonEvents();
  } catch (error) {
    console.error(
      "Error loading feedback:",
      error
    );

    container.innerHTML = `
      <p
        style="
          text-align:center;
          color:red;
          padding:20px;
        "
      >
        ${error.message}
      </p>
    `;
  }
}


// Add edit and delete button events
function addHistoryButtonEvents() {
  document
    .querySelectorAll(
      ".edit-btn[data-id]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        function () {
          editFeedback(
            this.dataset.id
          );
        }
      );
    });

  document
    .querySelectorAll(
      ".delete-btn[data-id]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        function () {
          deleteFeedback(
            this.dataset.id
          );
        }
      );
    });
}


// Submit or update feedback
async function submitFeedback(event) {
  event.preventDefault();

  const feedbackId =
    document.getElementById(
      "editFeedbackId"
    ).value;

const stallId = Number(
    document.getElementById(
        "fbStallSelect"
    ).value
);

  const foodRating = Number(
    document.getElementById(
      "fbRatingFood"
    ).value
  );

  const serviceRating = Number(
    document.getElementById(
      "fbRatingService"
    ).value
  );

  const atmosphereRating = Number(
    document.getElementById(
      "fbRatingAtmosphere"
    ).value
  );

  const feedbackDescription =
    document
      .getElementById("fbComment")
      .value
      .trim();
  if (!feedbackId && !selectedOrderId) {

    alert(
        "Please select an order from your order history."
    );

    return;

}

if (!feedbackId && !stallId) {
    alert(
      "Please select a food stall."
    );

    return;
  }

  if (
    foodRating < 1 ||
    serviceRating < 1 ||
    atmosphereRating < 1
  ) {
    alert(
      "Please rate food, service and atmosphere."
    );

    return;
  }

  if (
    feedbackDescription.length > 500
  ) {
    alert(
      "Feedback cannot exceed 500 characters."
    );

    return;
  }

  const submitButton =
    document.getElementById(
      "fbSubmitButton"
    );

  submitButton.disabled = true;

  try {
    if (feedbackId) {
      await sendRequest(
        `${FEEDBACK_API_URL}/${feedbackId}`,
        {
          method: "PUT",

 body: JSON.stringify({
    stall_id:
        stallId,

    food_rating:
        foodRating,

    service_rating:
        serviceRating,

    atmosphere_rating:
        atmosphereRating,

    feedback_description:
        feedbackDescription
})
        }
      );

      alert(
        "Feedback updated successfully."
      );
    } else {
      await sendRequest(
        FEEDBACK_API_URL,
        {
          method: "POST",
body: JSON.stringify({
    order_id: selectedOrderId,
    stall_id: stallId,
    food_rating: foodRating,
    service_rating: serviceRating,
    atmosphere_rating: atmosphereRating,
    feedback_description:
        feedbackDescription
})
        }
      );

      alert(
        "Feedback submitted successfully."
      );
    }

    resetFeedbackForm();

    const historyTab =
      document.getElementById(
        "tab-history-fb"
      );

    if (historyTab) {
      historyTab.click();
    }

    await loadFeedbackHistory();
  } catch (error) {
    console.error(
      "Error saving feedback:",
      error
    );

    alert(error.message);
  } finally {
    submitButton.disabled = false;
  }
}


// Load one feedback for editing
async function editFeedback(
  feedbackId
) {
  try {
    const feedback =
      await sendRequest(
        `${FEEDBACK_API_URL}/${feedbackId}`
      );

    if (!feedback) {
      return;
    }

    document.getElementById(
      "editFeedbackId"
    ).value =
      feedback.feedback_id;

document.getElementById(
  "fbStallSelect"
).value =
  String(feedback.stall_id);
    document.getElementById(
      "fbRatingFood"
    ).value =
      feedback.food_rating;

    document.getElementById(
      "fbRatingService"
    ).value =
      feedback.service_rating;

    document.getElementById(
      "fbRatingAtmosphere"
    ).value =
      feedback.atmosphere_rating;

    document.getElementById(
      "fbComment"
    ).value =
      feedback.feedback_description ||
      "";

    showSelectedStars(
      "food",
      Number(feedback.food_rating)
    );

    showSelectedStars(
      "service",
      Number(feedback.service_rating)
    );

    showSelectedStars(
      "atmosphere",
      Number(
        feedback.atmosphere_rating
      )
    );

    document.getElementById(
      "fbSubmitButton"
    ).textContent =
      "Save Changes";

    const submitTab =
      document.getElementById(
        "tab-submit-fb"
      );

    if (submitTab) {
      submitTab.click();
    }
  } catch (error) {
    console.error(
      "Error loading feedback:",
      error
    );

    alert(error.message);
  }
}


// Delete feedback
async function deleteFeedback(
  feedbackId
) {
  const confirmed = confirm(
    "Are you sure you want to delete this feedback?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await sendRequest(
      `${FEEDBACK_API_URL}/${feedbackId}`,
      {
        method: "DELETE"
      }
    );

    alert(
      "Feedback deleted successfully."
    );

    await loadFeedbackHistory();
  } catch (error) {
    console.error(
      "Error deleting feedback:",
      error
    );

    alert(error.message);
  }
}


// Reset feedback form
function resetFeedbackForm() {
  const form =
    document.getElementById(
      "feedbackForm"
    );

  if (form) {
    form.reset();
  }

  document.getElementById(
    "editFeedbackId"
  ).value = "";

  document.getElementById(
    "fbSubmitButton"
  ).textContent =
    "Submit review";

  resetStars();
}


// Make functions available to HTML
window.renderFeedbacks =
  loadFeedbackHistory;

window.editFeedback =
  editFeedback;

window.deleteFeedback =
  deleteFeedback;


// Start feedback code
document.addEventListener(
  "DOMContentLoaded",
  async function () {
    setupStars();

    await loadAllStalls();

    const feedbackForm =
      document.getElementById(
        "feedbackForm"
      );

    if (feedbackForm) {
      feedbackForm.addEventListener(
        "submit",
        submitFeedback
      );
    }

    const historyButton =
      document.getElementById(
        "tab-history-fb"
      );

    if (historyButton) {
      historyButton.addEventListener(
        "click",
        loadFeedbackHistory
      );
    }
  }
);