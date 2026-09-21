/* ==========================================================================
   JOVI LENS AI — LÓGICA DA TELA DE ANÁLISE (analise.js)
   Interatividade pura em Vanilla JS (compatível com Sprint 2).
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_CURRENT = 'jovi.current';

  // Ícones SVG para cada área de análise
  const ICONS = {
    'Composição': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>`,
    'Iluminação': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>`,
    'Enquadramento': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>`
  };

  const DEMO_PHOTO = {
    id: 'demo-photo-1',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
    score: 8.4,
    createdAt: Date.now(),
    title: 'Paisagem Natural — Demonstração JOVI',
    subscores: {
      composicao: 8.8,
      iluminacao: 8.0,
      enquadramento: 8.4
    },
    suggestions: [
      {
        area: 'Composição',
        text: 'Reposicione o ponto de interesse sobre a linha superior dos terços para equilibrar o peso visual do horizonte.',
        impact: '+0.4 pt',
        x: 34,
        y: 30
      },
      {
        area: 'Iluminação',
        text: 'Aproveite a luz lateral do crepúsculo para recuperar realces suaves e destacar a textura do relevo.',
        impact: '+0.3 pt',
        x: 68,
        y: 52
      },
      {
        area: 'Enquadramento',
        text: 'Feche ligeiramente o enquadramento na base para eliminar áreas sem informação e direcionar o olhar.',
        impact: '+0.3 pt',
        x: 48,
        y: 76
      }
    ],
    summary: 'Boa base: a cena tem leitura clara. Com os ajustes abaixo o score pode subir cerca de 1 ponto.',
    adjustments: {
      exposicao: 12,
      contraste: 8,
      realces: -18,
      sombras: 22,
      brancos: 6,
      pretos: -10
    }
  };

  let analysisImage;
  let gridOverlay;
  let pinsContainer;
  let toggleSuggestions;
  let scoreValue;
  let gaugeProgress;
  let aiSummaryText;
  let suggestionsContainer;
  let quickUploadInput;
  let subComposicao;
  let subIluminacao;
  let subEnquadramento;

  let currentData = null;
  let activeIndex = 0;

  function loadAnalysisData() {
    try {
      const stored = localStorage.getItem(STORAGE_CURRENT);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.image) {
          if (!parsed.subscores) {
            parsed.subscores = {
              composicao: (parsed.score + 0.3).toFixed(1),
              iluminacao: (parsed.score - 0.4).toFixed(1),
              enquadramento: parsed.score.toFixed(1)
            };
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[analise.js] Erro ao ler localStorage:', e);
    }

    try {
      localStorage.setItem(STORAGE_CURRENT, JSON.stringify(DEMO_PHOTO));
    } catch (e) {}

    return DEMO_PHOTO;
  }

  function animateGauge(targetScore) {
    const radius = 90; // R = 90
    const totalLength = Math.PI * radius; // ~282.74px
    const ratio = Math.max(0, Math.min(1, targetScore / 10));
    const targetOffset = totalLength * (1 - ratio);

    gaugeProgress.style.strokeDasharray = totalLength;
    gaugeProgress.style.strokeDashoffset = totalLength;

    setTimeout(() => {
      gaugeProgress.style.strokeDashoffset = targetOffset;
    }, 150);

    let startVal = 0;
    const duration = 700;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
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

      const iconSvg = ICONS[sug.area] || '';

      btn.innerHTML = `
        <span class="jovi-pin-icon-wrap">${iconSvg}</span>
        <span>${sug.area}</span>
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveSuggestion(index);
      });

      pinsContainer.appendChild(btn);
    });
  }

  function renderSuggestionsList(suggestions) {
    suggestionsContainer.innerHTML = '';

    suggestions.forEach((sug, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `jovi-suggestion-card ${index === activeIndex ? 'active' : ''}`;
      card.setAttribute('data-index', index);

      const iconSvg = ICONS[sug.area] || '';
      const impactText = sug.impact || '+0.3 pt';

      card.innerHTML = `
        <div class="jovi-suggestion-header">
          <div class="jovi-suggestion-title-group">
            <span class="jovi-suggestion-icon text-secondary">${iconSvg}</span>
            <span class="jovi-suggestion-tag">${sug.area}</span>
          </div>
          <span class="jovi-impact-pill">${impactText}</span>
        </div>
        <p class="jovi-suggestion-text">${sug.text}</p>
      `;

      card.addEventListener('click', () => {
        setActiveSuggestion(index);
      });

      suggestionsContainer.appendChild(card);
    });
  }

  function setActiveSuggestion(index) {
    activeIndex = index;

    const pins = pinsContainer.querySelectorAll('.jovi-pin-btn');
    pins.forEach((pin) => {
      const pIdx = parseInt(pin.getAttribute('data-index'), 10);
      if (pIdx === index) {
        pin.classList.add('active');
      } else {
        pin.classList.remove('active');
      }
    });

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

  function setupQuickUpload() {
    if (!quickUploadInput) return;

    quickUploadInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (evt) {
        const base64 = evt.target.result;
        const dynamicScore = Number((6.8 + Math.random() * 2.6).toFixed(1));
        const updatedData = {
          ...currentData,
          id: 'upload-' + Date.now(),
          image: base64,
          score: dynamicScore,
          subscores: {
            composicao: Math.min(9.9, dynamicScore + 0.3).toFixed(1),
            iluminacao: Math.max(5.0, dynamicScore - 0.4).toFixed(1),
            enquadramento: dynamicScore.toFixed(1)
          },
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

  function renderAll() {
    if (!currentData) return;

    analysisImage.src = currentData.image;

    if (currentData.summary) {
      aiSummaryText.textContent = currentData.summary;
    }

    if (currentData.subscores) {
      if (subComposicao) subComposicao.textContent = Number(currentData.subscores.composicao || 8.8).toFixed(1);
      if (subIluminacao) subIluminacao.textContent = Number(currentData.subscores.iluminacao || 8.0).toFixed(1);
      if (subEnquadramento) subEnquadramento.textContent = Number(currentData.subscores.enquadramento || 8.4).toFixed(1);
    }

    renderPins(currentData.suggestions);
    renderSuggestionsList(currentData.suggestions);
    animateGauge(currentData.score);
  }

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
    subComposicao = document.getElementById('subComposicao');
    subIluminacao = document.getElementById('subIluminacao');
    subEnquadramento = document.getElementById('subEnquadramento');

    currentData = loadAnalysisData();

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