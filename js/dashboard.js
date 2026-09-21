(function () {
  const MAX_FILE_SIZE_MB = 20;
  const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
  const STORAGE_KEY_LEVEL = "jovi_user_level";
  const STORAGE_KEY_RECENT = "jovi_recent_analyses";
  const STORAGE_KEY_PENDING = "jovi_pending_upload";

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

  let selectedFile = null;
  let selectedFileDataUrl = null;

  function loadLevel() {
    const saved = localStorage.getItem(STORAGE_KEY_LEVEL) || "Iniciante";
    levelLabel.textContent = saved;
  }

  function saveLevel(level) {
    localStorage.setItem(STORAGE_KEY_LEVEL, level);
    levelLabel.textContent = level;
  }

  changeLevelBtn.addEventListener("click", () => {
    const modalEl = document.getElementById("joviLevelModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  });

  levelOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      saveLevel(btn.dataset.level);
      const modalEl = document.getElementById("joviLevelModal");
      bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    });
  });

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove("d-none");
  }

  function clearError() {
    errorEl.classList.add("d-none");
    errorEl.textContent = "";
  }

  function validateFile(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Formato não suportado. Envie um arquivo JPG ou PNG.";
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_SIZE_MB) {
      return `Arquivo muito grande (${sizeMb.toFixed(1)}MB). O limite é ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  }

  function handleFile(file) {
    clearError();
    const error = validateFile(file);
    if (error) {
      showError(error);
      return;
    }

    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedFileDataUrl = e.target.result;
      previewImage.src = selectedFileDataUrl;
      previewFilename.textContent = file.name;
      emptyState.classList.add("d-none");
      previewState.classList.remove("d-none");
    };
    reader.readAsDataURL(file);
  }

  selectBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  dropzone.addEventListener("click", () => {
    if (previewState.classList.contains("d-none")) {
      fileInput.click();
    }
  });

  dropzone.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && previewState.classList.contains("d-none")) {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });

  ["dragenter", "dragover"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("jovi-dropzone-dragover");
    });
  });

  ["dragleave", "drop"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("jovi-dropzone-dragover");
    });
  });

  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    selectedFile = null;
    selectedFileDataUrl = null;
    fileInput.value = "";
    previewState.classList.add("d-none");
    emptyState.classList.remove("d-none");
    clearError();
  });

  analyzeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!selectedFileDataUrl) return;

    localStorage.setItem(
      STORAGE_KEY_PENDING,
      JSON.stringify({
        filename: selectedFile.name,
        dataUrl: selectedFileDataUrl,
        level: localStorage.getItem(STORAGE_KEY_LEVEL) || "Iniciante",
      })
    );

    window.location.href = "analise.html";
  });

  function loadRecent() {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT);
    const items = raw ? JSON.parse(raw) : [];

    if (items.length === 0) {
      recentEmpty.classList.remove("d-none");
      recentGrid.classList.add("d-none");
      return;
    }

    recentEmpty.classList.add("d-none");
    recentGrid.classList.remove("d-none");
    recentGrid.innerHTML = "";

    items
      .slice()
      .reverse()
      .forEach((item) => {
        const card = document.createElement("div");
        card.className = "jovi-recent-card";
        card.innerHTML = `
          <img src="${item.dataUrl}" alt="${item.filename}">
          <div class="jovi-recent-card-score">⭐ ${item.score}/10</div>
        `;
        recentGrid.appendChild(card);
      });
  }

  loadLevel();
  loadRecent();
})();