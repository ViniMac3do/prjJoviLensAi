/*
  JOVI LENS AI — include.js
  Injeta assets/partials/nav.html e footer.html nas divs com
  [data-include="nav"] e [data-include="footer"].

  IMPORTANTE: fetch() de arquivo local só funciona servindo o site por HTTP
  (ex: extensão "Live Server" do VS Code, ou GitHub Pages). Abrir o .html
  direto no navegador (file://) vai falhar por causa do CORS do navegador —
  isso não é um bug do código, é restrição de segurança do próprio browser.

  Uso em cada página:
    <body data-page="dashboard">
      <div data-include="nav"></div>
      ... conteúdo da página ...
      <div data-include="footer"></div>
      <script src="assets/js/include.js"></script>
    </body>
*/

async function joviIncludeHTML(selector, paths) {
  const el = document.querySelector(selector);
  if (!el) return;
  const pathList = Array.isArray(paths) ? paths : [paths];
  for (const url of pathList) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        el.innerHTML = await res.text();
        return;
      }
    } catch (err) {}
  }
  console.error(`[include.js] Falha ao carregar ${pathList.join(", ")} — rodando via file://? Use um servidor local (ex: Live Server).`);
}

function joviMarkActiveNav() {
  const currentPage = document.body.dataset.page;
  if (!currentPage) return;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === currentPage) {
      link.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    joviIncludeHTML('[data-include="nav"]', ["pages/components/nav.html", "assets/partials/nav.html"]),
    joviIncludeHTML('[data-include="footer"]', ["pages/components/footer.html", "assets/partials/footer.html"]),
  ]);
  joviMarkActiveNav();
});