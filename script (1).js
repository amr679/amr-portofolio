'use strict';

/* =========================================================
   Amr Hossam Mostafa | Portfolio
   1. CONFIG        (edit your contact details here)
   2. Core site     (theme, nav, scroll spy, contact form)
   3. Projects      (card data + modal)
   4. Demos         (store, tasks, expenses, weather, quiz, students)
   ========================================================= */

/* ---------------------------------------------------------
   1. CONFIG: fill these in. Empty values are hidden/handled.
   --------------------------------------------------------- */
const CONFIG = {
  email: '',     // e.g. 'name@example.com'  (used by the contact form and Email link)
  github: '',    // e.g. 'https://github.com/your-username'
  linkedin: ''   // e.g. 'https://www.linkedin.com/in/your-profile'
};

/* ---------------------------------------------------------
   Helpers
   --------------------------------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const icon = (name) => `<svg class="ic" aria-hidden="true"><use href="#i-${name}"/></svg>`;

const storage = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable: demo still works in memory */ }
  }
};

/* ---------------------------------------------------------
   2. Core site
   --------------------------------------------------------- */

/* Theme toggle */
(function initTheme() {
  const root = document.documentElement;
  const btn = $('#theme-toggle');
  const sync = () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#0a0f24' : '#f4f6ff');
  };
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('amr-theme', next); } catch { /* ignore */ }
    sync();
  });
  sync();
})();

