/* ==========================================================================
   JOVI LENS AI — LÓGICA DA TELA DE PERFIL (perfil.js)
   Vanilla JS puro e moderno — compatível com a Sprint 2.
   ========================================================================== */

const STORAGE_PROFILE = 'jovi.profile';

const LEVEL_DESCRIPTIONS = {
  'Iniciante': 'Dicas diretas sobre o básico da boa foto: horizonte, regras simples e luz suave.',
  'Intermediário': 'Composição com mais profundidade, linhas guia e leitura de contraste na cena.',
  'Avançado': 'Análise com nuances técnicas, curva tonal, histograma e intenção visual refinada.'
};

let toastTimer = null;

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.name) return parsed;
    }
  } catch (err) {
    console.warn('[perfil.js] Não foi possível carregar o perfil local:', err);
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
  } catch (err) {
    console.error('[perfil.js] Erro ao salvar perfil:', err);
  }
}

function showToast(message) {
  const profileToast = document.getElementById('profileToast');
  const profileToastMsg = document.getElementById('profileToastMsg');
  if (!profileToast || !profileToastMsg) return;

  profileToastMsg.textContent = message || 'Preferências salvas com sucesso!';
  profileToast.classList.add('show');
  
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    profileToast.classList.remove('show');
  }, 2400);
}

function applyProfileToUI(profile) {
  const profileDisplayName = document.getElementById('profileDisplayName');
  const avatarInitial = document.getElementById('avatarInitial');
  const heroLevelBadge = document.getElementById('heroLevelBadge');
  const userNameInput = document.getElementById('userNameInput');
  const levelDescription = document.getElementById('levelDescription');

  const name = profile.name || 'Astro';
  if (profileDisplayName) profileDisplayName.textContent = name;
  if (userNameInput) userNameInput.value = name;
  if (avatarInitial) avatarInitial.textContent = name.charAt(0).toUpperCase();

  const level = profile.level || 'Avançado';
  if (heroLevelBadge) heroLevelBadge.textContent = level;
  if (levelDescription) levelDescription.textContent = LEVEL_DESCRIPTIONS[level] || '';

  const radio = document.querySelector(`input[name="experienceLevel"][value="${level}"]`);
  if (radio) radio.checked = true;

  const styles = profile.styles || ['Minimalista'];
  const checkboxes = document.querySelectorAll('input[name="photoStyle"]');
  checkboxes.forEach((cb) => {
    cb.checked = styles.includes(cb.value);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const userNameInput = document.getElementById('userNameInput');
  const profileDisplayName = document.getElementById('profileDisplayName');
  const avatarInitial = document.getElementById('avatarInitial');
  const heroLevelBadge = document.getElementById('heroLevelBadge');
  const levelDescription = document.getElementById('levelDescription');
  const profileForm = document.getElementById('profileForm');

  const profile = loadProfile();
  applyProfileToUI(profile);

  // Atualiza nome e inicial em tempo real enquanto o usuário digita
  if (userNameInput) {
    userNameInput.addEventListener('input', () => {
      const val = userNameInput.value.trim();
      const displayName = val || 'Astro';
      if (profileDisplayName) profileDisplayName.textContent = displayName;
      if (avatarInitial) avatarInitial.textContent = displayName.charAt(0).toUpperCase();
    });
  }

  // Atualiza a descrição de nível ao selecionar os radios
  const radios = document.querySelectorAll('input[name="experienceLevel"]');
  radios.forEach((radio) => {
    radio.addEventListener('change', () => {
      const selected = radio.value;
      if (heroLevelBadge) heroLevelBadge.textContent = selected;
      if (levelDescription) levelDescription.textContent = LEVEL_DESCRIPTIONS[selected] || '';
    });
  });

  // Submissão do formulário de preferências
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let chosenLevel = 'Avançado';
      const checkedRadio = document.querySelector('input[name="experienceLevel"]:checked');
      if (checkedRadio) chosenLevel = checkedRadio.value;

      const chosenStyles = [];
      const checkedBoxes = document.querySelectorAll('input[name="photoStyle"]:checked');
      checkedBoxes.forEach((cb) => {
        chosenStyles.push(cb.value);
      });

      const updated = {
        name: (userNameInput ? userNameInput.value.trim() : '') || 'Astro',
        level: chosenLevel,
        styles: chosenStyles
      };

      saveProfile(updated);
      showToast('Perfil e preferências atualizados!');
    });
  }
});