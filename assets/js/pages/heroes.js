FS.page(async () => {
  const { esc } = FS;
  const data = await FS.loadJson('heroes');
  const heroes = data.heroes;

  document.getElementById('hero-notes').innerHTML = data.notes.map((n) => `<p>${esc(n)}</p>`).join('');

  const fill = (id, values) => {
    const el = document.getElementById(id);
    el.insertAdjacentHTML('beforeend', [...new Set(values.filter(Boolean))].sort()
      .map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join(''));
  };
  fill('filter-rarity', heroes.map((h) => h.rarity));
  fill('filter-position', heroes.map((h) => h.position));

  const grid = document.getElementById('hero-grid');
  const controls = ['hero-search', 'filter-rarity', 'filter-position', 'filter-status'].map((id) => document.getElementById(id));

  function matches(h) {
    const [q, rarity, position, statusFilter] = controls.map((c) => c.value.toLowerCase());
    const haystack = [h.name, h.role, h.position, h.skill, ...h.facts.map((f) => f.text)].join(' ').toLowerCase();
    return (!q || haystack.includes(q))
      && (!rarity || (h.rarity || '').toLowerCase() === rarity)
      && (!position || (h.position || '').toLowerCase() === position)
      && (!statusFilter || h.facts.some((f) => f.status === statusFilter));
  }

  function render() {
    const list = heroes.filter(matches);
    grid.innerHTML = list.length ? list.map((h) => `
      <article class="card" id="${esc(h.id)}">
        <div style="display:flex;justify-content:space-between;gap:0.5rem;align-items:start">
          <h3>${esc(h.name)}</h3>${FS.rarityBadge(h.rarity)}
        </div>
        <p class="muted" style="margin-bottom:0.5rem">${esc(h.position || 'Position unknown')} · ${esc(h.role || 'Role unknown')}${h.skill ? ` · Skill: ${esc(h.skill)}` : ''}</p>
        ${FS.factList(h.facts)}
      </article>`).join('') : '<p class="muted">No heroes match.</p>';
    document.getElementById('hero-count').textContent = `${list.length} of ${heroes.length} heroes`;
  }
  controls.forEach((c) => c.addEventListener('input', render));
  render();

  document.getElementById('listed-only').textContent = data.listed_only.join(', ');

  document.getElementById('hero-csv').addEventListener('click', () => {
    FS.downloadCsv('fortress-saga-heroes.csv', [
      ['Name', 'Rarity', 'Position', 'Role', 'Skill', 'Facts'],
      ...heroes.map((h) => [h.name, h.rarity, h.position, h.role, h.skill,
        h.facts.map((f) => `[${f.status}] ${f.text}`).join(' | ')]),
    ]);
  });
});
