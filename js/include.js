async function joviIncludeHTML(selector, url) {
  const el = document.querySelector(selector);
  if (!el) {
    console.warn(`[include.js] Nenhum elemento encontrado para "${selector}" nesta página. Verifique se a <div ${selector.replace(/[\[\]]/g, "")}></div> existe no HTML.`);
    return;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Falha ao carregar ${url}: ${res.status}`);
    el.innerHTML = await res.text();
  } catch (err) {
    console.error("[include.js]", err.message);
  }
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
    joviIncludeHTML('[data-include="nav"]', "/pages/components/nav.html"),
    joviIncludeHTML('[data-include="footer"]', "/pages/components/footer.html"),
  ]);
  joviMarkActiveNav();
});