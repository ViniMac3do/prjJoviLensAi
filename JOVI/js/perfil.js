// Trato de fallback das imagens caso não carreguem
function handleLogoError(img) {
  img.classList.add('d-none');
  const fallback = document.getElementById('joviLogoFallback');
  if (fallback) fallback.classList.remove('d-none');
}

function handleAvatarError(img) {
  img.src = 'https://ui-avatars.com/api/?name=Alice+Carvalho&background=0D8ABC&color=fff';
}

document.addEventListener('DOMContentLoaded', () => {

  // Instâncias dos Modais Bootstrap
  const editModalEl = document.getElementById('editProfileModal');
  const photoModalEl = document.getElementById('photoLightboxModal');
  
  const editModal = editModalEl ? new bootstrap.Modal(editModalEl) : null;
  const photoModal = photoModalEl ? new bootstrap.Modal(photoModalEl) : null;

  // Troca de abas da navegação inferior
  const navItems = document.querySelectorAll('.nav-item-custom');
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      
      navItems.forEach(nav => {
        nav.classList.remove('active');
        const icon = nav.querySelector('i').className;
        nav.innerHTML = `<i class="${icon}"></i><span>${nav.getAttribute('data-tab')}</span>`;
      });

      this.classList.add('active');
      const currentIcon = this.querySelector('i').className;
      this.innerHTML = `
        <div class="active-pill">
          <i class="${currentIcon}"></i>
          <span>${tabName}</span>
        </div>
      `;
    });
  });


  // Função global para abrir modal de fotos na galeria
  window.openPhotoModal = function(imageUrl, title, likes) {
    const lightboxImg = document.getElementById('lightboxImage');
    const modalTitle = document.getElementById('photoModalTitle');
    const likesText = document.getElementById('photoLikesCountText');

    if (lightboxImg) lightboxImg.src = imageUrl;
    if (modalTitle) modalTitle.innerText = title || 'Visualizar Foto';
    if (likesText) likesText.innerText = likes || '120 curtidas';
    
    if (photoModal) photoModal.show();
  };

  // Botão de curtir no modal da foto
  const likeModalBtn = document.getElementById('likePhotoModalBtn');
  if (likeModalBtn) {
    likeModalBtn.addEventListener('click', function() {
      this.classList.toggle('btn-danger');
      this.classList.toggle('btn-outline-danger');
    });
  }
});