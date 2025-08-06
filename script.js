/* =========================
   i18n CORE
   ========================= */
const SUPPORTED_LANGS = ['it', 'en', 'pt', 'es', 'fr']; // le 5 lingue che hai scelto
const DEFAULT_LANG = 'it';
const I18N_BASE = './i18n';

let currentLang = DEFAULT_LANG;
let translations = {};
let fallbackTranslations = {};
const translationsCache = new Map();
let appBootstrapped = false;

document.addEventListener('DOMContentLoaded', initI18n);

async function initI18n() {
  // Carico sempre l’italiano come fallback
  fallbackTranslations = await fetchJSON(`${I18N_BASE}/it.json`);

  // Lingua iniziale (localStorage -> browser -> default)
  currentLang = getInitialLang();

  // Imposta lingua & render
  await setLang(currentLang);

  // Listener sui bottoni lingua
  bindLangButtons();
}

function getInitialLang() {
  const saved = localStorage.getItem('lang');
  if (saved && SUPPORTED_LANGS.includes(saved)) return saved;

  const nav = (navigator.language || navigator.userLanguage || '').slice(0, 2);
  if (SUPPORTED_LANGS.includes(nav)) return nav;

  return DEFAULT_LANG;
}

async function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  currentLang = lang;

  translations = await fetchJSON(`${I18N_BASE}/${lang}.json`);

  // Testi statici
  applyTranslations();

  // <html lang="">
  document.documentElement.setAttribute('lang', lang);

  // <title> e meta description
  document.title = t('meta.title');
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', t('meta.description'));

  // Testi dinamici (menu & drinks)
  renderAllLists();

  // UI state & persistenza
  markActiveLang(lang);
  localStorage.setItem('lang', lang);

  // >>> aggiorna il padding-top calcolato per header/main-content
  updateLangSwitcherOffset(); // <-- QUI

  // Bootstrap dell'app la prima volta
  if (!appBootstrapped) {
    bootstrapApp();
    appBootstrapped = true;
  }
}

function bindLangButtons() {
  document.querySelectorAll('.lang-switcher [data-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
}

function markActiveLang(lang) {
  document.querySelectorAll('.lang-switcher [data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

async function fetchJSON(url) {
  if (translationsCache.has(url)) return translationsCache.get(url);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    translationsCache.set(url, json);
    return json;
  } catch (err) {
    console.warn('Errore nel caricare:', url, err);
    return {};
  }
}

function t(key) {
  return translations[key] ?? fallbackTranslations[key] ?? key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr'); // es. placeholder, aria-label…
    const value = t(key);

    if (attr) {
      el.setAttribute(attr, value);
    } else {
      el.textContent = value;
    }
  });
}

/* =========================
   DATI MENU (solo chiavi + image + price)
   I testi (name/desc) vengono presi dai JSON
   ========================= */
const menuConfig = {
  pizzas: [
    { key: 'pizza_margherita', image: 'img/pizza-margherita.jpg', price: '€12.00' },
    { key: 'pizza_napoletana', image: 'img/pizza-napoletana.jpg', price: '€14.00' },
    { key: 'pizza_quattro_stagioni', image: 'img/pizza-quattro-stagioni.jpg', price: '€16.00' },
    { key: 'pizza_diavola', image: 'img/pizza-diavola.jpg', price: '€15.00' },
    { key: 'pizza_capricciosa', image: 'img/pizza-capricciosa.jpg', price: '€15.50' },
    { key: 'pizza_quattro_formaggi', image: 'img/pizza-quattro-formaggi.jpg', price: '€14.50' },
    { key: 'pizza_marinara', image: 'img/pizza-marinara.jpg', price: '€10.00' },
    { key: 'pizza_prosciutto_e_funghi', image: 'img/pizza-prosciutto-funghi.jpg', price: '€14.00' }
  ],

  antipasti: [
    { key: 'insalata_caprese', image: 'img/insalata-caprese.jpg', price: '€9.00' },
    { key: 'insalatona_della_casa', image: 'img/insalatona-mista.jpg', price: '€11.00' },
    { key: 'caesar_salad', image: 'img/caesar-salad.jpg', price: '€10.50' }
  ],

  dolci: [
    { key: 'tiramisu', image: 'img/tiramisu.jpg', price: '€6.00' },
    { key: 'cannoli_siciliani', image: 'img/cannoli.jpg', price: '€5.50' },
    { key: 'panna_cotta_ai_frutti_di_bosco', image: 'img/panna-cotta.jpg', price: '€5.00' },
    { key: 'gelato_artigianale', image: 'img/gelato.jpg', price: '€4.50' }
  ]
};

const drinksConfig = {
  caffetteria: [
    { key: 'espresso', price: '€1.50', desc: false },
    { key: 'cappuccino', price: '€2.00', desc: false },
    { key: 'caffe_americano', price: '€2.50', desc: false },
    { key: 'macchiato', price: '€1.80', desc: false },
    { key: 'caffe_corretto', price: '€2.50', desc: false }
  ],

  bibite: [
    { key: 'coca_cola', price: '€3.00', desc: false },
    { key: 'aranciata_san_pellegrino', price: '€3.00', desc: false },
    { key: 'limonata_san_pellegrino', price: '€3.00', desc: false },
    { key: 'acqua_naturale_1l', price: '€2.50', desc: false },
    { key: 'acqua_frizzante_1l', price: '€2.50', desc: false }
  ],

  birre: [
    { key: 'peroni_nastro_azzurro', price: '€4.00', desc: false },
    { key: 'moretti_alla_spina', price: '€3.50', desc: false },
    { key: 'corona_extra', price: '€4.50', desc: false },
    { key: 'birra_artigianale_ipa', price: '€5.00', desc: false }
  ],

  vini: [
    { key: 'chianti_classico_docg_calice', price: '€5.00', desc: false },
    { key: 'prosecco_di_valdobbiadene_docg', price: '€4.50', desc: false },
    { key: 'pinot_grigio_delle_venezie_igt', price: '€4.00', desc: false },
    { key: 'sangiovese_di_toscana_igt', price: '€4.50', desc: false },
    { key: 'limoncello_bicchierino', price: '€3.00', desc: false }
  ]
};

