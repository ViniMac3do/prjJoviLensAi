(function () {
  const STORAGE_KEY_LEVEL = "jovi_user_level";

  const levelCards = document.querySelectorAll(".jovi-level-card");
  const continuarBtn = document.getElementById("jovi-btn-continuar");
  let selectedLevel = null;

  levelCards.forEach((card) => {
    card.addEventListener("click", () => {
      levelCards.forEach((c) => c.classList.remove("jovi-level-selected"));
      card.classList.add("jovi-level-selected");
      selectedLevel = card.dataset.level;
      continuarBtn.disabled = false;
    });
  });

  continuarBtn.addEventListener("click", () => {
    if (!selectedLevel) return;
    localStorage.setItem(STORAGE_KEY_LEVEL, selectedLevel);
    window.location.href = "/pages/dashboard.html";
  });
})();