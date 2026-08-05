// Shared NEA theme logic: applies the selected light or dark appearance.
(function () {
  const STORAGE_KEY = "neaOfficerTheme";

  function applyTheme(theme) {
    const mode = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.neaTheme = mode;
    localStorage.setItem(STORAGE_KEY, mode);

    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      button.classList.toggle("active", button.dataset.themeChoice === mode);
    });
  }

  const savedTheme = localStorage.getItem(STORAGE_KEY) || "dark";
  applyTheme(savedTheme);

  document.addEventListener("click", (event) => {
    const logoutLink = event.target.closest('a[href="/logout"]');
    if (logoutLink) {
      event.preventDefault();

      const accessToken = sessionStorage.getItem("accessToken");
      const headers = accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {};

      fetch("/logout", {
        method: "POST",
        headers,
        keepalive: true
      }).catch(() => {});

      sessionStorage.clear();
      window.location.replace("/login");
      return;
    }

    const themeButton = event.target.closest("[data-theme-choice]");
    if (themeButton) {
      applyTheme(themeButton.dataset.themeChoice);
    }
  });
})();