/* Mobile menu */
(function initMenu() {
  const toggle = $('#menu-toggle');
  const links = $('#nav-links');
  const setOpen = (open) => {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) { setOpen(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (links.classList.contains('open') && !e.target.closest('.nav')) setOpen(false);
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', () => setOpen(false));
})();

/* Active section highlighting */
(function initScrollSpy() {
  const navLinks = $$('.nav-link');
  const sections = navLinks.map((l) => $(l.getAttribute('href'))).filter(Boolean);
  const setActive = () => {
    const y = window.scrollY + 140;
    let current = sections[0];
    sections.forEach((s) => { if (s.offsetTop <= y) current = s; });
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) current = sections[sections.length - 1];
    navLinks.forEach((l) => {
      const on = l.getAttribute('href') === '#' + current.id;
      l.classList.toggle('active', on);
      if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(() => { setActive(); ticking = false; }); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', setActive);
  setActive();
})();

/* Footer year */
$('#year').textContent = new Date().getFullYear();

/* Contact links + form */
(function initContact() {
  const list = $('#contact-links');
  const items = [];
  if (CONFIG.email) items.push({ href: 'mailto:' + CONFIG.email, label: CONFIG.email, ic: 'mail' });
  if (CONFIG.github) items.push({ href: CONFIG.github, label: 'GitHub', ic: 'github', ext: true });
  if (CONFIG.linkedin) items.push({ href: CONFIG.linkedin, label: 'LinkedIn', ic: 'linkedin', ext: true });

  list.innerHTML = items.length
    ? items.map((i) => `<li><a href="${esc(i.href)}"${i.ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${icon(i.ic)}<span>${esc(i.label)}</span></a></li>`).join('')
    : `<li class="contact-empty">Contact links will appear here once they are added in the CONFIG block at the top of script.js.</li>`;

  const form = $('#contact-form');
  const status = $('#form-status');
  const setErr = (id, msg) => { $('#err-' + id).textContent = msg; };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    let valid = true;

    setErr('name', ''); setErr('email', ''); setErr('message', '');
    status.className = 'form-status'; status.textContent = '';

    if (!name) { setErr('name', 'Enter your name.'); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('email', 'Enter a valid email address.'); valid = false; }
    if (message.length < 10) { setErr('message', 'Write a message of at least 10 characters.'); valid = false; }
    if (!valid) { const first = $('.err:not(:empty)', form); if (first) first.previousElementSibling.focus(); return; }

    if (!CONFIG.email) {
      status.className = 'form-status bad';
      status.textContent = 'This form is not connected yet. Add your email to CONFIG in script.js to enable it.';
      return;
    }
    const subject = encodeURIComponent('Portfolio message from ' + name);
    const body = encodeURIComponent(message + '\n\nFrom: ' + name + ' (' + email + ')');
    window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
    status.className = 'form-status ok';
    status.textContent = 'Your email app should open with the message ready to send.';
    form.reset();
  });
})();

/* ---------------------------------------------------------
   3. Projects: card data + modal
   --------------------------------------------------------- */
const PROJECTS = [
  {
    id: 'store', title: 'E-Commerce Website', ic: 'cart', c1: '#3b63e6', c2: '#6d3ee0',
    desc: 'An online store frontend with product search, category filters, and a working shopping cart with quantity controls and live totals.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    future: 'ASP.NET Core Web API, Entity Framework Core, SQL Server',
    note: 'Frontend only. Products are sample data in the browser and nothing is sent to a server.'
  },
  {
    id: 'tasks', title: 'Task Management App', ic: 'check', c1: '#6d3ee0', c2: '#3358d8',
    desc: 'Add, edit, complete, search, and filter tasks, with live statistics and saved data between visits.',
    tech: ['HTML', 'CSS', 'JavaScript', 'localStorage'],
    future: 'ASP.NET Core Web API, authentication, SQL Server persistence',
    note: 'Tasks are saved with localStorage: they live only in this browser on this device. It is not a database and clearing site data removes them.'
  },
  {
    id: 'expenses', title: 'Expense Tracker', ic: 'wallet', c1: '#2a6fdb', c2: '#4f46e5',
    desc: 'Record income and expenses, see your balance, and view spending by category as simple bars.',
    tech: ['HTML', 'CSS', 'JavaScript', 'localStorage'],
    future: 'ASP.NET Core Web API with EF Core and SQL Server',
    note: 'Entries are saved with localStorage in this browser only. No account or server is involved.'
  },
  {
    id: 'weather', title: 'Weather Dashboard', ic: 'cloud', c1: '#1f8bd6', c2: '#5b5bf0',
    desc: 'Search for a city and see current conditions plus a 5-day forecast, with a safe fallback when the network is unavailable.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Fetch API'],
    future: 'A small ASP.NET Core API that proxies and caches weather requests',
    note: 'Uses the free Open-Meteo API (no key needed). If it cannot be reached, sample data is shown instead.'
  },
  {
    id: 'quiz', title: 'C# & .NET Quiz', ic: 'help', c1: '#5a4be0', c2: '#8b5cf6',
    desc: 'Eight multiple-choice questions on C#, .NET, SQL, and web basics, with instant feedback and explanations.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    future: 'Questions and scores served by ASP.NET Core Web API and SQL Server',
    note: 'Questions are stored in the page. Scores are not saved anywhere.'
  },
  {
    id: 'students', title: 'Student Records Manager', ic: 'users', c1: '#2f5fe0', c2: '#7c3aed',
    desc: 'A CRUD interface with search, sorting, and a form to create, edit, and delete records, built around a small data-service layer.',
    tech: ['HTML', 'CSS', 'JavaScript', 'localStorage'],
    future: 'Swap the data service for fetch calls to an ASP.NET Core Web API',
    note: 'Sample records are stored with localStorage in this browser only. The data layer is written so it can later call a real API.'
  }
];

const DEMOS = {}; // filled in section 4

(function initProjects() {
  const grid = $('#projects-grid');
  grid.innerHTML = PROJECTS.map((p) => `
    <article class="card proj-card">
      <div class="proj-visual" style="--c1:${p.c1};--c2:${p.c2}" aria-hidden="true">
        ${icon(p.ic)}
        <span class="proj-mini"><span></span><span></span><span></span></span>
      </div>
      <div class="proj-body">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.desc)}</p>
        <ul class="tech-badges" aria-label="Technologies used">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <p class="proj-future"><strong>Future extension:</strong> ${esc(p.future)}</p>
        <button class="btn btn-primary btn-sm" type="button" data-demo="${p.id}">${icon('play')} Open demo</button>
      </div>
    </article>`).join('');

  const modal = $('#demo-modal');
  const body = $('#demo-body');
  let cleanup = null;

  const open = (id) => {
    const p = PROJECTS.find((x) => x.id === id);
    if (!p || !DEMOS[id]) return;
    $('#demo-title').textContent = p.title;
    $('#demo-note').textContent = p.note;
    body.innerHTML = '';
    cleanup = DEMOS[id](body) || null;
    document.body.classList.add('modal-open');
    modal.showModal();
    body.scrollTop = 0;
  };
  const close = () => modal.close();

  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-demo]');
    if (b) open(b.dataset.demo);
  });
  $('#demo-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  modal.addEventListener('close', () => {
    if (typeof cleanup === 'function') cleanup();
    cleanup = null;
    body.innerHTML = '';
    document.body.classList.remove('modal-open');
  });
})();

/* ---------------------------------------------------------
   4. Demos
   --------------------------------------------------------- */

