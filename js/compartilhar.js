/* ==========================================================================
   JOVI LENS AI — LÓGICA DA TELA DE COMPARTILHAR (compartilhar.js)
   Vanilla JS puro — compatível com as regras da Sprint 2. Zero frameworks.
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_CURRENT = 'jovi.current';

  var DEMO_PHOTO = {
    id: 'demo-photo-1',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
    score: 8.4,
    title: 'Paisagem Natural — Crepúsculo',
    caption: 'Luz, tempo e um olhar atento. Registrado e refinado com JOVI Lens AI. #fotografia #joviLens #photography #natureza',
    adjustments: {
      exposicao: 12, contraste: 8, realces: -18,
      sombras: 22, brancos: 6, pretos: -10
    }
  };

  var HASHTAGS = [
    '#fotografia', '#joviLens', '#photography', '#natureza',
    '#foto', '#lightroom', '#Canon', '#fotografiabr',
    '#paisagem', '#landscape', '#photooftheday'
  ];

  var shareContent, emptyState;
  var shareImage, scoreBadge, shareSubtitle;
  var captionTextarea, charCount, btnCopyCaption;
  var hashtagsContainer;
  var socialConfirm, socialName;
  var btnDownload, btnDownloadMain;
  var btnNativeShare;
  var joviToast, joviToastMsg;
  var imageDimensions;
  var btnLoadDemo, btnSimulateEmpty;

  var currentData = null;
  var selectedHashtags = new Set();
  var toastTimer = null;

  function getStoredPhoto() {
    try {
      var raw = localStorage.getItem(STORAGE_CURRENT);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.image) return parsed;
      }
    } catch (e) {
      console.warn('[compartilhar.js] localStorage error:', e);
    }
    return null;
  }

  function saveCurrent(data) {
    try {
      if (data) {
        localStorage.setItem(STORAGE_CURRENT, JSON.stringify(data));
      } else {
        localStorage.removeItem(STORAGE_CURRENT);
      }
    } catch (e) {}
  }

  function showToast(msg, duration) {
    duration = duration || 2400;
    if (!joviToast || !joviToastMsg) return;
    joviToastMsg.textContent = msg;
    joviToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      joviToast.classList.remove('show');
    }, duration);
  }

  function updateCharCount() {
    if (!captionTextarea || !charCount) return;
    var len = captionTextarea.value.length;
    var max = parseInt(captionTextarea.getAttribute('maxlength') || 2200, 10);
    charCount.textContent = len + ' / ' + max;
    charCount.className = 'jovi-char-count';
    if (len > max * 0.9) charCount.classList.add('near-limit');
    if (len >= max) charCount.classList.add('over-limit');
  }

  function renderHashtags() {
    if (!hashtagsContainer) return;
    hashtagsContainer.innerHTML = '';
    HASHTAGS.forEach(function (tag) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'jovi-hashtag' + (selectedHashtags.has(tag) ? ' selected' : '');
      btn.textContent = tag;
      btn.setAttribute('aria-pressed', selectedHashtags.has(tag) ? 'true' : 'false');
      btn.addEventListener('click', function () {
        if (selectedHashtags.has(tag)) {
          selectedHashtags.delete(tag);
        } else {
          selectedHashtags.add(tag);
        }
        syncHashtagsWithCaption();
        renderHashtags();
      });
      hashtagsContainer.appendChild(btn);
    });
  }

  function syncHashtagsWithCaption() {
    if (!captionTextarea) return;
    var text = captionTextarea.value;
    
    // Remove hashtags existentes do final
    var lines = text.split('\n');
    var nonTagLines = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line && line.startsWith('#') && line.split(' ').every(function(w){ return w.startsWith('#'); })) {
        continue;
      }
      nonTagLines.push(lines[i]);
    }
    var baseText = nonTagLines.join('\n').trimEnd();

    if (selectedHashtags.size > 0) {
      var tagsArray = [];
      selectedHashtags.forEach(function(t){ tagsArray.push(t); });
      captionTextarea.value = baseText + '\n\n' + tagsArray.join(' ');
    } else {
      captionTextarea.value = baseText;
    }
    updateCharCount();
  }

  function setupCopyButton() {
    if (!btnCopyCaption) return;
    btnCopyCaption.addEventListener('click', function () {
      var text = captionTextarea ? captionTextarea.value : '';
      if (!text) return;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          btnCopyCaption.classList.add('copied');
          btnCopyCaption.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Legenda copiada!';
          showToast('Legenda copiada para a área de transferência ✓');
          setTimeout(function () {
            btnCopyCaption.classList.remove('copied');
            btnCopyCaption.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar legenda';
          }, 2200);
        }).catch(function () {
          showToast('Erro ao copiar legenda.');
        });
      }
    });
  }

  function setupSocialButtons() {
    var btns = document.querySelectorAll('.jovi-social-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var social = btn.getAttribute('data-social');
        var caption = captionTextarea ? captionTextarea.value : '';

        btns.forEach(function (b) { b.classList.remove('ready'); });
        btn.classList.add('ready');

        if (socialName) socialName.textContent = social;
        if (socialConfirm) socialConfirm.style.display = 'block';

        if (navigator.clipboard && caption) {
          navigator.clipboard.writeText(caption).catch(function () {});
        }

        showToast('Legenda copiada! Redirecionando para ' + social + '...');

        var urls = {
          'WhatsApp': 'https://api.whatsapp.com/send?text=' + encodeURIComponent(caption),
          'Twitter': 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(caption),
          'Facebook': 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href) + '&quote=' + encodeURIComponent(caption),
          'Instagram': 'https://www.instagram.com/',
          'TikTok': 'https://www.tiktok.com/upload'
        };

        var targetUrl = urls[social];
        if (targetUrl) {
          setTimeout(function () {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
          }, 700);
        }
      });
    });
  }

  function setupNativeShare() {
    if (!btnNativeShare) return;
    if (navigator.share) {
      btnNativeShare.style.display = 'inline-flex';
      btnNativeShare.addEventListener('click', function () {
        navigator.share({
          title: 'JOVI Lens AI — Foto com Score ' + (currentData ? Number(currentData.score).toFixed(1) : '8.4'),
          text: captionTextarea ? captionTextarea.value : 'Análise fotográfica pela JOVI Lens AI.',
          url: window.location.href
        }).catch(function (err) {
          console.warn('Web Share cancelado/erro:', err);
        });
      });
    }
  }

  function renderActiveState(data) {
    currentData = data;
    if (shareContent) shareContent.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    if (shareImage) {
      shareImage.src = data.image;
      shareImage.alt = data.title || 'Foto finalizada pronta para compartilhar';
      shareImage.onload = function () {
        if (imageDimensions && shareImage.naturalWidth && shareImage.naturalHeight) {
          imageDimensions.textContent = shareImage.naturalWidth + ' × ' + shareImage.naturalHeight + ' px';
        }
      };
    }

    var score = data.score ? Number(data.score).toFixed(1) : '8.4';
    if (scoreBadge) scoreBadge.textContent = '⭐ Score ' + score;
    if (shareSubtitle) shareSubtitle.textContent = 'Score final ' + score + ' — pronto para publicar.';

    var caption = data.caption || ('Luz, tempo e um olhar atento. Registrado e refinado com JOVI Lens AI. Score ' + score + '/10. #fotografia #joviLens');
    if (captionTextarea) {
      captionTextarea.value = caption;
      updateCharCount();
    }

    if (btnDownload) btnDownload.href = data.image;
    if (btnDownloadMain) btnDownloadMain.href = data.image;

    selectedHashtags.clear();
    selectedHashtags.add('#fotografia');
    selectedHashtags.add('#joviLens');
    renderHashtags();
  }

  function renderEmptyState() {
    currentData = null;
    if (shareContent) shareContent.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
  }

  document.addEventListener('DOMContentLoaded', function () {
    shareContent = document.getElementById('shareContent');
    emptyState = document.getElementById('emptyState');
    shareImage = document.getElementById('shareImage');
    scoreBadge = document.getElementById('scoreBadge');
    shareSubtitle = document.getElementById('shareSubtitle');
    captionTextarea = document.getElementById('captionTextarea');
    charCount = document.getElementById('charCount');
    btnCopyCaption = document.getElementById('btnCopyCaption');
    hashtagsContainer = document.getElementById('hashtagsContainer');
    socialConfirm = document.getElementById('socialConfirm');
    socialName = document.getElementById('socialName');
    btnDownload = document.getElementById('btnDownload');
    btnDownloadMain = document.getElementById('btnDownloadMain');
    btnNativeShare = document.getElementById('btnNativeShare');
    joviToast = document.getElementById('joviToast');
    joviToastMsg = document.getElementById('joviToastMsg');
    imageDimensions = document.getElementById('imageDimensions');
    btnLoadDemo = document.getElementById('btnLoadDemo');
    btnSimulateEmpty = document.getElementById('btnSimulateEmpty');

    var saved = getStoredPhoto();

    if (saved) {
      renderActiveState(saved);
    } else {
      renderEmptyState();
    }

    if (captionTextarea) {
      captionTextarea.addEventListener('input', updateCharCount);
    }
    setupCopyButton();
    setupSocialButtons();
    setupNativeShare();

    if (btnLoadDemo) {
      btnLoadDemo.addEventListener('click', function (e) {
        e.preventDefault();
        saveCurrent(DEMO_PHOTO);
        renderActiveState(DEMO_PHOTO);
        showToast('Foto de demonstração carregada!');
      });
    }

    if (btnSimulateEmpty) {
      btnSimulateEmpty.addEventListener('click', function (e) {
        e.preventDefault();
        saveCurrent(null);
        renderEmptyState();
        showToast('Exibindo estado vazio do protótipo');
      });
    }
  });
})();