const hamburger = document.getElementById("hamburger");
const sideNav = document.getElementById("sideNav");
const overlay = document.querySelector(".nav-overlay");

if (hamburger && sideNav && overlay) {
  hamburger.addEventListener("click", () => {
    sideNav.classList.toggle("show");
    overlay.classList.toggle("show");
  });

  overlay.addEventListener("click", () => {
    sideNav.classList.remove("show");
    overlay.classList.remove("show");
  });
}

// document.addEventListener("DOMContentLoaded", () => {
//   const currentPath = window.location.pathname.split("/").pop().toLowerCase();

//   document.querySelectorAll(".nav-links a, .side-menu a").forEach(link => {
//     const href = link.getAttribute("href");
//     if (!href || href === "#" || href.includes("select-role")) return;

//     const linkPath = href.split("/").pop().toLowerCase();

//     // Match with or without .html
//     if (currentPath === linkPath || currentPath + ".html" === linkPath) {
//       link.classList.add("active");
//     }
//   });
// });