/* ===== Demo 1: E-Commerce ===== */
DEMOS.store = (root) => {
  const PRODUCTS = [
    { id: 1, name: 'Wireless Headphones', cat: 'Electronics', price: 79.99, em: '🎧', c1: '#3b63e6', c2: '#6d3ee0' },
    { id: 2, name: 'Mechanical Keyboard', cat: 'Electronics', price: 109.0, em: '⌨️', c1: '#4f46e5', c2: '#7c3aed' },
    { id: 3, name: 'Smart Watch', cat: 'Electronics', price: 149.5, em: '⌚', c1: '#2a6fdb', c2: '#4f46e5' },
    { id: 4, name: 'Laptop Backpack', cat: 'Accessories', price: 54.9, em: '🎒', c1: '#5a4be0', c2: '#8b5cf6' },
    { id: 5, name: 'Phone Stand', cat: 'Accessories', price: 14.99, em: '📱', c1: '#1f8bd6', c2: '#5b5bf0' },
    { id: 6, name: 'USB-C Hub', cat: 'Accessories', price: 39.0, em: '🔌', c1: '#3358d8', c2: '#6d3ee0' },
    { id: 7, name: 'Desk Lamp', cat: 'Home Office', price: 34.5, em: '💡', c1: '#2f5fe0', c2: '#7c3aed' },
    { id: 8, name: 'Ergonomic Chair', cat: 'Home Office', price: 229.0, em: '💺', c1: '#4338ca', c2: '#6d3ee0' },
    { id: 9, name: 'Standing Desk Mat', cat: 'Home Office', price: 44.0, em: '🧘', c1: '#2a6fdb', c2: '#8b5cf6' },
    { id: 10, name: 'C# Programming Book', cat: 'Books', price: 32.0, em: '📘', c1: '#3b63e6', c2: '#5a4be0' },
    { id: 11, name: 'SQL Fundamentals Guide', cat: 'Books', price: 27.5, em: '📗', c1: '#1f8bd6', c2: '#4f46e5' },
    { id: 12, name: 'Web Design Handbook', cat: 'Books', price: 29.0, em: '📙', c1: '#5b5bf0', c2: '#8b5cf6' }
  ];
  const cats = ['All', ...new Set(PRODUCTS.map((p) => p.cat))];
  const st = { q: '', cat: 'All', cart: {} };

  root.innerHTML = `
    <div class="d-store">
      <div class="d-toolbar">
        <label class="d-search">${icon('search')}<input type="search" placeholder="Search products" aria-label="Search products" data-role="q"></label>
        <button class="btn btn-ghost btn-sm" type="button" data-act="toggle-cart" aria-expanded="false">${icon('cart')} Cart <span class="d-count" data-role="count">0</span></button>
      </div>
      <div class="d-chips" role="group" aria-label="Filter by category" data-role="chips"></div>
      <div class="d-grid" data-role="grid"></div>
      <aside class="d-cart" data-role="cart" aria-label="Shopping cart" hidden></aside>
    </div>`;

  const $q = (r) => $(`[data-role="${r}"]`, root);
  const cartCount = () => Object.values(st.cart).reduce((a, b) => a + b, 0);

  const renderChips = () => {
    $q('chips').innerHTML = cats.map((c) => `<button class="chip" type="button" data-cat="${esc(c)}" aria-pressed="${c === st.cat}">${esc(c)}</button>`).join('');
  };
  const renderGrid = () => {
    const q = st.q.trim().toLowerCase();
    const list = PRODUCTS.filter((p) => (st.cat === 'All' || p.cat === st.cat) && (!q || p.name.toLowerCase().includes(q)));
    $q('grid').innerHTML = list.length
      ? list.map((p) => `
        <article class="prod">
          <div class="prod-img" style="--c1:${p.c1};--c2:${p.c2}" aria-hidden="true">${p.em}</div>
          <div class="prod-info">
            <h4>${esc(p.name)}</h4>
            <span class="prod-cat">${esc(p.cat)}</span>
            <div class="prod-foot">
              <span class="price">${money(p.price)}</span>
              <button class="btn btn-primary btn-sm" type="button" data-add="${p.id}" aria-label="Add ${esc(p.name)} to cart">Add to cart</button>
            </div>
          </div>
        </article>`).join('')
      : `<div class="d-empty" style="grid-column:1/-1"><strong>No products found</strong>Try a different search or choose another category.</div>`;
  };
  const renderCart = () => {
    $q('count').textContent = cartCount();
    const cart = $q('cart');
    const ids = Object.keys(st.cart);
    const total = ids.reduce((sum, id) => sum + PRODUCTS.find((p) => p.id == id).price * st.cart[id], 0);
    cart.innerHTML = `
      <div class="cart-head"><h3>Your cart</h3><button class="mini-btn" type="button" data-act="toggle-cart" aria-label="Close cart">${icon('x')}</button></div>
      <div class="cart-items">${ids.length ? ids.map((id) => {
        const p = PRODUCTS.find((x) => x.id == id);
        return `<div class="cart-item">
          <span class="em" aria-hidden="true">${p.em}</span>
          <div><h4>${esc(p.name)}</h4>
            <div class="qty">
              <button class="mini-btn" type="button" data-dec="${id}" aria-label="Decrease quantity of ${esc(p.name)}">−</button>
              <span aria-live="polite">${st.cart[id]}</span>
              <button class="mini-btn" type="button" data-inc="${id}" aria-label="Increase quantity of ${esc(p.name)}">+</button>
            </div>
          </div>
          <div style="text-align:right"><b>${money(p.price * st.cart[id])}</b><br>
            <button class="mini-btn danger" type="button" data-rm="${id}" aria-label="Remove ${esc(p.name)}" style="margin-top:.3rem">${icon('trash')}</button></div>
        </div>`;
      }).join('') : `<div class="d-empty" style="margin-top:1rem"><strong>Your cart is empty</strong>Add a product from the list to see it here.</div>`}</div>
      <div class="cart-foot">
        <div class="cart-total"><span>Total</span><span>${money(total)}</span></div>
        <button class="btn btn-primary btn-sm" type="button" data-act="checkout" ${ids.length ? '' : 'disabled'}>Checkout (demo)</button>
        <p class="d-note" data-role="msg" role="status"></p>
      </div>`;
  };

  const toggleCart = (force) => {
    const cart = $q('cart');
    const show = force ?? cart.hidden;
    cart.hidden = !show;
    $('[data-act="toggle-cart"]', root).setAttribute('aria-expanded', String(show));
    if (show) renderCart();
  };

  root.addEventListener('input', (e) => {
    if (e.target.matches('[data-role="q"]')) { st.q = e.target.value; renderGrid(); }
  });
  root.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.cat) { st.cat = t.dataset.cat; renderChips(); renderGrid(); return; }
    if (t.dataset.add) { st.cart[t.dataset.add] = (st.cart[t.dataset.add] || 0) + 1; renderCart(); return; }
    if (t.dataset.inc) { st.cart[t.dataset.inc]++; renderCart(); return; }
    if (t.dataset.dec) { if (--st.cart[t.dataset.dec] <= 0) delete st.cart[t.dataset.dec]; renderCart(); return; }
    if (t.dataset.rm) { delete st.cart[t.dataset.rm]; renderCart(); return; }
    if (t.dataset.act === 'toggle-cart') { toggleCart(); return; }
    if (t.dataset.act === 'checkout') {
      const m = $('[data-role="msg"]', root);
      m.className = 'd-note ok';
      m.textContent = 'This is a frontend demo. No order was placed and no payment was taken.';
    }
  });

  renderChips(); renderGrid(); renderCart();
};

