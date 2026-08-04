import { apiFetch } from "../utility/api.js";
import { loadPatronHygieneAlerts } from "./patronHygieneAlerts.js";

// Check if user has logged in
const accessToken = sessionStorage.getItem("accessToken");

if (!accessToken) {

    window.location.href = "/select-role";

}

//Global variables
let allStalls = [];
let selectedCuisine = null;

//Page load
document.addEventListener("DOMContentLoaded", async () => {

    await loadHomepage();
    await loadPatronHygieneAlerts();

    const filterDivs = document.querySelectorAll(".filter-btn");

    filterDivs.forEach((div) => {

        div.addEventListener("click", () => {

            const cuisine = div
                .dataset.cuisine
                .trim()
                .toLowerCase();

            if (selectedCuisine === cuisine) {

                selectedCuisine = null;

                renderStalls(allStalls);

                filterDivs.forEach(button =>
                    button.classList.remove("active")
                );

                return;

            }

            selectedCuisine = cuisine;

            filterDivs.forEach(button =>
                button.classList.remove("active")
            );

            div.classList.add("active");

            const filtered = allStalls.filter(stall =>
                stall.cuisine_type.toLowerCase() === cuisine
            );

            renderStalls(filtered);

        });

    });

});

//Load homepage
async function loadHomepage() {

    try {

        const response = await apiFetch(
            "/api/patron-homepage"
        );

        const data = await response.json();

        if (!response.ok) {

            if (response.status === 403) {

                window.location.href = "/select-role";

                return;

            }

            throw new Error(data.message);

        }

        document.getElementById("usernameDisplay").textContent =
            data.patron.first_name;

        allStalls = data.stalls;

        renderStalls(allStalls);

    }
    catch (error) {

        console.error(error);

        alert(error.message || "Unable to load homepage.");

    }

}

//Render stalls

function renderStalls(stalls) {

    const grid = document.getElementById("stall-grid");

    if (!grid) {

        return;

    }

    grid.innerHTML = "";

    if (!stalls.length) {

        grid.textContent = "No stalls found.";

        return;

    }

    stalls.forEach(stall => {

        const card = document.createElement("div");

        card.className =
            `stall-card ${stall.cuisine_type.toLowerCase()}`;

        const img = document.createElement("img");

        img.src = `/images/${stall.image_name || "default-stall.jpg"}`;

        img.alt = stall.stall_name;

        // Show a default image if the file cannot be found
        img.onerror = () => {

            img.src = "/images/default-stall.jpg";

        };

        const info = document.createElement("div");

        info.className = "stall-info";

        const title = document.createElement("h4");

        title.textContent = stall.stall_name;

        const meta = document.createElement("p");

        meta.textContent =
            `⭐ ${stall.rating ?? "N/A"} • ${stall.cuisine_type}`;

        info.appendChild(title);
        info.appendChild(meta);

        const hygieneGrade = document.createElement("p");
        hygieneGrade.className = "hygiene-grade";
        hygieneGrade.textContent = `Hygiene grade: ${stall.hygiene_grade || "Not graded"}`;
        info.appendChild(hygieneGrade);

        card.appendChild(img);
        card.appendChild(info);

        card.addEventListener("click", () => {

            window.location.href = `/stall-menu?stall=${stall.stall_id}`;

        });

        grid.appendChild(card);

    });

}

//Search bar

const searchInput = document.querySelector(".search-input");

if (searchInput) {

    searchInput.addEventListener("keyup", function () {

        const query = this.value.toLowerCase();

        const filtered = allStalls.filter(stall =>

            stall.stall_name.toLowerCase().includes(query) ||

            stall.cuisine_type.toLowerCase().includes(query)

        );

        renderStalls(filtered);

    });

}

