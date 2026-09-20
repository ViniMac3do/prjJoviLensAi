document.addEventListener("DOMContentLoaded", () => {
  // 1. Funcionalidade de Upload de Imagem Local
  const uploadFoto = document.getElementById("upload-foto");
  const imgPreview = document.getElementById("img-preview");

  uploadFoto.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
      // Cria uma URL temporária no navegador para exibir a foto que o usuário escolheu
      const imgURL = URL.createObjectURL(file);
      imgPreview.src = imgURL;
    }
  });

  // 2. Interatividade dos Sliders (Atualizar os números)
  const ranges = document.querySelectorAll(".jovi-controle");
  
  ranges.forEach(range => {
    range.addEventListener("input", function(e) {
      // Pega o valor atual do input range
      const valor = parseInt(e.target.value);
      // Descobre quem é o <span> correspondente trocando "range-" por "val-" no ID
      const targetSpanId = e.target.id.replace("range-", "val-");
      const spanElement = document.getElementById(targetSpanId);
      
      // Formata com o sinal de mais (+) se for positivo, se for zero ou negativo não precisa
      if (valor > 0) {
        spanElement.textContent = "+" + valor;
      } else {
        spanElement.textContent = valor;
      }
    });
  });

  // 3. Funcionalidade do Botão Zerar
  const btnZerar = document.getElementById("btn-zerar");
  
  btnZerar.addEventListener("click", () => {
    ranges.forEach(range => {
      range.value = 0; // Volta a bolinha pro meio
      // Dispara o evento de "input" artificialmente para que o script acima atualize os números para "0"
      range.dispatchEvent(new Event("input"));
    });
  });
});

// ==========================================
// CONTROLES DA TELA DE EDIÇÃO (JOVI LENS AI)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Lógica do Upload de Foto e Empty State
  const uploadFoto = document.getElementById("upload-foto");
  const imgPreview = document.getElementById("img-preview");
  const textoPlaceholder = document.getElementById("texto-placeholder");

  if (uploadFoto && imgPreview && textoPlaceholder) {
    uploadFoto.addEventListener("change", function(event) {
      const file = event.target.files[0];
      if (file) {
        const imgURL = URL.createObjectURL(file);
        imgPreview.src = imgURL;
        
        // Troca a visibilidade
        imgPreview.classList.remove("d-none");
        textoPlaceholder.classList.add("d-none");
      }
    });
  }

  // 2. Lógica de atualização dos números nos sliders
  const ranges = document.querySelectorAll(".jovi-controle");
  
  if (ranges.length > 0) {
    ranges.forEach(range => {
      range.addEventListener("input", function(e) {
        const valor = parseInt(e.target.value);
        const spanElement = document.getElementById(e.target.id.replace("range-", "val-"));
        
        if (spanElement) {
          spanElement.textContent = valor > 0 ? "+" + valor : valor;
        }
      });
    });
  }

  // 3. Lógica do Botão Zerar
  const btnZerar = document.getElementById("btn-zerar");
  
  if (btnZerar && ranges.length > 0) {
    btnZerar.addEventListener("click", () => {
      ranges.forEach(range => {
        range.value = 0; // Volta pro meio
        range.dispatchEvent(new Event("input")); // Dispara a att dos números na tela
      });
    });
  }
});