/* ===== Demo 2: Task Manager ===== */
DEMOS.tasks = (root) => {
  const KEY = 'amr-portfolio-tasks';
  const st = { tasks: storage.get(KEY, []), filter: 'all', q: '', editing: null };
  const save = () => storage.set(KEY, st.tasks);

  root.innerHTML = `
    <div class="d-tasks">
      <form class="task-add" data-role="form">
        <input type="text" placeholder="Add a new task" aria-label="New task" maxlength="140" data-role="new" autocomplete="off">
        <button class="btn btn-primary btn-sm" type="submit">${icon('plus')} Add task</button>
      </form>
      <div class="stats" data-role="stats"></div>
      <div class="d-toolbar">
        <label class="d-search">${icon('search')}<input type="search" placeholder="Search tasks" aria-label="Search tasks" data-role="q"></label>
      </div>
      <div class="d-chips" role="group" aria-label="Filter tasks" data-role="chips"></div>
      <div class="task-list" data-role="list"></div>
      <p class="d-note">Saved with localStorage in this browser only.</p>
    </div>`;
  const $q = (r) => $(`[data-role="${r}"]`, root);

  const render = () => {
    const done = st.tasks.filter((t) => t.done).length;
    $q('stats').innerHTML = `
      <div class="stat"><b>${st.tasks.length}</b><span>Total</span></div>
      <div class="stat"><b>${st.tasks.length - done}</b><span>Active</span></div>
      <div class="stat"><b>${done}</b><span>Completed</span></div>`;
    $q('chips').innerHTML = ['all', 'active', 'completed'].map((f) =>
      `<button class="chip" type="button" data-filter="${f}" aria-pressed="${st.filter === f}">${f[0].toUpperCase() + f.slice(1)}</button>`).join('');

    const q = st.q.trim().toLowerCase();
    const list = st.tasks.filter((t) =>
      (st.filter === 'all' || (st.filter === 'active' ? !t.done : t.done)) && (!q || t.text.toLowerCase().includes(q)));

    let empty = '';
    if (!st.tasks.length) empty = `<strong>No tasks yet</strong>Type a task above and press Add task to get started.`;
    else if (!list.length) empty = q ? `<strong>No matching tasks</strong>Try a different search term.` : `<strong>Nothing here</strong>${st.filter === 'completed' ? 'Complete a task and it will show up here.' : 'All tasks are completed. Nice work.'}`;

    $q('list').innerHTML = list.length ? list.map((t) => `
      <div class="task ${t.done ? 'done' : ''}">
        <input type="checkbox" ${t.done ? 'checked' : ''} data-toggle="${t.id}" aria-label="Mark “${esc(t.text)}” as ${t.done ? 'active' : 'completed'}">
        ${st.editing === t.id
          ? `<input class="task-edit" type="text" value="${esc(t.text)}" maxlength="140" data-editinput="${t.id}" aria-label="Edit task">`
          : `<span class="task-text">${esc(t.text)}</span>`}
        <div class="task-actions">
          ${st.editing === t.id
            ? `<button class="mini-btn" type="button" data-save="${t.id}" aria-label="Save task">${icon('check')}</button>
               <button class="mini-btn" type="button" data-cancel aria-label="Cancel editing">${icon('x')}</button>`
            : `<button class="mini-btn" type="button" data-edit="${t.id}" aria-label="Edit task">${icon('edit')}</button>
               <button class="mini-btn danger" type="button" data-del="${t.id}" aria-label="Delete task">${icon('trash')}</button>`}
        </div>
      </div>`).join('') : `<div class="d-empty">${empty}</div>`;

    const inp = $('[data-editinput]', root);
    if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  };

  const commitEdit = (id) => {
    const inp = $(`[data-editinput="${id}"]`, root);
    const text = inp ? inp.value.trim() : '';
    if (text) { const t = st.tasks.find((x) => x.id === id); if (t) t.text = text; save(); }
    st.editing = null; render();
  };

  $q('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $q('new');
    const text = input.value.trim();
    if (!text) return;
    st.tasks.unshift({ id: uid(), text, done: false });
    input.value = ''; save(); render(); input.focus();
  });
  root.addEventListener('input', (e) => { if (e.target.matches('[data-role="q"]')) { st.q = e.target.value; render(); $q('q').focus(); } });
  root.addEventListener('change', (e) => {
    if (e.target.dataset.toggle) {
      const t = st.tasks.find((x) => x.id === e.target.dataset.toggle);
      t.done = !t.done; save(); render();
    }
  });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.filter) { st.filter = b.dataset.filter; render(); }
    else if (b.dataset.del) { st.tasks = st.tasks.filter((x) => x.id !== b.dataset.del); save(); render(); }
    else if (b.dataset.edit) { st.editing = b.dataset.edit; render(); }
    else if (b.dataset.save) commitEdit(b.dataset.save);
    else if (b.hasAttribute('data-cancel')) { st.editing = null; render(); }
  });
  root.addEventListener('keydown', (e) => {
    if (!e.target.dataset.editinput) return;
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(e.target.dataset.editinput); }
    if (e.key === 'Escape') { e.stopPropagation(); st.editing = null; render(); }
  });
  render();
};

