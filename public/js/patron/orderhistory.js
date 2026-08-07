import { apiFetch } from "../utility/api.js";

// Check if user has logged in
const accessToken = sessionStorage.getItem("accessToken");

if (!accessToken) {
    window.location.href = "/select-role";
}


const toggleFilterBtn = document.getElementById("toggleFilter");
const orderSection = document.getElementById("orderSection");
const favouriteSection = document.getElementById("favouriteSection");
const viewFavouriteBtn = document.getElementById("viewFavouriteBtn");
const backToOrdersBtn = document.getElementById("backToOrdersBtn");
const filterBox = document.getElementById("filterBox");
let isFiltering = false;
let favourites = [];

toggleFilterBtn.addEventListener("click", () => {
    filterBox.classList.toggle("hidden");
});



document.addEventListener("DOMContentLoaded", () => {
    let orders = [];
   

    const orderList = document.getElementById("orderList");
    const favList = document.getElementById("favOrderList");
    const favEmpty = document.getElementById("favEmpty");

    const firstTimeBox = document.querySelector(".order-box.first-time");
    const registeredBox = document.querySelector(".order-box.registered");

    const renameModal = document.getElementById("renameModal");
    const renameInput = document.getElementById("renameInput");

    let editingFavouriteId = null;

    let currentPage = 1;
    const pageSize = 10;

    
    function formatLocalDate(date) {
    return `${date.getFullYear()}-${
        String(date.getMonth() + 1).padStart(2,"0")}-${
        String(date.getDate()).padStart(2,"0")}`;
}
    function renderPagination() {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";
    const totalPages = Math.ceil(orders.length / pageSize);
    if (totalPages <= 1) return;
    if (currentPage > 1) {
        const prev = document.createElement("button");
        prev.textContent = "Previous";
        prev.onclick = () => {
            currentPage--;
            renderCurrentPage();
        };
        pagination.appendChild(prev);
    }

    const pageText = document.createElement("span");
    pageText.textContent = ` Page ${currentPage} of ${totalPages} `;
    pagination.appendChild(pageText);
    if (currentPage < totalPages) {
        const next = document.createElement("button");
        next.textContent = "Next";
        next.onclick = () => {
            currentPage++;
            renderCurrentPage();
        };
        pagination.appendChild(next);
    }
}
    
    async function loadOrders() {
        try {
            const response = await apiFetch("/api/order-history");
            const data = await response.json();
            orders = Array.isArray(data) ? data : data.orders || data.recordset || [];


            console.log("Orders:", orders);

            currentPage = 1;
            renderCurrentPage();
        } catch (err) {
            console.error(err);
        }
    }

    function renderOrders(orders){
        orderList.innerHTML="";
        if (orders.length === 0) {
            if (isFiltering) {
                orderList.innerHTML = `
                    <li class="empty-filter">
                        No orders match the selected filters.
                    </li>`;
                firstTimeBox.style.display = "none";
                registeredBox.style.display = "block";
            } else {
                firstTimeBox.style.display = "block";
                registeredBox.style.display = "none";
            }
            return;
        }
        firstTimeBox.style.display="none";
        registeredBox.style.display="block";
        orders.forEach(order => {
        const liked = favourites.some(f => f.order_id === order.order_id);

        const li = document.createElement("li");
        li.innerHTML = `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-date">${order.order_date.split("T")[0]}</span>
                    <span class="order-info">Order #${order.order_id} • Total: $${Number(order.total_amt).toFixed(2)}</span>
                    <button class="fav-btn" data-order-id="${order.order_id}">
                    ${liked ? "❤️" : "🤍"}
                    </button>
                </div>

                <table class="order-items">
                    <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${order.items.map(item => `
                        <tr>
                        <td>${item.item_name}</td>
                        <td>${item.quantity}</td>
                        <td>$${Number(item.price).toFixed(2)}</td>
                        <td>$${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join("")}
                    </tbody>
</table>

<div class="order-feedback-action">
    <a
        href="/feedback?orderId=${order.order_id}&stallId=${order.stall_id}"
        class="feedback-btn"
    >
        Leave Feedback
    </a>
</div>

</div>
        `;
        orderList.prepend(li);
        });
        document.querySelectorAll(".fav-btn").forEach(btn=>{
            btn.onclick=()=>toggleFavourite(btn);
        });

    }

    //------------------------------------
    // LOAD FAVOURITES
    //------------------------------------

    
    async function loadFavourites() {
        try {
            const response = await apiFetch("/api/order-history-favourites");
            favourites = await response.json();
            renderFavouriteList(favourites);

            if (Array.isArray(orders)) {
             renderCurrentPage();
            }
        } catch (err) {
            console.error("Error loading favourites:", err);
        }
    }


    //------------------------------------
    // show favourite order history list
    //------------------------------------

    function showOrders() {
    orderSection.style.display = "block";
    favouriteSection.style.display = "none";
}

function showFavourites() {
    orderSection.style.display = "none";
    favouriteSection.style.display = "block";
}
    //------------------------------------
    // Load everything
    //------------------------------------

    loadOrders();
    loadFavourites();

    //------------------------------------
    // ORDER HISTORY
    //------------------------------------


    viewFavouriteBtn.addEventListener("click", () => {
        console.log("Opening favourites");
        showFavourites();
    });

    backToOrdersBtn.addEventListener("click", () => {
        console.log("Back button clicked");
        showOrders();
    });



    //------------------------------------
    // ADD / REMOVE
    //------------------------------------

    async function toggleFavourite(button) {
        const orderId = parseInt(button.dataset.orderId);
        const existing = favourites.find(f => f.order_id === orderId);

        try {
            if (existing) {
            await apiFetch(`/api/order-history-favourites/${existing.favourite_id}`, {
                method: "DELETE"
            });
            } else {
            await apiFetch("/api/order-history-favourites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                orderId,              
                customName: "Favourite" 
                })
            });
            }
            await loadFavourites();
        } catch (err) {
            console.error(err);
        }
        }


    //------------------------------------
    // Favourite List
    //------------------------------------

    function renderFavouriteList(){
        favList.innerHTML="";
        if(favourites.length===0){
            favEmpty.style.display="block";
            return;
        }
        favEmpty.style.display="none";
        favourites.forEach(fav=>{
            const card=document.createElement("div");
            card.className="fav-card";
            card.innerHTML=`
            <div class="fav-left">
                <h3>
                    ❤️
                    ${fav.custom_name || "Favourite Order"}
                </h3>
                <p>
                    Order #${fav.order_id}
                </p>
            </div>
            <div class="fav-actions">
                <button
                    class="rename-btn"
                    data-id="${fav.favourite_id}">
                    Rename
                </button>
                <button
                    class="delete-btn"
                    data-id="${fav.favourite_id}">
                    Remove
                </button>
            </div>
            `;
            favList.appendChild(card);
        });
        //----------------------------------
        // Delete
        //----------------------------------

        document.querySelectorAll(".delete-btn").forEach(btn=>{
            btn.onclick=async()=>{
                await apiFetch(`/api/order-history-favourites/${btn.dataset.id}`, {
                    method: "DELETE"
                });
                await loadFavourites();
                showFavourites();   
            };
        });

        //----------------------------------
        // Rename
        //----------------------------------

        document.querySelectorAll(".rename-btn").forEach(btn=>{
            btn.onclick=()=>{
                editingFavouriteId=btn.dataset.id;
                renameInput.value="";
                renameModal.classList.remove("hidden");
            };
        });
    }

    //------------------------------------
    // Save Rename
    //------------------------------------

    document.getElementById("saveRenameBtn").onclick = async () => {
        await apiFetch(`/api/order-history-favourites/${editingFavouriteId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customName: renameInput.value })
        });
        renameModal.classList.add("hidden");
        await loadFavourites();   // ✅ refresh favourites list
        renderCurrentPage();   // ✅ refresh orders list with updated hearts
        showFavourites();
        };


    //------------------------------------
    // Cancel
    //------------------------------------

    document
    .getElementById("cancelRenameBtn")
    .onclick=()=>{
        renameModal.classList.add("hidden");
    };
    //------------------------------------
    // FILTER
    //------------------------------------
    document.getElementById("applyFilter").onclick = async () => {
    isFiltering = true;
    const status = document.getElementById("filterStatus").value;
    const dateFilter = document.getElementById("filterDate").value;
    let url = "/api/order-history/filter";
    const params = new URLSearchParams();

    if (status) {
        params.append("status", status);
    }
    const today = new Date();

    if (dateFilter === "today") {
        params.append("startDate", formatLocalDate(today));
        params.append("endDate", formatLocalDate(today));


    } else if (dateFilter === "month") {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        params.append("startDate", formatLocalDate(firstDay));
        params.append("endDate", formatLocalDate(lastDay));
    } else if (dateFilter === "year") {
        const firstDay = new Date(today.getFullYear(), 0, 1);
        const lastDay = new Date(today.getFullYear(), 11, 31);

        params.append("startDate", formatLocalDate(firstDay));
        params.append("endDate", formatLocalDate(lastDay));
    }

    if (params.toString()) {
        url += "?" + params.toString();
    }

    const response = await apiFetch(url);
    const data = await response.json();

    orders = Array.isArray(data) ? data : data.orders || data.recordset || [];

    currentPage = 1;
    renderCurrentPage();

    
    };

    document.getElementById("clearFilter").onclick = async () => {
    isFiltering = false;
    await loadOrders();
    };

    function renderCurrentPage() {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageOrders = orders.slice(start, end);
    renderOrders(pageOrders);
    renderPagination();
    }
})