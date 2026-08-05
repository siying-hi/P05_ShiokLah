//To be linked to every html page after login
const logoutButton = document.getElementById("logoutBtn");

if (logoutButton) {

    logoutButton.addEventListener("click", logout);

}


async function logout(event) {

    event.preventDefault();

    const accessToken = sessionStorage.getItem("accessToken");

    await fetch("http://localhost:3000/logout", {

        method: "POST",

        headers: {
            Authorization: `Bearer ${accessToken}`
        }

    });

    sessionStorage.clear();

    window.location.href = "/select-role";

}