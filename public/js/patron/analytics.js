import { apiFetch } from "../utility/api.js";

// Check if user has logged in
const accessToken = sessionStorage.getItem("accessToken");

if (!accessToken) {
    window.location.href = "/select-role";
}



// Sales chart setup
const salesCtx = document.getElementById("salesChart").getContext("2d");
window.salesChart = new Chart(salesCtx, {
  type: "bar", // or "doughnut"
  data: {
    labels: [],
    datasets: [{
      label: "Orders",
      data: [],
      backgroundColor: ["#6FCF97", "#F2C94C", "#EB5757"]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Top 3 Food Items" }
    }
  }
});


document.addEventListener("DOMContentLoaded", () => {
  // KPI values from backend
  apiFetch("/analytics/most-ordered")
    .then(res => res.json())
    .then(data => {
      console.log("Popular items data:", data);
      const items = Array.isArray(data) ? data : data.recordset || [];
      if (items.length === 0) {
        document.getElementById("kpiTopItem").textContent = "No orders this month";
        document.getElementById("kpiTopItemSub").textContent = "";
        document.getElementById("kpiTotalOrders").textContent = "0";
        return;
      }

      const totalOrders = items.reduce((sum, i) => sum + i.total_qty, 0);
      document.getElementById("kpiTopItem").textContent = items[0].item;
      document.getElementById("kpiTopItemSub").textContent =
        `Share: ${(items[0].total_qty / totalOrders * 100).toFixed(1)}%`;

      salesChart.data.labels = items.map(i => i.item);
      salesChart.data.datasets[0].data = items.map(i => i.total_qty);
      salesChart.update();

    })
    .catch(err => console.error("Error loading popular items:", err));

  apiFetch("/analytics/total-orders")
    .then(res => res.json())
    .then(data => {
      document.getElementById("kpiTotalOrders").textContent = data.total_orders;
    })
    .catch(err => console.error("Error loading total orders:", err));

    
  // Feedback chart
  const feedbackCtx = document.getElementById("feedbackChart").getContext("2d");
  window.feedbackChart = new Chart(feedbackCtx, { type: "doughnut", data: { labels: [], datasets: [{ data: [], backgroundColor: ["#6FCF97","#F2C94C","#EB5757"] }] } });
  apiFetch("/analytics/feedback")
    .then(res => res.json())
    .then(feedback => {
      console.log("Feedback raw data:", feedback);
      if (feedback.length === 0) {
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




  // Hygiene table
  apiFetch("/analytics/hygiene")
    .then(res => res.json())
    .then(hygieneData => {
      const tableBody = document.getElementById("hygieneTableBody");
      tableBody.innerHTML = "";
      hygieneData.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.stall_name}</td>
          <td class="grade grade-${row.hygiene_grade}">${row.hygiene_grade}</td>
        `;
        tableBody.appendChild(tr);
      });
    });

});