/* ===== Demo 3: Expense Tracker ===== */
DEMOS.expenses = (root) => {
  const KEY = 'amr-portfolio-expenses';
  const CATS = ['Food', 'Transport', 'Bills', 'Shopping', 'Learning', 'Other'];
  const st = { items: storage.get(KEY, []) };
  const save = () => storage.set(KEY, st.items);

  root.innerHTML = `
    <div class="d-exp">
      <form class="card d-form" data-role="form" style="padding:1.2rem">
        <h3 class="d-sub">Add a transaction</h3>
        <label>Description<input type="text" name="desc" maxlength="60" required autocomplete="off"></label>
        <label>Amount<input type="number" name="amount" min="0.01" step="0.01" required></label>
        <label>Type<select name="type"><option value="expense">Expense</option><option value="income">Income</option></select></label>
        <label>Category<select name="cat">${CATS.map((c) => `<option>${c}</option>`).join('')}</select></label>
        <button class="btn btn-primary btn-sm" type="submit">${icon('plus')} Add transaction</button>
        <p class="d-note" data-role="msg" role="status"></p>
      </form>
      <div>
        <div class="sum-row" data-role="sum"></div>
        <h3 class="d-sub">Spending by category</h3>
        <div class="bars" data-role="bars"></div>
        <h3 class="d-sub">Transactions</h3>
        <div data-role="list"></div>
        <p class="d-note">Saved with localStorage in this browser only.</p>
      </div>
    </div>`;
  const $q = (r) => $(`[data-role="${r}"]`, root);

  const render = () => {
    const inc = st.items.filter((i) => i.type === 'income').reduce((s, i) => s + i.amount, 0);
    const exp = st.items.filter((i) => i.type === 'expense').reduce((s, i) => s + i.amount, 0);
    $q('sum').innerHTML = `
      <div class="sum-box inc"><span>Income</span><b>${money(inc)}</b></div>
      <div class="sum-box exp"><span>Expenses</span><b>${money(exp)}</b></div>
      <div class="sum-box"><span>Balance</span><b>${money(inc - exp)}</b></div>`;

    const totals = CATS.map((c) => ({ c, v: st.items.filter((i) => i.type === 'expense' && i.cat === c).reduce((s, i) => s + i.amount, 0) })).filter((x) => x.v > 0);
    const max = Math.max(...totals.map((t) => t.v), 1);
    $q('bars').innerHTML = totals.length
      ? totals.sort((a, b) => b.v - a.v).map((t) => `<div class="bar-row"><span>${t.c}</span><div class="bar-track"><div class="bar-fill" style="width:${(t.v / max) * 100}%"></div></div><span>${money(t.v)}</span></div>`).join('')
      : `<div class="d-empty"><strong>No expenses yet</strong>Add an expense to see your spending breakdown.</div>`;

    $q('list').innerHTML = st.items.length
      ? st.items.map((i) => `
        <div class="tx">
          <div class="tx-main"><b>${esc(i.desc)}</b><span>${esc(i.cat)} · ${esc(i.date)}</span></div>
          <span class="tx-amt ${i.type === 'income' ? 'in' : 'out'}">${i.type === 'income' ? '+' : '−'}${money(i.amount)}</span>
          <button class="mini-btn danger" type="button" data-del="${i.id}" aria-label="Delete ${esc(i.desc)}">${icon('trash')}</button>
        </div>`).join('')
      : `<div class="d-empty"><strong>No transactions yet</strong>Use the form to add your first income or expense.</div>`;
  };

  $q('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const amount = parseFloat(f.amount.value);
    const desc = f.desc.value.trim();
    const msg = $q('msg');
    if (!desc || !(amount > 0)) { msg.className = 'd-note bad'; msg.textContent = 'Enter a description and an amount greater than 0.'; return; }
    st.items.unshift({ id: uid(), desc, amount, type: f.type.value, cat: f.cat.value, date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) });
    save(); render(); f.reset(); msg.className = 'd-note ok'; msg.textContent = 'Transaction added.'; f.desc.focus();
  });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-del]');
    if (b) { st.items = st.items.filter((i) => i.id !== b.dataset.del); save(); render(); }
  });
  render();
};

