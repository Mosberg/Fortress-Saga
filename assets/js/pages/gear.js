FS.page(async () => {
  const { esc } = FS;
  const data = await FS.loadJson('gear');

  document.getElementById('gear-facts').innerHTML = FS.factList(data.facts);

  const rl = data.rune_lines;
  document.getElementById('rune-lines').innerHTML = `
    <p>${FS.status(rl.status)} <span class="src">[${FS.sourceLinks(rl.sources)}]</span></p>
    <div class="table-wrap"><table><thead><tr><th>Tier</th><th>White lines</th><th>Red lines</th></tr></thead><tbody>
      ${rl.tiers.map((t) => `<tr><td>${FS.rarityBadge(t.tier)}</td><td>${t.white}</td><td>${t.red}</td></tr>`).join('')}
    </tbody></table></div>`;

  const rr = data.legend_red_rolls;
  document.getElementById('red-rolls').innerHTML = `
    <p>${FS.status(rr.status)} ${esc(rr.applies_to)}. <span class="muted">${esc(rr.note)}</span> <span class="src">[${FS.sourceLinks(rr.sources)}]</span></p>
    <div class="table-wrap"><table><thead><tr><th>Red stat</th><th>Min</th><th>Max</th></tr></thead><tbody>
      ${rr.rolls.map((r) => `<tr><td>${esc(r.stat)}</td><td>${r.min}%</td><td>${r.max}%</td></tr>`).join('')}
    </tbody></table></div>`;

  // Roll checker: where a rolled value sits inside the Legend range.
  const statEl = document.getElementById('roll-stat');
  const valueEl = document.getElementById('roll-value');
  statEl.innerHTML = rr.rolls.map((r, i) => `<option value="${i}">${esc(r.stat)}</option>`).join('');
  function check() {
    const r = rr.rolls[statEl.value];
    const v = Number(valueEl.value);
    const out = document.getElementById('roll-result');
    if (!valueEl.value) { out.innerHTML = `<p class="muted">Range ${r.min}-${r.max}%.</p>`; return; }
    const pct = ((v - r.min) / (r.max - r.min)) * 100;
    const clamped = Math.min(100, Math.max(0, pct));
    const verdict = v < r.min || v > r.max ? 'Outside the known Legend range; check the stat and tier.'
      : pct >= 80 ? 'Top roll. Keep it.' : pct >= 50 ? 'Above average.' : pct >= 25 ? 'Below average; reroll if it is cheap.' : 'Low roll; reroll.';
    out.innerHTML = `
      <div class="metric"><div class="label">Position in range (${r.min}-${r.max}%)</div><div class="value">${Math.round(pct)}%</div>
      <div class="meter"><span style="width:${clamped}%"></span></div></div>
      <p>${esc(verdict)}</p>`;
  }
  statEl.addEventListener('input', check);
  valueEl.addEventListener('input', check);
  check();

  const sp = data.stat_priority;
  document.getElementById('stat-priority').innerHTML = `
    <p>${FS.status(sp.status)} <span class="src">[${FS.sourceLinks(sp.sources)}]</span></p>
    <p><strong>Bossing:</strong> ${sp.bossing.map(esc).join(' &gt; ')}</p>
    <p><strong>Farming:</strong> ${sp.farming.map(esc).join(' &gt; ')}</p>
    <p><strong>Potentials:</strong> ${esc(sp.potentials)}</p>`;

  const dr = data.draft_runes;
  document.getElementById('draft-runes').innerHTML = `
    <p>${FS.status(dr.status)} <span class="muted">${esc(dr.note)}</span></p>
    <p class="unconfirmed-text">${dr.items.map(esc).join(', ')}</p>`;
});
