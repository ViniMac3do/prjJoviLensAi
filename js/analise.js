/* ==========================================================================
   JOVI LENS AI — LÓGICA DA TELA DE ANÁLISE (analise.js)
   Interatividade pura em Vanilla JS (compatível com Sprint 2).
   ========================================================================== */

(function () {
  'use strict';

  // Chaves do localStorage sincronizadas com o protótipo e store do JOVI
  const STORAGE_CURRENT = 'jovi.current';
  const STORAGE_PROFILE = 'jovi.profile';

  // Foto de demonstração inicial caso o usuário abra direto analise.html
  // Imagem fotográfica com iluminação cinematográfica (paisagem / arquitetura)
  const DEMO_PHOTO = {
    id: 'demo-photo-1',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
    score: 8.4,
    createdAt: Date.now(),
    title: 'Paisagem Natural — Demonstração JOVI',
    suggestions: [
      {
        area: 'Composição',
        text: 'Reposicione o ponto de interesse sobre a linha superior dos terços para equilibrar o peso visual do horizonte.',
        x: 34,
        y: 30
      },
      {
        area: 'Iluminação',
        text: 'Aproveite a luz lateral do crepúsculo para recuperar realces suaves e destacar a textura do relevo.',
        x: 68,
        y: 52
      },
      {
        area: 'Enquadramento',
        text: 'Feche ligeiramente o enquadramento na base para eliminar áreas sem informação e direcionar o olhar.',
        x: 48,
        y: 76
      }
    ],
    summary: 'Boa base: a cena tem leitura clara. Com os ajustes sugeridos o score pode subir cerca de 1 ponto.',
    adjustments: {
      exposicao: 12,
      contraste: 8,
      realces: -18,
      sombras: 22,
      brancos: 6,
      pretos: -10
    }
  };

  // Elementos do DOM
  let analysisImage;
  let gridOverlay;
  let pinsContainer;
  let toggleSuggestions;
  let scoreValue;
  let gaugeProgress;
  let aiSummaryText;
  let suggestionsContainer;
  let quickUploadInput;

  let currentData = null;
  let activeIndex = 0;

  // Carrega ou inicializa os dados da análise
  function loadAnalysisData() {
    try {
      const stored = localStorage.getItem(STORAGE_CURRENT);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.image) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[analise.js] Erro ao ler localStorage:', e);
    }

    // Salva a foto demo no storage para manter a coerência de navegação entre telas
    try {
      localStorage.setItem(STORAGE_CURRENT, JSON.stringify(DEMO_PHOTO));
    } catch (e) {}

    return DEMO_PHOTO;
  }

  // Animação suave do Score Gauge
  function animateGauge(targetScore) {
    const radius = 81; // R = 81
    const totalLength = Math.PI * radius; // ~254.47px para meio arco
    const ratio = Math.max(0, Math.min(1, targetScore / 10));
    const targetOffset = totalLength * (1 - ratio);

    // Reset inicial para animação de subida
    gaugeProgress.style.strokeDashoffset = totalLength;

    setTimeout(() => {
      gaugeProgress.style.strokeDashoffset = targetOffset;
    }, 150);

    // Contagem numérica progressiva
    let startVal = 0;
    const duration = 1200;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing suave (easeOutCubic)
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentScore = (startVal + (targetScore - startVal) * ease).toFixed(1);
      scoreValue.textContent = currentScore;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        scoreValue.textContent = Number(targetScore).toFixed(1);
      }
    }

    requestAnimationFrame(updateCounter);
  }

  // Renderiza os pins sobrepostos à imagem
  function renderPins(suggestions) {
    pinsContainer.innerHTML = '';

    suggestions.forEach((sug, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `jovi-pin-btn ${index === activeIndex ? 'active' : ''}`;
      btn.style.left = `${sug.x}%`;
      btn.style.top = `${sug.y}%`;
      btn.setAttribute('data-index', index);
      btn.setAttribute('aria-label', `Sugestão de ${sug.area}`);

      btn.innerHTML = `
        <span class="jovi-pin-dot"></span>
        <span>${sug.area}</span>
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveSuggestion(index);
      });

      pinsContainer.appendChild(btn);
    });
  }

  // Renderiza a lista de cards de sugestão na sidebar
  function renderSuggestionsList(suggestions) {
    suggestionsContainer.innerHTML = '';

    suggestions.forEach((sug, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `jovi-suggestion-card ${index === activeIndex ? 'active' : ''}`;
      card.setAttribute('data-index', index);

      card.innerHTML = `
        <div class="jovi-suggestion-header">
          <span class="jovi-suggestion-tag">${sug.area}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-secondary">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <p class="jovi-suggestion-text">${sug.text}</p>
      `;

      card.addEventListener('click', () => {
        setActiveSuggestion(index);
      });

      suggestionsContainer.appendChild(card);
    });
  }

  // Sincroniza a seleção entre os Pins e os Cards
  function setActiveSuggestion(index) {
    activeIndex = index;

    // Atualiza classes dos pins
    const pins = pinsContainer.querySelectorAll('.jovi-pin-btn');
    pins.forEach((pin) => {
      const pIdx = parseInt(pin.getAttribute('data-index'), 10);
      if (pIdx === index) {
        pin.classList.add('active');
      } else {
        pin.classList.remove('active');
      }
    });

    // Atualiza classes dos cards
    const cards = suggestionsContainer.querySelectorAll('.jovi-suggestion-card');
    cards.forEach((card) => {
      const cIdx = parseInt(card.getAttribute('data-index'), 10);
      if (cIdx === index) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  // Permite trocar a foto rapidamente para testar com imagem local
  function setupQuickUpload() {
    if (!quickUploadInput) return;

    quickUploadInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (evt) {
        const base64 = evt.target.result;
        // Gera score dinâmico coerente baseado no protótipo
        const dynamicScore = Number((6.8 + Math.random() * 2.6).toFixed(1));
        const updatedData = {
          ...currentData,
          id: 'upload-' + Date.now(),
          image: base64,
          score: dynamicScore,
          createdAt: Date.now()
        };

        currentData = updatedData;
        try {
          localStorage.setItem(STORAGE_CURRENT, JSON.stringify(updatedData));
        } catch (err) {}

        renderAll();
      };
      reader.readAsDataURL(file);
    });
  }

  // Renderiza toda a interface com os dados atuais
  function renderAll() {
    if (!currentData) return;

    analysisImage.src = currentData.image;

    if (currentData.summary) {
      aiSummaryText.textContent = currentData.summary;
    }

    renderPins(currentData.suggestions);
    renderSuggestionsList(currentData.suggestions);
    animateGauge(currentData.score);
  }

  // Inicialização principal
  document.addEventListener('DOMContentLoaded', () => {
    analysisImage = document.getElementById('analysisImage');
    gridOverlay = document.getElementById('gridOverlay');
    pinsContainer = document.getElementById('pinsContainer');
    toggleSuggestions = document.getElementById('toggleSuggestions');
    scoreValue = document.getElementById('scoreValue');
    gaugeProgress = document.getElementById('gaugeProgress');
    aiSummaryText = document.getElementById('aiSummaryText');
    suggestionsContainer = document.getElementById('suggestionsContainer');
    quickUploadInput = document.getElementById('quickUploadInput');

    // Carrega dados da foto
    currentData = loadAnalysisData();

    // Toggle de exibição da regra dos terços e pins
    if (toggleSuggestions) {
      toggleSuggestions.addEventListener('change', (e) => {
        const show = e.target.checked;
        if (show) {
          gridOverlay.classList.remove('is-hidden');
          pinsContainer.classList.remove('is-hidden');
        } else {
          gridOverlay.classList.add('is-hidden');
          pinsContainer.classList.add('is-hidden');
        }
      });
    }

    setupQuickUpload();
    renderAll();
  });
})();