/* ===== Demo 4: Weather ===== */
DEMOS.weather = (root) => {
  const CODES = (c) => {
    if (c === 0) return ['☀️', 'Clear sky'];
    if (c <= 2) return ['⛅', 'Partly cloudy'];
    if (c === 3) return ['☁️', 'Overcast'];
    if (c === 45 || c === 48) return ['🌫️', 'Fog'];
    if (c >= 51 && c <= 57) return ['🌦️', 'Drizzle'];
    if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return ['🌧️', 'Rain'];
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return ['❄️', 'Snow'];
    if (c >= 95) return ['⛈️', 'Thunderstorm'];
    return ['🌡️', 'Unknown'];
  };

  /* Sample data used when the API cannot be reached */
  const sample = (city) => {
    const today = new Date();
    const days = [0, 1, 2, 3, 4].map((i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d.toISOString().slice(0, 10); });
    return {
      city, country: '', sample: true,
      now: { temp: 27, humidity: 48, wind: 14, code: 1 },
      daily: { time: days, code: [0, 1, 2, 1, 0], max: [30, 29, 28, 29, 31], min: [19, 18, 18, 19, 20] }
    };
  };

  async function fetchJson(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } finally { clearTimeout(timer); }
  }

  async function load(name) {
    const geo = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`);
    if (!geo.results || !geo.results.length) { const e = new Error('not-found'); e.code = 'not-found'; throw e; }
    const g = geo.results[0];
    const w = await fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${g.latitude}&longitude=${g.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`);
    return {
      city: g.name, country: g.country || '', sample: false,
      now: { temp: w.current.temperature_2m, humidity: w.current.relative_humidity_2m, wind: w.current.wind_speed_10m, code: w.current.weather_code },
      daily: { time: w.daily.time, code: w.daily.weather_code, max: w.daily.temperature_2m_max, min: w.daily.temperature_2m_min }
    };
  }

  root.innerHTML = `
    <div class="d-weather">
      <form class="d-cityform" data-role="form">
        <input type="text" name="city" placeholder="Search for a city, for example Cairo" aria-label="City name" value="Cairo" autocomplete="off">
        <button class="btn btn-primary btn-sm" type="submit">Search</button>
      </form>
      <div data-role="out" aria-live="polite"></div>
    </div>`;
  const out = $('[data-role="out"]', root);
  let alive = true;

  const show = (d, banner) => {
    const [em, label] = CODES(d.now.code);
    out.innerHTML = `
      ${banner ? `<div class="w-banner" role="status">${esc(banner)}</div>` : ''}
      <div class="w-now">
        <div class="w-emoji" aria-hidden="true">${em}</div>
        <div>
          <div class="w-temp">${Math.round(d.now.temp)}°C</div>
          <div><b>${esc(d.city)}${d.country ? ', ' + esc(d.country) : ''}</b> · ${label}</div>
          <div class="w-meta">Humidity ${Math.round(d.now.humidity)}% · Wind ${Math.round(d.now.wind)} km/h</div>
        </div>
      </div>
      <div class="w-days">${d.daily.time.map((t, i) => {
        const [e] = CODES(d.daily.code[i]);
        const day = i === 0 ? 'Today' : new Date(t + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
        return `<div class="w-day"><b>${day}</b><span class="em" aria-hidden="true">${e}</span><span>${Math.round(d.daily.max[i])}° / ${Math.round(d.daily.min[i])}°</span></div>`;
      }).join('')}</div>`;
  };

  const search = async (name) => {
    name = name.trim();
    if (!name) { out.innerHTML = `<div class="d-empty"><strong>Enter a city name</strong>Type a city above and press Search.</div>`; return; }
    out.innerHTML = `<div class="spinner" role="status" aria-label="Loading weather"></div>`;
    try {
      const d = await load(name);
      if (alive) show(d);
    } catch (err) {
      if (!alive) return;
      if (err.code === 'not-found') {
        out.innerHTML = `<div class="d-empty"><strong>City not found</strong>Check the spelling or try a nearby larger city.</div>`;
      } else {
        show(sample(name), 'Live weather could not be loaded, so this is sample data. Check your connection and search again.');
      }
    }
  };

  $('[data-role="form"]', root).addEventListener('submit', (e) => { e.preventDefault(); search(e.target.city.value); });
  search('Cairo');
  return () => { alive = false; };
};

