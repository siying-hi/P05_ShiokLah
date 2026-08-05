// -- Navigation 

// Grab elements
const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");
const navOverlay = document.getElementById("navOverlay");

// Toggle menu on hamburger click
hamburger.addEventListener("click", () => {

    menu.classList.toggle("show");
    navOverlay.classList.toggle("show");

});

// Close menu when overlay is clicked
navOverlay.addEventListener("click", () => {

    menu.classList.remove("show");
    navOverlay.classList.remove("show");

});


document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname.split("/").pop().toLowerCase();

  document.querySelectorAll(".menu a").forEach(link => {
    const href = link.getAttribute("href");
    if (!href || href === "#" || href.includes("select-role")) return;

    const linkPath = href.split("/").pop().toLowerCase();

    if (currentPath === linkPath || currentPath + ".html" === linkPath) {
      link.classList.add("active");
    }
  });
});
