/* Showroom App */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = {
    items: [],
    filtered: [],
    visible: [],
    category: 'web',
    search: '',
    sort: 'featured',
    tags: new Set(),
    allTags: [],
    priceMin: null,
    priceMax: null,
    page: 1,
    pageSize: 9,
    currency: 'TRY',
    theme: localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  };

  const els = {
    tabs: $$('.tab-btn'),
    search: $('#searchInput'),
    sort: $('#sortSelect'),
    grid: $('#itemsGrid'),
    empty: $('#emptyState'),
    summary: $('#summaryBar'),
    activeFilters: $('#activeFilters'),
    clearFilters: $('#clearFiltersBtn'),
    priceMin: $('#priceMin'),
    priceMax: $('#priceMax'),
    pageSize: $('#pageSizeSelect'),
    tagsContainer: $('#tagsContainer'),
    pagination: $('#pagination'),
    currency: document.querySelector('#currencySelect'),
    themeToggle: $('#themeToggle'),
    year: $('#year'),
    modal: $('#itemModal'),
    modalClose: $('#modalClose'),
    modalTitle: $('#modalTitle'),
    modalImage: $('#modalImage'),
    modalDesc: $('#modalDesc'),
    modalBadges: $('#modalBadges'),
    modalDemo: $('#modalDemo'),
    modalRepo: $('#modalRepo'),
    modalBuy: $('#modalBuy')
  };

  // Apply theme
  function applyTheme() {
    const root = document.documentElement;
    if (state.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }

  // Clear filters helper
  function clearFilters() {
    state.search = '';
    state.tags.clear();
    state.priceMin = null;
    state.priceMax = null;
    state.page = 1;
    if (els.search) els.search.value = '';
    if (els.priceMin) els.priceMin.value = '';
    if (els.priceMax) els.priceMax.value = '';
    applyFilters();
    renderTags();
  }
  applyTheme();

  // Footer year
  els.year.textContent = new Date().getFullYear();

  // Default fallback data (used if fetch blocked by file://)
  const fallbackData = [
    {
      id: 'w-portfolio',
      category: 'web',
      title: 'Web Portfolio New',
      description: 'Modern, hızlı ve SEO-dostu kişisel portfolyo şablonu. Tailwind, Alpine ve minimal JS ile.',
      price: 59,
      featured: true,
      tags: ['portfolio', 'tailwind', 'responsive'],
      image: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=1200&auto=format&fit=crop',
      links: {
        demoUrl: 'https://example.com/portfolio-demo',
        repoUrl: 'https://github.com/your/repo',
        buyUrl: 'https://your-store.com/portfolio'
      }
    },
    {
      id: 'd-ticket-bot',
      category: 'discord',
      title: 'Discord Ticket Bot',
      description: 'Bilet sistemi, loglama, mod komutları ve premium queue ile satışa hazır bot.',
      price: 79,
      featured: true,
      tags: ['discord.js', 'tickets', 'moderation'],
      image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop',
      links: {
        demoUrl: 'https://example.com/discord-bot-demo',
        repoUrl: 'https://github.com/your/discord-bot',
        buyUrl: 'https://your-store.com/discord-ticket-bot'
      }
    },
    {
      id: 'api-starter',
      category: 'other',
      title: 'Node API Starter',
      description: 'Express + Prisma + JWT auth hazır backend başlangıç paketi.',
      price: 99,
      featured: false,
      tags: ['node', 'api', 'starter'],
      image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop',
      links: {
        demoUrl: 'https://example.com/api-docs',
        repoUrl: 'https://github.com/your/api-starter',
        buyUrl: 'https://your-store.com/api-starter'
      }
    },
    {
      id: 'w-ecomm',
      category: 'web',
      title: 'E-commerce UI Kit',
      description: 'Tailwind tabanlı alışveriş arayüz seti: ürün gridleri, sepet, checkout akışı.',
      price: 129,
      featured: true,
      tags: ['ecommerce', 'ui', 'tailwind'],
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
      links: {
        demoUrl: 'https://example.com/ecomm-demo',
        repoUrl: 'https://github.com/your/ecomm-kit',
        buyUrl: 'https://your-store.com/ecomm-kit'
      }
    }
  ];

  // Load data
  async function loadData() {
    try {
      const res = await fetch('assets/data/items.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      return Array.isArray(data) ? data : fallbackData;
    } catch (e) {
      console.warn('[showroom] JSON yüklenemedi, fallbackData kullanılacak:', e.message);
      return fallbackData;
    }
  }

  function formatCurrency(n) {
    const usdToTryRate = 40; // 1 USD = 40 TL
    const value = n || 0;
    
    if (state.currency === 'TRY') {
      // Convert USD to TRY
      const tryValue = value * usdToTryRate;
      return '₺' + tryValue.toFixed(2).replace(/\./g, ',');
    } else {
      // Show as USD
      return '$' + value.toFixed(2);
    }
  }

  function renderSummary() {
    const total = state.filtered.length;
    const catLabel = state.category === 'web' ? 'Web Sites' : state.category === 'discord' ? 'Discord Bots' : 'Other';
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    els.summary.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
        <span><strong>${total}</strong> sonuç</span>
        <span class="text-gray-400">•</span>
        <span>Kategori: <strong>${catLabel}</strong></span>
        ${state.search ? `<span class="text-gray-400">•</span><span>Arama: <strong>${state.search}</strong></span>` : ''}
        <span class="text-gray-400">•</span><span>Sayfa: <strong>${state.page}/${totalPages}</strong></span>
      </div>
      <button class="rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-1.5 text-xs" id="summaryClear">Temizle</button>
    `;
    els.summary.classList.remove('hidden');
    $('#summaryClear')?.addEventListener('click', clearFilters);
  }

  function renderActiveFilters() {
    const tags = Array.from(state.tags);
    const has = !!(state.search || tags.length);
    els.activeFilters.classList.toggle('hidden', !has);
    els.activeFilters.innerHTML = '';

    if (state.search) {
      const chip = chipEl('Arama: ' + state.search, () => { state.search = ''; els.search.value = ''; applyFilters(); });
      els.activeFilters.appendChild(chip);
    }
    tags.forEach(t => {
      const chip = chipEl('#' + t, () => { state.tags.delete(t); applyFilters(); });
      els.activeFilters.appendChild(chip);
    });
    if (state.priceMin != null || state.priceMax != null) {
      const label = `Fiyat: ${state.priceMin ?? 0} - ${state.priceMax ?? '∞'} USD`;
      const chip = chipEl(label, () => { state.priceMin = null; state.priceMax = null; if (els.priceMin) els.priceMin.value = ''; if (els.priceMax) els.priceMax.value = ''; applyFilters(); });
      els.activeFilters.appendChild(chip);
    }
  }

  function chipEl(text, onRemove) {
    const el = document.createElement('div');
    el.className = 'inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1 text-xs';
    el.innerHTML = `<span>${text}</span><button class="hover:text-red-500">✖</button>`;
    el.querySelector('button').addEventListener('click', onRemove);
    return el;
  }

  function applyFilters() {
    const q = state.search.trim().toLowerCase();
    const tags = Array.from(state.tags);

    let base = state.items.filter(x => x.category === state.category);
    if (base.length === 0) base = state.items.slice();
    state.filtered = base
      .filter(x => !q || x.title.toLowerCase().includes(q) || x.description.toLowerCase().includes(q) || x.tags.some(t => t.toLowerCase().includes(q)))
      .filter(x => tags.length === 0 || tags.every(t => x.tags.map(s => s.toLowerCase()).includes(t.toLowerCase())))
      .filter(x => (state.priceMin == null || x.price >= state.priceMin) && (state.priceMax == null || x.price <= state.priceMax));

    sortItems();
    paginate();
    renderGrid();
    renderSummary();
    renderActiveFilters();
  }

  function paginate() {
    const total = state.filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;
    const start = (state.page - 1) * state.pageSize;
    state.visible = state.filtered.slice(start, start + state.pageSize);
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (!els.pagination) return;
    els.pagination.innerHTML = '';
    if (totalPages <= 1) return;
    const makeBtn = (label, page, active=false) => {
      const b = document.createElement('button');
      b.className = `px-3 py-1.5 rounded-lg text-sm border ${active ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow'}`;
      b.textContent = label;
      b.dataset.page = page;
      b.addEventListener('click', () => { state.page = page; paginate(); renderGrid(); renderSummary(); });
      return b;
    };
    const frag = document.createDocumentFragment();
    frag.appendChild(makeBtn('‹', Math.max(1, state.page - 1)));
    for (let i = 1; i <= totalPages; i++) frag.appendChild(makeBtn(String(i), i, i === state.page));
    frag.appendChild(makeBtn('›', Math.min(totalPages, state.page + 1)));
    els.pagination.appendChild(frag);
  }

  function sortItems() {
    const s = state.sort;
    const arr = state.filtered;
    if (s === 'featured') {
      arr.sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title));
    } else if (s === 'price-asc') {
      arr.sort((a, b) => a.price - b.price);
    } else if (s === 'price-desc') {
      arr.sort((a, b) => b.price - a.price);
    } else if (s === 'name-asc') {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    } else if (s === 'name-desc') {
      arr.sort((a, b) => b.title.localeCompare(a.title));
    }
  }

  function renderGrid() {
    els.grid.innerHTML = '';
    if (state.filtered.length === 0) {
      els.empty.classList.remove('hidden');
      return;
    }
    els.empty.classList.add('hidden');

    const frag = document.createDocumentFragment();
    (state.visible.length ? state.visible : state.filtered).forEach(item => frag.appendChild(cardEl(item)));
    els.grid.appendChild(frag);
  }

  function cardEl(item) {
    const el = document.createElement('div');
    el.className = 'group card-surface rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-shadow';
    el.innerHTML = `
      <div class="relative">
        <img src="${item.image}" alt="${item.title}" class="h-44 w-full object-cover"/>
        ${item.license ? `<span class="badge ${item.license==='ESCROW' ? 'badge-escrow' : 'badge-open'} absolute top-3 right-3">${item.license}</span>` : ''}
      </div>
      <div class="p-4">
        <h3 class="text-base font-semibold">${item.title}</h3>
        <div class="mt-2 flex flex-wrap gap-2 text-[11px]">
          ${(item.platforms || []).map(p => `<span class="pill-tag">${p}</span>`).join('')}
        </div>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">${item.description}</p>
      </div>
      <div class="px-4 pb-4">
        <div class="price-bar">
          <div class="price-pair">
            ${item.priceOld ? `<span class="price-old">${formatCurrency(item.priceOld)}</span>` : ''}
            <span class="price-now">${formatCurrency(item.price)}</span>
          </div>
          <button class="btn-cart"><span class="ic">＋</span> Add</button>
        </div>
      </div>
    `;

    // Tag interactions
    $$('.tag-chip', el).forEach(b => b.addEventListener('click', () => { state.tags.add(b.dataset.tag); applyFilters(); }));

    // Open modal (bind only if a details button exists)
    const openBtn = $('[data-open]', el);
    if (openBtn) openBtn.addEventListener('click', () => openModal(item));

    return el;
  }

  function openModal(item) {
    els.modalTitle.textContent = item.title;
    els.modalImage.src = item.image;
    els.modalDesc.textContent = item.description;
    els.modalBadges.innerHTML = item.tags.map(t => `<span class="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs">#${t}</span>`).join('');
    els.modalDemo.href = item.links.demoUrl;
    els.modalRepo.href = item.links.repoUrl;
    els.modalBuy.href = item.links.buyUrl;

    showModal(true);
  }

  function showModal(show) {
    const panel = els.modal.querySelector('> div.relative');
    if (show) {
      els.modal.classList.remove('pointer-events-none', 'invisible');
      requestAnimationFrame(() => {
        panel.classList.remove('opacity-0', 'scale-95');
        panel.classList.add('opacity-100', 'scale-100');
      });
    } else {
      panel.classList.add('opacity-0', 'scale-95');
      panel.classList.remove('opacity-100', 'scale-100');
      setTimeout(() => els.modal.classList.add('pointer-events-none', 'invisible'), 150);
    }
  }

  // Close modal handlers
  els.modalClose.addEventListener('click', () => showModal(false));
  els.modal.addEventListener('click', (e) => { if (e.target === els.modal) showModal(false); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') showModal(false); });

  // Early exit if shop DOM not present
  const hasShop = !!els.grid;

  if (hasShop) {
    // Tabs
    els.tabs.forEach(b => b.addEventListener('click', () => {
      els.tabs.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.category = b.dataset.category;
      state.page = 1;
      applyFilters();
    }));

    // Search
    els.search?.addEventListener('input', (e) => { state.search = e.target.value; state.page = 1; applyFilters(); });

    // Sort
    els.sort?.addEventListener('change', (e) => { state.sort = e.target.value; state.page = 1; applyFilters(); });

    // Page size
    els.pageSize?.addEventListener('change', (e) => { state.pageSize = Number(e.target.value) || 9; state.page = 1; paginate(); renderGrid(); renderSummary(); });

    // Price inputs with debounce
    const debounce = (fn, d=250) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), d); }; };
    const onPriceChange = debounce(() => {
      const min = els.priceMin?.value ? Number(els.priceMin.value) : null;
      const max = els.priceMax?.value ? Number(els.priceMax.value) : null;
      state.priceMin = Number.isFinite(min) ? min : null;
      state.priceMax = Number.isFinite(max) ? max : null;
      state.page = 1;
      applyFilters();
    });
    els.priceMin?.addEventListener('input', onPriceChange);
    els.priceMax?.addEventListener('input', onPriceChange);

    // Currency change
    if (els.currency) {
      // Handle changes
      els.currency.addEventListener('change', (e) => {
        state.currency = e.target.value;
        localStorage.setItem('currency', state.currency);
        // Force complete re-render of all items
        state.filtered = [...state.filtered];
        renderGrid();
        renderSummary();
      });
      
      // Set initial value from storage or default to TRY
      state.currency = localStorage.getItem('currency') || 'TRY';
      els.currency.value = state.currency;
    }

    // Clear filters
    els.clearFilters?.addEventListener('click', clearFilters);
  }

  // Theme toggle
  els.themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', state.theme);
    applyTheme();
  });

  // FAQs: restored to native <details>/<summary> behavior (no JS override)

  // Tilt tamamen kaldırıldı

  // Initialize
  (async function init() {
    if (!hasShop) return; // Only initialize listing when shop exists
    state.items = await loadData();
    
    // Set currency from storage or default to TRY
    state.currency = localStorage.getItem('currency') || 'TRY';
    if (els.currency) {
      els.currency.value = state.currency;
    }
    // Build all tags
    const tagSet = new Set();
    state.items.forEach(it => it.tags.forEach(t => tagSet.add(t)));
    state.allTags = Array.from(tagSet).sort((a,b)=>a.localeCompare(b));
    renderTags();
    // Ensure initial category exists
    const cats = new Set(state.items.map(x => x.category));
    if (!cats.has(state.category)) {
      state.category = cats.values().next().value || 'web';
    }
    // Render immediately (fail-safe), then apply filters
    state.filtered = state.items.slice();
    paginate();
    renderGrid();
    renderSummary();
    renderActiveFilters();
    // Now apply real filters with forced currency update
    state.currency = 'TRY';
    if (els.currency) els.currency.value = 'TRY';
    localStorage.setItem('currency', 'TRY');
    applyFilters();
  })();

  function renderTags() {
    if (!els.tagsContainer) return;
    els.tagsContainer.innerHTML = '';
    state.allTags.forEach(tag => {
      const id = 'tag-' + tag.replace(/[^a-z0-9]/gi,'').toLowerCase();
      const wrap = document.createElement('label');
      wrap.className = 'inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 px-2.5 py-1 bg-white dark:bg-gray-900 cursor-pointer';
      wrap.innerHTML = `<input id="${id}" type="checkbox" class="accent-current" /> <span>#${tag}</span>`;
      const input = wrap.querySelector('input');
      input.checked = state.tags.has(tag);
      input.addEventListener('change', () => {
        if (input.checked) state.tags.add(tag); else state.tags.delete(tag);
        state.page = 1;
        applyFilters();
      });
      els.tagsContainer.appendChild(wrap);
    });
  }
})();

