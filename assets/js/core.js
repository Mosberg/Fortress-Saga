// Shared helpers for every page: layout, data loading, status marks, sources.
(function () {
  const NAV = [
    ['index.html', 'Home'],
    ['heroes.html', 'Heroes'],
    ['constellations.html', 'Constellations'],
    ['merchants.html', 'Merchants'],
    ['gear.html', 'Gear & Runes'],
    ['fortress.html', 'Fortress'],
    ['calculators.html', 'Calculators'],
    ['guides.html', 'Guides & Tips'],
    ['updates.html', 'Updates'],
    ['sources.html', 'Sources'],
  ];

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function renderLayout() {
    const current = location.pathname.split('/').pop() || 'index.html';
    const header = document.getElementById('site-header');
    if (header) {
      header.className = 'site-header';
      header.innerHTML = `
        <div class="bar">
          <a class="brand" href="index.html">⚙️ Fortress Saga Hub</a>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
        </div>
        <nav class="site-nav" id="site-nav">
          ${NAV.map(([href, label]) => `<a href="${href}"${href === current ? ' class="active" aria-current="page"' : ''}>${label}</a>`).join('')}
        </nav>`;
      const toggle = header.querySelector('.menu-toggle');
      const nav = header.querySelector('.site-nav');
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }
    const footer = document.getElementById('site-footer');
    if (footer) {
      footer.className = 'site-footer';
      footer.innerHTML = `
        <p>Unofficial fan site for Fortress Saga: AFK RPG by CookApps. Not affiliated with the developer.</p>
        <p>Maintained by <a href="https://github.com/Mosberg">@Mosberg</a> · <a href="https://github.com/Mosberg/Fortress-Saga">Source and corrections on GitHub</a></p>`;
    }
  }

  const cache = {};
  function loadJson(name) {
    if (!cache[name]) {
      cache[name] = fetch(`data/${name}.json`).then((res) => {
        if (!res.ok) throw new Error(`data/${name}.json: HTTP ${res.status}`);
        return res.json();
      });
    }
    return cache[name];
  }

  let sourceIndex = {};
  async function loadSources() {
    const data = await loadJson('sources');
    sourceIndex = Object.fromEntries(data.sources.map((s) => [s.id, s]));
    return data;
  }

  function sourceLinks(ids) {
    if (!ids || !ids.length) return '';
    return ids.map((id) => {
      const s = sourceIndex[id];
      return s ? `<a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.name)} (${esc(s.date)})">${esc(id)}</a>` : esc(id);
    }).join(', ');
  }

  const STATUS_LABEL = { confirmed: 'Confirmed', corrected: 'Corrected', unconfirmed: 'Unconfirmed' };
  function status(value) {
    return `<span class="status ${esc(value)}" title="${esc(value)}">${STATUS_LABEL[value] || esc(value)}</span>`;
  }

  // A fact is { text, status, sources, note? }.
  function factItem(f) {
    const src = sourceLinks(f.sources);
    const text = f.status === 'unconfirmed' ? `<span class="unconfirmed-text">${esc(f.text)}</span>` : esc(f.text);
    return `<li>${status(f.status)}<span>${text}${f.note ? ` <span class="muted">${esc(f.note)}</span>` : ''}${src ? ` <span class="src">[${src}]</span>` : ''}</span></li>`;
  }
  const factList = (facts) => `<ul class="facts">${facts.map(factItem).join('')}</ul>`;

  function rarityBadge(rarity) {
    return rarity ? `<span class="badge ${esc(rarity.toLowerCase())}">${esc(rarity)}</span>` : '<span class="badge unknown">?</span>';
  }

  function downloadCsv(filename, rows) {
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = rows.map((r) => r.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // localStorage can be unavailable (private mode, blocked storage); the pages work without it.
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(`fs:${key}`); return v === null ? fallback : JSON.parse(v); } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(`fs:${key}`, JSON.stringify(value)); } catch { /* ignore */ }
    },
  };

  function showError(err) {
    console.error(err);
    const main = document.querySelector('main');
    const hint = location.protocol === 'file:'
      ? ' You opened this file directly; serve the folder over HTTP instead, for example <code>python3 -m http.server</code>.'
      : '';
    main.insertAdjacentHTML('afterbegin', `<div class="notice error">Could not load game data (${esc(err.message)}).${hint}</div>`);
  }

  // Runs a page's render function once the layout and sources are ready.
  async function page(render) {
    renderLayout();
    try {
      await loadSources();
      await render();
    } catch (err) {
      showError(err);
    }
  }

  window.FS = { esc, loadJson, sourceLinks, status, factList, rarityBadge, downloadCsv, store, page };
})();
