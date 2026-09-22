/* ==========================================================================
   JOVI LENS AI — LÓGICA DA TELA DE PERFIL (perfil.js)
   Vanilla JS puro — compatível com a Sprint 2.
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_PROFILE = 'jovi.profile';

  var LEVEL_DESCRIPTIONS = {
    'Iniciante': 'Dicas diretas sobre o básico da boa foto: horizonte, regras simples e luz suave.',
    'Intermediário': 'Composição com mais profundidade, linhas guia e leitura de contraste na cena.',
    'Avançado': 'Análise com nuances técnicas, curva tonal, histograma e intenção visual refinada.'
  };

  var profileDisplayName, avatarInitial, heroLevelBadge;
  var userNameInput, levelDescription, profileForm;
  var profileToast, profileToastMsg;
  var toastTimer = null;

  function loadProfile() {
    try {
      var raw = localStorage.getItem(STORAGE_PROFILE);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.name) return parsed;
      }
    } catch (e) {
      console.warn('[perfil.js] Erro ao carregar perfil:', e);
    }
    return {
      name: 'Astro',
      level: 'Avançado',
      styles: ['Minimalista']
    };
  }

  function saveProfile(data) {
    try {
      localStorage.setItem(STORAGE_PROFILE, JSON.stringify(data));
    } catch (e) {}
  }

  function showToast(msg) {
    if (!profileToast || !profileToastMsg) return;
    profileToastMsg.textContent = msg || 'Preferências salvas com sucesso!';
    profileToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      profileToast.classList.remove('show');
    }, 2400);
  }

  function applyProfileToUI(profile) {
    var name = profile.name || 'Astro';
    if (profileDisplayName) profileDisplayName.textContent = name;
    if (userNameInput) userNameInput.value = name;
    if (avatarInitial) avatarInitial.textContent = name.charAt(0).toUpperCase();

    var level = profile.level || 'Avançado';
    if (heroLevelBadge) heroLevelBadge.textContent = level;
    if (levelDescription) levelDescription.textContent = LEVEL_DESCRIPTIONS[level] || '';

    var radio = document.querySelector('input[name="experienceLevel"][value="' + level + '"]');
    if (radio) radio.checked = true;

    var styles = profile.styles || ['Minimalista'];
    var checkboxes = document.querySelectorAll('input[name="photoStyle"]');
    checkboxes.forEach(function (cb) {
      cb.checked = styles.indexOf(cb.value) !== -1;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    profileDisplayName = document.getElementById('profileDisplayName');
    avatarInitial = document.getElementById('avatarInitial');
    heroLevelBadge = document.getElementById('heroLevelBadge');
    userNameInput = document.getElementById('userNameInput');
    levelDescription = document.getElementById('levelDescription');
    profileForm = document.getElementById('profileForm');
    profileToast = document.getElementById('profileToast');
    profileToastMsg = document.getElementById('profileToastMsg');

    var profile = loadProfile();
    applyProfileToUI(profile);

    // Atualiza nome e inicial em tempo real enquanto o usuário digita
    if (userNameInput) {
      userNameInput.addEventListener('input', function () {
        var val = userNameInput.value.trim();
        var displayName = val || 'Astro';
        if (profileDisplayName) profileDisplayName.textContent = displayName;
        if (avatarInitial) avatarInitial.textContent = displayName.charAt(0).toUpperCase();
      });
    }

    // Atualiza a descrição de nível ao selecionar os radios
    var radios = document.querySelectorAll('input[name="experienceLevel"]');
    radios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        var selected = radio.value;
        if (heroLevelBadge) heroLevelBadge.textContent = selected;
        if (levelDescription) levelDescription.textContent = LEVEL_DESCRIPTIONS[selected] || '';
      });
    });

    // Submissão do formulário
    if (profileForm) {
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var chosenLevel = 'Avançado';
        var checkedRadio = document.querySelector('input[name="experienceLevel"]:checked');
        if (checkedRadio) chosenLevel = checkedRadio.value;

        var chosenStyles = [];
        var checkedBoxes = document.querySelectorAll('input[name="photoStyle"]:checked');
        checkedBoxes.forEach(function (cb) {
          chosenStyles.push(cb.value);
        });

        var updated = {
          name: userNameInput.value.trim() || 'Astro',
          level: chosenLevel,
          styles: chosenStyles
        };

        saveProfile(updated);
        showToast('Perfil e preferências atualizados!');
      });
    }
  });
})();