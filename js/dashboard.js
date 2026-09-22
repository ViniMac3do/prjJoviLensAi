(function () {
  const MAX_FILE_SIZE_MB = 20;
  const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
  const STORAGE_KEY_LEVEL = "jovi_user_level";

  const dropzone = document.getElementById("jovi-dropzone");
  const fileInput = document.getElementById("jovi-file-input");
  const selectBtn = document.getElementById("jovi-select-file-btn");
  const emptyState = document.getElementById("jovi-dropzone-empty");
  const previewState = document.getElementById("jovi-dropzone-preview");
  const previewImage = document.getElementById("jovi-preview-image");
  const previewFilename = document.getElementById("jovi-preview-filename");
  const removeBtn = document.getElementById("jovi-preview-remove");
  const analyzeBtn = document.getElementById("jovi-analyze-btn");
  const errorEl = document.getElementById("jovi-dropzone-error");

  const levelLabel = document.getElementById("jovi-user-level");
  const changeLevelBtn = document.getElementById("jovi-change-level-btn");
  const levelOptions = document.querySelectorAll(".jovi-level-option");

  const recentEmpty = document.getElementById("jovi-recent-empty");
  const recentGrid = document.getElementById("jovi-recent-grid");

  let currentPhoto = null;

  function loadLevel() {
    levelLabel.textContent = localStorage.getItem(STORAGE_KEY_LEVEL) || "Iniciante";
  }

  changeLevelBtn.addEventListener("click", () => {
    bootstrap.Modal.getOrCreateInstance(document.getElementById("joviLevelModal")).show();
  });

  levelOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem(STORAGE_KEY_LEVEL, btn.dataset.level);
      levelLabel.textContent = btn.dataset.level;
      bootstrap.Modal.getOrCreateInstance(document.getElementById("joviLevelModal")).hide();
    });
  });

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove("d-none");
  }

  function clearError() {
    errorEl.classList.add("d-none");
  }

  function validateFile(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Formato não suportado. Envie um arquivo JPG ou PNG.";
    }
    if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
      return `Arquivo muito grande. O limite é ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  }

  function archiveCurrentPhoto() {
    if (!currentPhoto) return;

    recentEmpty.classList.add("d-none");
    recentGrid.classList.remove("d-none");

    const card = document.createElement("div");
    card.className = "jovi-recent-card";
    card.innerHTML = `
      <img src="${currentPhoto.dataUrl}" alt="${currentPhoto.name}">
      <div class="jovi-recent-card-score">${currentPhoto.name}</div>
    `;
    recentGrid.prepend(card);
  }

  function showPreview(file, dataUrl) {
    currentPhoto = { name: file.name, dataUrl };
    previewImage.src = dataUrl;
    previewFilename.textContent = file.name;
    emptyState.classList.add("d-none");
    previewState.classList.remove("d-none");
  }

  function resetToEmpty() {
    currentPhoto = null;
    fileInput.value = "";
    previewState.classList.add("d-none");
    emptyState.classList.remove("d-none");
  }

  function handleFile(file) {
    clearError();
    const error = validateFile(file);
    if (error) {
      showError(error);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      archiveCurrentPhoto();
      showPreview(file, e.target.result);
    };
    reader.readAsDataURL(file);
  }

  selectBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  dropzone.addEventListener("click", () => {
    if (previewState.classList.contains("d-none")) fileInput.click();
  });

  dropzone.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && previewState.classList.contains("d-none")) {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
  });

  ["dragenter", "dragover"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add("jovi-dropzone-dragover");
    });
  });

  ["dragleave", "drop"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove("jovi-dropzone-dragover");
    });
  });

  dropzone.addEventListener("drop", (e) => {
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    resetToEmpty();
    clearError();
  });

  analyzeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    archiveCurrentPhoto();
    resetToEmpty();
  });

  loadLevel();
})();