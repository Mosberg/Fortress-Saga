FS.page(async () => {
  const { esc } = FS;
  const data = await FS.loadJson('formulas');
  const dmg = data.damage;
  const CRIT_CAP = 50;

  document.getElementById('formula').innerHTML = `
    <p>${FS.status(dmg.status)} <span class="src">[${FS.sourceLinks(dmg.sources)}]</span></p>
    <p><code>${esc(dmg.formula)}</code></p>
    <ul class="facts" style="margin-top:0.5rem">${dmg.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`;
  document.getElementById('caps').innerHTML = FS.factList(data.caps);
  document.getElementById('draft-only').innerHTML = `
    <p>${FS.status(data.draft_only.status)} <span class="muted">${esc(data.draft_only.note)}</span></p>
    <ul class="facts" style="margin-top:0.5rem">${data.draft_only.items.map((i) => `<li class="unconfirmed-text">${esc(i)}</li>`).join('')}</ul>`;

  const ids = ['flatAtk', 'pctAtk', 'multipliers', 'gildong', 'iris', 'skill', 'critDmg', 'critChance', 'bossDmg', 'ruingaladh'];
  const el = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
  const saved = FS.store.get('damage', null);
  if (saved) ids.forEach((id) => { if (id in saved) el[id].type === 'checkbox' ? (el[id].checked = saved[id]) : (el[id].value = saved[id]); });

  const num = (v) => Number(v) || 0;
  function read() {
    return {
      flatAtk: num(el.flatAtk.value),
      pctAtk: num(el.pctAtk.value),
      multipliers: el.multipliers.value.split(/[,\s]+/).map(Number).filter((x) => x > 0),
      gildong: num(el.gildong.value),
      iris: num(el.iris.value),
      skill: num(el.skill.value),
      critDmg: num(el.critDmg.value),
      critChance: Math.min(CRIT_CAP, Math.max(0, num(el.critChance.value))),
      bossDmg: num(el.bossDmg.value),
      ruingaladh: el.ruingaladh.checked,
    };
  }

  // Applies the community formula; "average" weights crit and non-crit hits by crit chance.
  function compute(i) {
    const atk = i.flatAtk * (1 + i.pctAtk / 100) * i.multipliers.reduce((a, b) => a * b, 1);
    const mark = i.ruingaladh ? 2 : 1;
    const normal = (atk * (1 + i.gildong / 100) + i.iris) * (i.skill / 100) * (1 + i.bossDmg / 100) * mark;
    const crit = normal * (i.critDmg / 100);
    const c = i.critChance / 100;
    return { atk, normal, crit, average: normal * (1 - c) + crit * c };
  }

  const fmt = (n) => Math.round(n).toLocaleString();
  function update() {
    const input = read();
    const r = compute(input);
    FS.store.set('damage', Object.fromEntries(ids.map((id) => [id, el[id].type === 'checkbox' ? el[id].checked : el[id].value])));
    const capped = num(el.critChance.value) > CRIT_CAP ? `<p class="muted">Crit chance capped at ${CRIT_CAP}%.</p>` : '';
    document.getElementById('results').innerHTML = `
      <div class="metric"><div class="label">Base power (ATK)</div><div class="value">${fmt(r.atk)}</div></div>
      <div class="metric accent"><div class="label">Skill hit, no crit</div><div class="value">${fmt(r.normal)}</div></div>
      <div class="metric accent"><div class="label">Skill hit, crit</div><div class="value">${fmt(r.crit)}</div></div>
      <div class="metric ok"><div class="label">Average hit at ${input.critChance}% crit chance</div><div class="value">${fmt(r.average)}</div></div>
      ${capped}`;

    // What +10 points in each stat would add to the average hit.
    const step = 10;
    const options = [
      ['ATK %', { pctAtk: input.pctAtk + step }],
      ['Boss DMG %', { bossDmg: input.bossDmg + step }],
      ['Crit DMG %', { critDmg: input.critDmg + step }],
      ['Gildong buff %', { gildong: input.gildong + step }],
      ['Skill modifier %', { skill: input.skill + step }],
    ];
    document.getElementById('compare').innerHTML = options.map(([label, change]) => {
      const gain = r.average > 0 ? (compute({ ...input, ...change }).average / r.average - 1) * 100 : 0;
      return `<tr><td>+${step} ${esc(label)}</td><td>${gain.toFixed(2)}%</td></tr>`;
    }).join('');
  }
  ids.forEach((id) => el[id].addEventListener('input', update));
  update();
});
