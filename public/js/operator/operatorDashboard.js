import { apiFetch } from "../utility/api.js";

// Check if user has logged in
const accessToken = sessionStorage.getItem("accessToken");

if (!accessToken) {
    window.location.href = "/select-role";
}

let feedbackChart;

const salesCtx = document.getElementById("salesChart").getContext("2d");
const salesChart = new Chart(salesCtx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [{
      label: "Units Sold",
      data: [],
      backgroundColor: ["#4A90E2", "#50E3C2", "#F5A623"]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  }
});


document.addEventListener("DOMContentLoaded", () => {

  fetch("/operator/top-ordered?range=month", {
  headers: { Authorization: `Bearer ${accessToken}` }
})

  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  })
  .then(stalls => {
    console.log("Top ranked stalls response:", stalls);
    if (!Array.isArray(stalls)) {
      console.error("Unexpected response:", stalls);
      return;
    }
    salesChart.data.labels = stalls.map(s => s.stall_name);   // ✅ use stall_name
    salesChart.data.datasets[0].data = stalls.map(s => s.total_qty);
    salesChart.update();
  })

  .catch(err => console.error("Error loading operator top ordered items:", err));


    

  // Customer Feedback Chart
  const feedbackCtx = document.getElementById("feedbackChart").getContext("2d");
  feedbackChart = new Chart(feedbackCtx, {
    type: "doughnut",
    data: { labels: [], datasets: [{ data: [], backgroundColor: ["#6FCF97","#F2C94C","#EB5757"] }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
  });

  // Default load for "This Month"
  fetch("/operator/feedback?range=month", {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
    .then(res => res.json())
    .then(feedback => {
      if (!Array.isArray(feedback) || feedback.length === 0) {
        feedbackChart.data.labels = ["No feedback yet"];
        feedbackChart.data.datasets[0].data = [1];
        feedbackChart.update();
        return;
      }
      const counts = { Positive: 0, Neutral: 0, Negative: 0 };
      feedback.forEach(f => {
        if (f.food_rating >= 4) counts.Positive++;
        else if (f.food_rating === 3) counts.Neutral++;
        else counts.Negative++;
      });
      feedbackChart.data.labels = Object.keys(counts);
      feedbackChart.data.datasets[0].data = Object.values(counts);
      feedbackChart.update();
    })
    .catch(err => console.error("Error loading feedback:", err));


     document.querySelectorAll(".feedback-filters .filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const range = btn.dataset.range;
      fetch(`/operator/feedback?range=${range}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
        .then(res => res.json())
        .then(feedback => {
          if (!Array.isArray(feedback) || feedback.length === 0) {
            feedbackChart.data.labels = ["No feedback yet"];
            feedbackChart.data.datasets[0].data = [1];
            feedbackChart.update();
            return;
          }
          const counts = { Positive: 0, Neutral: 0, Negative: 0 };
          feedback.forEach(f => {
            if (f.food_rating >= 4) counts.Positive++;
            else if (f.food_rating === 3) counts.Neutral++;
            else counts.Negative++;
          });
          feedbackChart.data.labels = Object.keys(counts);
          feedbackChart.data.datasets[0].data = Object.values(counts);
          feedbackChart.update();
        })
        .catch(err => console.error("Error loading feedback:", err));
    });
  });
  // Hygiene Table Data
  fetch("/operator/hygiene", {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
    .then(res => res.json())
    .then(hygieneData => {
      const tableBody = document.getElementById("hygieneTableBody");
      tableBody.innerHTML = "";
      hygieneData.forEach(row => {
        const tr = document.createElement("tr");
         tr.innerHTML = `
          <td>${row.stall_name}</td>
          <td class="grade grade-${row.hygiene_grade}">${row.hygiene_grade}</td>
          <td>${row.inspection_date.split("T")[0]}</td>
        `;
        tableBody.appendChild(tr);
      });

     
    })
    .catch(err => console.error("Error loading hygiene data:", err));
  });



// Sales filter buttons
document.querySelectorAll(".sales-filters .filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const range = btn.dataset.range;
    fetch(`/operator/top-ordered?range=${range}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(stalls => {
        salesChart.data.labels = stalls.map(s => s.stall_name);
        salesChart.data.datasets[0].data = stalls.map(s => s.total_qty);
        salesChart.update();
      })
      .catch(err => console.error("Error loading top stalls:", err));
  });
});

// // Feedback filter buttons
// document.querySelectorAll(".feedback-filters .filter-btn").forEach(btn => {
//   btn.addEventListener("click", () => {
//     const range = btn.dataset.range;
//     fetch(`/operator/feedback?range=${range}`, {
//       headers: { Authorization: `Bearer ${accessToken}` }
//     })
//       .then(res => res.json())
//       .then(feedback => {
//         const counts = { Positive: 0, Neutral: 0, Negative: 0 };
//         feedback.forEach(f => {
//           if (f.food_rating >= 4) counts.Positive++;
//           else if (f.food_rating === 3) counts.Neutral++;
//           else counts.Negative++;
//         });
//         feedbackChart.data.labels = Object.keys(counts);
//         feedbackChart.data.datasets[0].data = Object.values(counts);
//         feedbackChart.update();
//       })
//       .catch(err => console.error("Error loading feedback:", err));
//   });
// });