/* =========================
   RENDER MENU & DRINKS
   ========================= */
function renderAllLists() {
  // Menu (grid con immagini)
  renderMenuSectionGrid('pizzas-grid', menuConfig.pizzas, 'menu.pizzas');
  renderMenuSectionGrid('antipasti-grid', menuConfig.antipasti, 'menu.antipasti');
  renderMenuSectionGrid('dolci-grid', menuConfig.dolci, 'menu.dolci');

  // Drinks (liste semplici)
  renderDrinksSection('caffetteria-list', drinksConfig.caffetteria, 'drinks.caffetteria');
  renderDrinksSection('bibite-list', drinksConfig.bibite, 'drinks.bibite');
  renderDrinksSection('birre-list', drinksConfig.birre, 'drinks.birre');
  renderDrinksSection('vini-list', drinksConfig.vini, 'drinks.vini');
}

function renderMenuSectionGrid(sectionId, items, prefix) {
  const container = document.getElementById(sectionId);
  if (!container) return;

  // loader
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  setTimeout(() => {
    container.innerHTML = '';
    items.forEach((item, index) => {
      const card = createMenuCard(item, prefix);
      setTimeout(() => container.appendChild(card), index * 100);
    });
  }, 200);
}

function renderDrinksSection(sectionId, items, prefix) {
  const container = document.getElementById(sectionId);
  if (!container) return;

  container.innerHTML = '';
  items.forEach(item => {
    const drinkItem = createDrinkItem(item, prefix);
    container.appendChild(drinkItem);
  });
}

function createMenuCard(item, prefix) {
  const nameKey = `${prefix}.${item.key}.name`;
  const descKey = `${prefix}.${item.key}.desc`;

  const name = t(nameKey);
  const desc = t(descKey); // esiste per tutte le pizze/antipasti/dolci

  const card = document.createElement('div');
  card.className = 'menu-card fade-in';

  card.innerHTML = `
    <img src="${item.image}" alt="${name}" class="menu-card-image"
         onerror="this.src='https://via.placeholder.com/300x200?text=Immagine+non+disponibile'">
    <div class="menu-card-content">
      <h3 class="menu-card-name">${name}</h3>
      <p class="menu-card-description">${desc}</p>
      <div class="menu-card-price">${item.price}</div>
    </div>
  `;
  return card;
}

function createDrinkItem(item, prefix) {
  const nameKey = `${prefix}.${item.key}.name`;
  const name = t(nameKey);

  const drinkItem = document.createElement('div');
  drinkItem.className = 'drink-item';

  drinkItem.innerHTML = `
    <span class="drink-name">${name}</span>
    <span class="drink-price">${item.price}</span>
  `;
  return drinkItem;
}

/* =========================
   EXTRA (animazioni, effetti, ecc.)
   ========================= */

function bootstrapApp() {
  console.log('Bootstrap effetti & ottimizzazioni…');
  setTimeout(() => {
    addScrollAnimations();
    addInteractiveEffects();
    addSmoothScrolling();
    optimizePerformance();
  }, 300);
}

// Gestione degli errori delle immagini (se vuoi usarla altrove)
function handleImageError(img) {
  img.src = 'https://via.placeholder.com/300x200?text=Immagine+non+disponibile';
  img.alt = 'Immagine non disponibile';
}

// Animazioni on scroll
function addScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section').forEach(section => observer.observe(section));
}

function addInteractiveEffects() {
  const header = document.querySelector('.header');
  const isMobile = matchMedia('(max-width: 1024px)').matches;

  // Parallax solo su desktop, e throttled con requestAnimationFrame
  if (!isMobile && header) {
    let raf = null;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const scrolled = window.pageYOffset || document.documentElement.scrollTop;
        header.style.transform = `translateY(${scrolled * 0.5}px)`;
        raf = null;
      });
    });
  }

  // Hover card menu
  document.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.menu-card');
    if (card) card.style.transform = 'translateY(-8px) scale(1.03)';
  });
  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.menu-card');
    if (card) card.style.transform = 'translateY(0) scale(1)';
  });
}

// Smooth scrolling per gli anchor
function addSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Un semplice lazy-loading custom (se usi data-src)
function optimizePerformance() {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

/* =========================
   Esport (opzionale)
   ========================= */
window.VillaToscana = {
  setLang,
  t,
  renderAllLists
};

/* =========================
   Lang switcher offset (desktop)
   ========================= */
function updateLangSwitcherOffset() {
  const ls = document.querySelector('.lang-switcher');
  if (!ls) return;

  const isDesktop = !matchMedia('(max-width: 1024px)').matches;
  const extra = 16; // piccolo margine sotto allo switcher su desktop
  const h = isDesktop ? (ls.getBoundingClientRect().height + extra) : 0;

  document.documentElement.style.setProperty('--lang-switcher-h', h + 'px');
}

// utility per non ricalcolare mille volte su resize
function debounce(fn, wait = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

window.addEventListener('load', updateLangSwitcherOffset);
window.addEventListener('resize', debounce(updateLangSwitcherOffset, 150));