/* ===== Demo 5: Quiz ===== */
DEMOS.quiz = (root) => {
  const Q = [
    { q: 'Which keyword declares a compile-time constant in C#?', o: ['readonly', 'const', 'static', 'final'], a: 1, e: '`const` values are fixed at compile time. `readonly` fields can be set at runtime, in a constructor.' },
    { q: 'What does LINQ stand for?', o: ['Linked Query', 'Language Integrated Query', 'Library for Indexed Queries', 'Logical Inline Query'], a: 1, e: 'LINQ is Language Integrated Query: a way to query collections and data sources directly from C#.' },
    { q: 'Which HTTP method is conventionally used to create a new resource in a REST API?', o: ['GET', 'DELETE', 'POST', 'HEAD'], a: 2, e: 'POST creates a resource. GET reads, PUT/PATCH update, and DELETE removes.' },
    { q: 'In Entity Framework Core, which class represents a session with the database?', o: ['DbContext', 'DbSession', 'SqlManager', 'EntityBase'], a: 0, e: 'DbContext manages the connection, tracks changes, and exposes DbSet properties for your entities.' },
    { q: 'Which SQL clause filters rows before they are returned?', o: ['ORDER BY', 'GROUP BY', 'WHERE', 'SELECT'], a: 2, e: 'WHERE filters rows. ORDER BY sorts and GROUP BY aggregates them.' },
    { q: 'In a modern ASP.NET Core project, which file typically configures services and the request pipeline?', o: ['Startup.xml', 'Program.cs', 'web.config only', 'appsettings.cs'], a: 1, e: 'Since .NET 6, Program.cs uses the minimal hosting model to register services and middleware.' },
    { q: 'What are async and await mainly used for in C#?', o: ['Making code run faster by default', 'Writing non-blocking asynchronous code', 'Declaring private methods', 'Handling exceptions only'], a: 1, e: 'async/await lets a method wait for work like I/O without blocking the calling thread.' },
    { q: 'Which CSS declaration turns an element into a flex container?', o: ['position: flex', 'flex: container', 'display: flex', 'layout: flexbox'], a: 2, e: '`display: flex` makes the element a flex container and its children flex items.' }
  ];
  const st = { i: 0, score: 0, answered: false };
  const fmt = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');

  const render = () => {
    if (st.i >= Q.length) {
      const pct = Math.round((st.score / Q.length) * 100);
      root.innerHTML = `
        <div class="d-quiz q-result">
          <p class="q-count">Quiz complete</p>
          <div class="q-score">${st.score}/${Q.length}</div>
          <p style="color:var(--muted);margin:.5rem 0 1.4rem">${pct >= 75 ? 'Strong result. Keep practicing.' : pct >= 40 ? 'Good progress. Review the explanations and try again.' : 'A good start. Every attempt builds familiarity.'}</p>
          <button class="btn btn-primary" type="button" data-restart>Try again</button>
        </div>`;
      return;
    }
    const cur = Q[st.i];
    root.innerHTML = `
      <div class="d-quiz">
        <div class="q-progress" aria-hidden="true"><i style="width:${(st.i / Q.length) * 100}%"></i></div>
        <p class="q-count">Question ${st.i + 1} of ${Q.length}</p>
        <h3 class="q-text">${fmt(cur.q)}</h3>
        <div class="q-opts" data-role="opts">${cur.o.map((o, idx) => `<button class="q-opt" type="button" data-idx="${idx}">${esc(o)}</button>`).join('')}</div>
        <div data-role="feedback" aria-live="polite"></div>
      </div>`;
    st.answered = false;
  };

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-restart]')) { st.i = 0; st.score = 0; render(); return; }
    if (e.target.closest('[data-next]')) { st.i++; render(); const f = $('.q-opt, [data-restart]', root); if (f) f.focus(); return; }
    const b = e.target.closest('.q-opt');
    if (!b || st.answered) return;
    st.answered = true;
    const cur = Q[st.i], pick = +b.dataset.idx;
    $$('.q-opt', root).forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === cur.a) btn.classList.add('correct');
      else if (idx === pick) btn.classList.add('wrong');
    });
    if (pick === cur.a) st.score++;
    $('[data-role="feedback"]', root).innerHTML = `
      <div class="q-explain"><b>${pick === cur.a ? 'Correct.' : 'Not quite.'}</b> ${fmt(cur.e)}</div>
      <button class="btn btn-primary btn-sm q-next" type="button" data-next>${st.i === Q.length - 1 ? 'See result' : 'Next question'}</button>`;
    $('[data-next]', root).focus();
  });
  render();
};

