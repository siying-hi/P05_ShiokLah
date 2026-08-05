const complaintAccessToken =
    sessionStorage.getItem("accessToken");

if (!complaintAccessToken) {

    alert("Please log in to continue.");

    window.location.href = "/select-role";

}

const complaintForm =
    document.getElementById("complaintForm");

const stallSelect =
    document.getElementById("compStallSelect");

const dishSelect =
    document.getElementById("compDishSelect");

const purchaseDate =
    document.getElementById("compDate");

const foodIssue =
    document.getElementById("compFoodIssue");

const serviceIssue =
    document.getElementById("compServiceIssue");

const comments =
    document.getElementById("compComments");

const editComplaintId =
    document.getElementById("editComplaintId");

const submitButton =
    document.getElementById("compSubmitButton");

const complaintHistoryList =
    document.getElementById("complaintHistoryList");

const complaintHistoryButton =
    document.getElementById("tab-history-comp");

const complaintSubmitButton =
    document.getElementById("tab-submit-comp");

let complaints = [];


async function loadStalls() {

    try {

        const response = await fetch(
            "/api/complaint/stalls",
            {
                headers: {
                    Authorization:
                        `Bearer ${sessionStorage.getItem("accessToken")}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to retrieve stalls."
            );

            return;

        }

        stallSelect.innerHTML =
            '<option value="">Choose the stall...</option>';

        const addedStallNames = [];

        data.forEach(function (stall) {

            const stallName =
                stall.stall_name.trim();

            if (
                !addedStallNames.includes(stallName)
            ) {

                const option =
                    document.createElement("option");

                option.value =
                    stall.stall_id;

                option.textContent =
                    stallName;

                stallSelect.appendChild(option);

                addedStallNames.push(stallName);

            }

        });

    }
    catch (error) {

        console.error(error);

        alert("Unable to load stalls.");

    }

}

async function loadMenuItems(
    stallId,
    selectedItemId
) {

    if (!stallId) {

        dishSelect.disabled = true;

        dishSelect.innerHTML =
            '<option value="">Select a stall first...</option>';

        return;

    }

    dishSelect.disabled = true;

    dishSelect.innerHTML =
        '<option value="">Loading dishes...</option>';

    try {

        const response = await fetch(

            `/api/complaint/stalls/${stallId}/menu-items`,

            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
                }
            }

        );

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to retrieve menu items."
            );

            return;

        }

        dishSelect.innerHTML =
            '<option value="">Choose the dish...</option>';

        data.forEach(function (item) {

            const option =
                document.createElement("option");

option.value =
    item.item_id;

            option.textContent =
                item.item_name;

if (
    selectedItemId &&
    Number(item.item_id) ===
    Number(selectedItemId)
) {
    option.selected = true;
}

            dishSelect.appendChild(option);

        });

        dishSelect.disabled = false;

    }
    catch (error) {

        console.error(error);

        alert("Unable to load menu items.");

    }

}
async function loadComplaints() {

    complaintHistoryList.innerHTML =
        "<p>Loading complaint history...</p>";

    try {

        const response = await fetch(
            "/api/complaint",
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            complaintHistoryList.innerHTML = "";

            alert(
                data.message ||
                "Failed to retrieve complaints."
            );

            return;

        }

        complaints = data;

        displayComplaints();

    }
    catch (error) {

        console.error(error);

        complaintHistoryList.innerHTML =
            "<p>Unable to load complaint history.</p>";

    }

}


function displayComplaints() {

    complaintHistoryList.innerHTML = "";

    if (complaints.length === 0) {

        complaintHistoryList.innerHTML =
            "<p>You have not submitted any complaints yet.</p>";

        return;

    }

    complaints.forEach(function (complaint) {

        const complaintCard =
            document.createElement("div");

        complaintCard.className =
            "history-card";

        const itemHeading =
            document.createElement("h3");

        itemHeading.textContent =
            complaint.item_name;

        const stallText =
            document.createElement("p");

        stallText.textContent =
            "Stall: " +
            complaint.stall_name;

        const dateText =
            document.createElement("p");

        dateText.textContent =
            "Purchase Date: " +
            complaint.purchase_date.substring(0, 10);

        const foodText =
            document.createElement("p");

        foodText.textContent =
            "Food Issue: " +
            complaint.food_issue;

        const serviceText =
            document.createElement("p");

        serviceText.textContent =
            "Service Issue: " +
            complaint.service_issue;

        const commentsText =
            document.createElement("p");

        commentsText.textContent =
            "Additional Comments: " +
            (
                complaint.additional_comments ||
                "None"
            );

        const statusText =
            document.createElement("p");

        statusText.textContent =
            "Status: " +
            complaint.complaint_status;

        complaintCard.appendChild(itemHeading);
        complaintCard.appendChild(stallText);
        complaintCard.appendChild(dateText);
        complaintCard.appendChild(foodText);
        complaintCard.appendChild(serviceText);
        complaintCard.appendChild(commentsText);
        complaintCard.appendChild(statusText);

        if (
            complaint.complaint_status ===
            "Pending Review"
        ) {

const actionsRow =
    document.createElement("div");

actionsRow.className =
    "card-actions-row";

const editButton =
    document.createElement("button");

editButton.type = "button";
editButton.textContent = "Edit";
editButton.className =
    "action-btn edit-btn";

editButton.addEventListener(
    "click",
    function () {

        editComplaint(
            complaint.complaint_id
        );

    }
);

const deleteButton =
    document.createElement("button");

deleteButton.type = "button";
deleteButton.textContent = "Delete";
deleteButton.className =
    "action-btn delete-btn";

deleteButton.addEventListener(
    "click",
    function () {

        deleteComplaint(
            complaint.complaint_id
        );

    }
);

actionsRow.appendChild(editButton);
actionsRow.appendChild(deleteButton);

complaintCard.appendChild(actionsRow);

        }

        complaintHistoryList.appendChild(
            complaintCard
        );

    });

}
async function editComplaint(complaintId) {

    let selectedComplaint = null;

    complaints.forEach(function (complaint) {

        if (
            complaint.complaint_id ===
            complaintId
        ) {

            selectedComplaint =
                complaint;

        }

    });

    if (!selectedComplaint) {

        alert("Complaint not found.");

        return;

    }

    editComplaintId.value =
        selectedComplaint.complaint_id;

    purchaseDate.value =
        selectedComplaint.purchase_date.substring(
            0,
            10
        );

    foodIssue.value =
        selectedComplaint.food_issue;

    serviceIssue.value =
        selectedComplaint.service_issue;

    comments.value =
        selectedComplaint.additional_comments || "";

stallSelect.value =
    selectedComplaint.stall_id;

await loadMenuItems(
    selectedComplaint.stall_id,
    selectedComplaint.item_id
);

    submitButton.textContent =
        "Update Complaint";

    complaintSubmitButton.click();

}


async function deleteComplaint(complaintId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this complaint?"
    );

    if (!confirmDelete) {

        return;

    }

    try {

        const response = await fetch(

            `/api/complaint/${complaintId}`,

            {
                method: "DELETE",

                headers: {
                    Authorization:
                        `Bearer ${sessionStorage.getItem("accessToken")}`
                }

            }

        );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete complaint."
            );

            return;

        }

        alert(data.message);

        loadComplaints();

    }
    catch (error) {

        console.error(error);

        alert(
            "Unable to delete complaint."
        );

    }

}


function resetComplaintForm() {

    complaintForm.reset();

    editComplaintId.value = "";

    submitButton.textContent =
        "Submit Complaint";

    dishSelect.disabled = true;

    dishSelect.innerHTML =
        '<option value="">Select a stall first...</option>';

}
complaintForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

 const complaint = {

    orderId: null,

    stallId:
        Number(stallSelect.value),

    itemId:
        Number(dishSelect.value),

    purchaseDate:
        purchaseDate.value,

    foodIssue:
        foodIssue.value.trim(),

    serviceIssue:
        serviceIssue.value.trim(),

    additionalComments:
        comments.value.trim()

};

        let url =
            "/api/complaint";

        let method =
            "POST";

        if (editComplaintId.value) {

            url =
                `/api/complaint/${editComplaintId.value}`;

            method =
                "PUT";

        }

        try {

            const response = await fetch(

                url,

                {
                    method: method,

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${sessionStorage.getItem("accessToken")}`

                    },

                    body:
                        JSON.stringify(complaint)

                }

            );

            const data =
                await response.json();

            if (!response.ok) {

                if (data.errors) {

                    alert(
                        data.errors.join("\n")
                    );

                }
                else {

                    alert(
                        data.message ||
                        "Failed to save complaint."
                    );

                }

                return;

            }

            alert(data.message);

            resetComplaintForm();

            await loadComplaints();

            complaintHistoryButton.click();

        }
        catch (error) {

            console.error(error);

            alert(
                "Unable to save complaint."
            );

        }

    }
);


stallSelect.addEventListener(
    "change",
    function () {

        loadMenuItems(
            stallSelect.value,
            null
        );

    }
);


complaintHistoryButton.addEventListener(
    "click",
    function () {

        loadComplaints();

    }
);


document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadStalls();

    }
);