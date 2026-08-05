import { apiFetch } from "../utility/api.js";


// Check if user has logged in
const accessToken =
    sessionStorage.getItem("accessToken");

if (!accessToken) {

    alert("Please log in to continue.");

    window.location.href = "/select-role";

}


// Back button
const backBtn =
    document.getElementById("backBtn");

if (backBtn) {

    backBtn.addEventListener("click", () => {

        window.location.href =
            "/patron-homepage";

    });

}


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadFavourites();

    }
);


// Load all favourite menu items
async function loadFavourites() {

    const root =
        document.getElementById(
            "favouritesRoot"
        );

    try {

        const response =
            await apiFetch(
                "/api/favourites"
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load favourites."
            );

        }

        renderFavourites(
            data.favourites || data
        );

    }
    catch (error) {

        console.error(error);

        root.innerHTML = `
            <div class="error-message">
                Unable to load your favourites.
            </div>
        `;

    }

}


// Display favourite cards
function renderFavourites(favourites) {

    const root =
        document.getElementById(
            "favouritesRoot"
        );

    root.innerHTML = "";


    if (
        !favourites ||
        favourites.length === 0
    ) {

        showEmptyState();

        return;

    }


    const grid =
        document.createElement("div");

    grid.className =
        "favourites-grid";


    favourites.forEach(item => {

        const card =
            document.createElement("div");

        card.className =
            "favourite-card";


        const imageWrapper =
            document.createElement("div");

        imageWrapper.className =
            "favourite-image-wrapper";


        const image =
            document.createElement("img");

        image.className =
            "favourite-image";

        image.src =
            item.image_name
                ? `/images/${item.image_name}`
                : "/images/default-food.jpg";

        image.alt =
            item.item_name;


        const removeBtn =
            document.createElement("button");

        removeBtn.type =
            "button";

        removeBtn.className =
            "remove-btn";

        removeBtn.innerHTML =
            "♥";

        removeBtn.title =
            "Remove from favourites";


        removeBtn.addEventListener(
            "click",
            async () => {

                await removeFavourite(
                    item.item_id,
                    card,
                    removeBtn
                );

            }
        );


        imageWrapper.appendChild(
            image
        );

        imageWrapper.appendChild(
            removeBtn
        );


        const content =
            document.createElement("div");

        content.className =
            "favourite-content";


        const stall =
            document.createElement("p");

        stall.className =
            "favourite-stall";

        stall.textContent =
            item.stall_name ||
            "Food Stall";


        const title =
            document.createElement("h2");

        title.textContent =
            item.item_name;


        const price =
            document.createElement("p");

        price.className =
            "favourite-price";

        price.textContent =
            `$${Number(item.price).toFixed(2)}`;


        const description =
            document.createElement("p");

        description.className =
            "favourite-description";

        description.textContent =
            item.food_description ||
            "No description available.";


        const information =
            document.createElement("div");

        information.className =
            "favourite-information";


        const waiting =
            document.createElement("p");

        waiting.className =
            "favourite-waiting";

        waiting.textContent =
            `⏱ ${item.estimated_waiting_time || 0} mins`;


        const available =
            document.createElement("span");

        available.className =
            "availability-badge";

        available.textContent =
            "Available";


        information.appendChild(
            waiting
        );

        information.appendChild(
            available
        );


        const actions =
            document.createElement("div");

        actions.className =
            "favourite-actions";


        const stallBtn =
            document.createElement("button");

        stallBtn.type =
            "button";

        stallBtn.className =
            "stall-btn";

        stallBtn.textContent =
            "View Stall";


        stallBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    `/stall-menu?stall=${item.stall_id}`;

            }
        );


        actions.appendChild(
            stallBtn
        );


        content.appendChild(
            stall
        );

        content.appendChild(
            title
        );

        content.appendChild(
            price
        );

        content.appendChild(
            description
        );

        content.appendChild(
            information
        );

        content.appendChild(
            actions
        );


        card.appendChild(
            imageWrapper
        );

        card.appendChild(
            content
        );


        grid.appendChild(
            card
        );

    });


    root.appendChild(
        grid
    );

}


// Remove favourite
async function removeFavourite(
    itemId,
    card,
    removeBtn
) {

    try {

        removeBtn.disabled = true;

        const response =
            await apiFetch(
                `/api/favourites/${itemId}`,
                {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to remove favourite."
            );

        }

        card.remove();


        const remainingCards =
            document.querySelectorAll(
                ".favourite-card"
            );

        if (
            remainingCards.length === 0
        ) {

            showEmptyState();

        }

    }
    catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to remove favourite."
        );

        removeBtn.disabled = false;

    }

}


// Show when there are no favourites
function showEmptyState() {

    const root =
        document.getElementById(
            "favouritesRoot"
        );

    root.innerHTML = `
        <div class="empty-state">

            <div class="empty-heart-circle">
                ♡
            </div>

            <h2>No favourites yet</h2>

            <p>
                Tap the heart on any menu item
                to save it here for later.
            </p>

            <button
                id="browseBtn"
                type="button"
            >
                Explore food stalls
            </button>

        </div>
    `;


    document
        .getElementById("browseBtn")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "/patron-homepage";

            }
        );

}