/* ===== Demo 6: Student Records (CRUD) ===== */
DEMOS.students = (root) => {
  const KEY = 'amr-portfolio-students';
  const COURSES = ['Computer Science', 'Software Engineering', 'Information Systems', 'Data Science'];
  const SEED = [
    { id: 's1', name: 'Sara Ahmed', email: 'sara@example.com', course: 'Software Engineering', year: 2 },
    { id: 's2', name: 'Omar Khaled', email: 'omar@example.com', course: 'Computer Science', year: 3 },
    { id: 's3', name: 'Mona Adel', email: 'mona@example.com', course: 'Information Systems', year: 1 }
  ];

  /* Data service layer. Today it uses localStorage.
     Later, replace each method with a fetch() call to an ASP.NET Core Web API,
     for example: GET /api/students, POST /api/students, PUT /api/students/{id}, DELETE /api/students/{id}. */
  const service = {
    list() { return storage.get(KEY, SEED); },
    saveAll(items) { storage.set(KEY, items); },
    create(item) { const all = this.list(); all.push({ ...item, id: uid() }); this.saveAll(all); },
    update(id, item) { this.saveAll(this.list().map((s) => (s.id === id ? { ...s, ...item } : s))); },
    remove(id) { this.saveAll(this.list().filter((s) => s.id !== id)); }
  };

  const st = { q: '', sortAsc: true, editing: null };

  root.innerHTML = `
    <div class="d-students">
      <form class="card d-form" data-role="form" style="padding:1.2rem">
        <h3 class="d-sub" data-role="formtitle">Add a student</h3>
        <label>Full name<input type="text" name="name" maxlength="60" required autocomplete="off"></label>
        <label>Email<input type="email" name="email" maxlength="80" required autocomplete="off"></label>
        <label>Course<select name="course">${COURSES.map((c) => `<option>${c}</option>`).join('')}</select></label>
        <label>Year<select name="year">${[1, 2, 3, 4].map((y) => `<option>${y}</option>`).join('')}</select></label>
        <button class="btn btn-primary btn-sm" type="submit" data-role="submit">${icon('plus')} Add student</button>
        <button class="btn btn-ghost btn-sm" type="button" data-cancel hidden>Cancel edit</button>
        <p class="d-note" data-role="msg" role="status"></p>
      </form>
      <div>
        <div class="d-toolbar">
          <label class="d-search">${icon('search')}<input type="search" placeholder="Search by name, email, or course" aria-label="Search students" data-role="q"></label>
        </div>
        <div data-role="table"></div>
        <p class="d-note">Sample records saved with localStorage in this browser only.</p>
      </div>
    </div>`;
  const $q = (r) => $(`[data-role="${r}"]`, root);
  const form = $q('form');

  const render = () => {
    const q = st.q.trim().toLowerCase();
    let items = service.list().filter((s) => !q || [s.name, s.email, s.course].some((v) => v.toLowerCase().includes(q)));
    items.sort((a, b) => a.name.localeCompare(b.name) * (st.sortAsc ? 1 : -1));
    $q('table').innerHTML = items.length ? `
      <div class="table-wrap"><table class="d-table">
        <caption class="sr-only" style="position:absolute;left:-9999px">Student records</caption>
        <thead><tr>
          <th scope="col" aria-sort="${st.sortAsc ? 'ascending' : 'descending'}"><button type="button" data-sort>Name ${st.sortAsc ? '▲' : '▼'}</button></th>
          <th scope="col">Course</th><th scope="col">Year</th><th scope="col"><span style="position:absolute;left:-9999px">Actions</span></th>
        </tr></thead>
        <tbody>${items.map((s) => `<tr>
          <td><b>${esc(s.name)}</b><small>${esc(s.email)}</small></td>
          <td>${esc(s.course)}</td><td>${esc(s.year)}</td>
          <td><button class="mini-btn" type="button" data-edit="${s.id}" aria-label="Edit ${esc(s.name)}">${icon('edit')}</button>
              <button class="mini-btn danger" type="button" data-del="${s.id}" aria-label="Delete ${esc(s.name)}">${icon('trash')}</button></td>
        </tr>`).join('')}</tbody></table></div>`
      : `<div class="d-empty"><strong>${q ? 'No matching students' : 'No student records'}</strong>${q ? 'Try a different search term.' : 'Use the form to add the first record.'}</div>`;
  };

  const resetForm = () => {
    st.editing = null; form.reset();
    $q('formtitle').textContent = 'Add a student';
    $q('submit').innerHTML = `${icon('plus')} Add student`;
    $('[data-cancel]', root).hidden = true;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = $q('msg');
    const data = { name: form.name.value.trim(), email: form.email.value.trim(), course: form.course.value, year: Number(form.year.value) };
    if (!data.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { msg.className = 'd-note bad'; msg.textContent = 'Enter a name and a valid email address.'; return; }
    if (st.editing) { service.update(st.editing, data); msg.textContent = 'Student updated.'; }
    else { service.create(data); msg.textContent = 'Student added.'; }
    msg.className = 'd-note ok';
    resetForm(); render();
  });
  root.addEventListener('input', (e) => { if (e.target.matches('[data-role="q"]')) { st.q = e.target.value; render(); $q('q').focus(); } });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-sort')) { st.sortAsc = !st.sortAsc; render(); $('[data-sort]', root).focus(); }
    else if (b.dataset.del) { service.remove(b.dataset.del); if (st.editing === b.dataset.del) resetForm(); render(); }
    else if (b.dataset.edit) {
      const s = service.list().find((x) => x.id === b.dataset.edit); if (!s) return;
      st.editing = s.id;
      form.name.value = s.name; form.email.value = s.email; form.course.value = s.course; form.year.value = s.year;
      $q('formtitle').textContent = 'Edit student';
      $q('submit').innerHTML = `${icon('check')} Save changes`;
      $('[data-cancel]', root).hidden = false;
      form.name.focus();
    }
    else if (b.hasAttribute('data-cancel')) resetForm();
  });
  render();
};
