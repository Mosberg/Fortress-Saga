FS.page(async () => {
  const { esc } = FS;
  const data = await FS.loadJson('constellations');
  const DEFAULT_MAX = 10;

  document.getElementById('mechanics').innerHTML = FS.factList(data.mechanics);

  const nebulae = data.classes.flatMap((cls) => cls.nebulae.map((n) => ({ ...n, cls })));
  const saved = FS.store.get('constellations', {});
  const state = {
    budget: saved.budget ?? 0,
    levels: saved.levels ?? {},
    costs: saved.costs ?? {}, // per-level costs the player typed in for nebulae without a known schedule
  };
  const save = () => FS.store.set('constellations', state);

  // Stardust for levels 1..n: the known schedule, else the player's own cost per level.
  function cost(n, levels) {
    if (n.cost_schedule) return { value: n.cost_schedule.slice(0, levels).reduce((a, b) => a + b, 0), known: true };
    const per = Number(state.costs[n.id]);
    if (levels === 0) return { value: 0, known: true };
    return per > 0 ? { value: per * levels, known: true } : { value: 0, known: false };
  }

  const container = document.getElementById('planner');
  container.innerHTML = data.classes.map((cls) => `
    <div class="card" data-class="${esc(cls.id)}">
      <h2>${esc(cls.name)} <span class="muted" data-unlock></span></h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Nebula</th><th>Effect</th><th>Level</th><th>Stardust</th></tr></thead>
        <tbody>${cls.nebulae.map((n) => `
          <tr data-nebula="${esc(n.id)}">
            <td>${esc(n.name)} ${FS.status(n.status)}${n.note ? `<div class="muted">${esc(n.note)}</div>` : ''}</td>
            <td>${esc(n.effect)}${n.per_level ? `<div class="muted">${esc(n.per_level)} per level</div>` : ''}</td>
            <td><input type="number" min="0" max="${n.max_level ?? DEFAULT_MAX}" value="${state.levels[n.id] ?? 0}" data-level style="width:4.5rem">
              <div class="muted">max ${n.max_level ?? `${DEFAULT_MAX}?`}</div></td>
            <td data-cost>${n.cost_schedule ? '' : `<input type="number" min="0" placeholder="cost/lvl" value="${state.costs[n.id] ?? ''}" data-custom style="width:5.5rem" title="Cost per level is unknown; type the in-game cost">`}<div data-cost-out></div></td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>`).join('');

  const budgetEl = document.getElementById('budget');
  budgetEl.value = state.budget;

  function update() {
    state.budget = Number(budgetEl.value) || 0;
    let totalLevels = 0;
    let spent = 0;
    let unknown = 0;
    for (const n of nebulae) {
      const row = container.querySelector(`[data-nebula="${n.id}"]`);
      const max = n.max_level ?? DEFAULT_MAX;
      const input = row.querySelector('[data-level]');
      const lvl = Math.min(max, Math.max(0, Math.floor(Number(input.value) || 0)));
      state.levels[n.id] = lvl;
      const custom = row.querySelector('[data-custom]');
      if (custom) state.costs[n.id] = custom.value;
      totalLevels += lvl;
      const c = cost(n, lvl);
      if (c.known) spent += c.value; else unknown += 1;
      row.querySelector('[data-cost-out]').innerHTML = c.known ? `${c.value}` : '<span class="muted">cost unknown</span>';
    }
    for (const cls of data.classes) {
      const el = container.querySelector(`[data-class="${cls.id}"] [data-unlock]`);
      const open = totalLevels >= cls.unlock_levels;
      el.textContent = open ? `· open (needs ${cls.unlock_levels} levels)` : `· locked: ${cls.unlock_levels - totalLevels} more levels needed`;
    }
    const remaining = state.budget - spent;
    document.getElementById('summary').innerHTML = `
      <div class="metric"><div class="label">Nebula levels invested</div><div class="value">${totalLevels}</div></div>
      <div class="metric accent"><div class="label">Stardust spent (known costs)</div><div class="value">${spent}</div></div>
      <div class="metric ${remaining < 0 ? '' : 'ok'}" ${remaining < 0 ? 'style="border-left-color:var(--danger)"' : ''}>
        <div class="label">Stardust left</div><div class="value">${remaining}</div></div>
      ${unknown ? `<p class="muted">${unknown} nebula(e) have levels but no known cost. Type the in-game cost per level to include them.</p>` : ''}`;
    save();
  }

  container.addEventListener('input', update);
  budgetEl.addEventListener('input', update);
  document.getElementById('reset').addEventListener('click', () => {
    container.querySelectorAll('[data-level]').forEach((i) => { i.value = 0; });
    update();
  });
  update();

  const other = data.other_nebulae;
  document.getElementById('other-nebulae').innerHTML = `
    <p class="muted">${esc(other.note)} [${FS.sourceLinks(other.sources)}]</p>
    <div class="table-wrap"><table><thead><tr><th>Nebula</th><th>Effect</th></tr></thead><tbody>
      ${other.items.map((i) => `<tr><td>${esc(i.name)}</td><td>${i.effect ? esc(i.effect) : '<span class="muted">not stated</span>'}</td></tr>`).join('')}
    </tbody></table></div>`;
});
