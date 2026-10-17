FS.page(async () => {
  const { esc } = FS;
  const data = await FS.loadJson('merchants');
  const sched = data.schedule;

  MerchantClock.mount(document.getElementById('merchant-clock'), sched);
  document.getElementById('schedule-source').innerHTML = `${FS.status(sched.status)} <span class="src">[${FS.sourceLinks(sched.sources)}]</span>`;

  // Today's windows in UTC and in the viewer's own time zone.
  const today = new Date();
  const base = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const st = MerchantClock.state(sched);
  document.getElementById('windows').innerHTML = sched.spawn_hours_utc.map((h) => {
    const start = new Date(base + h * 3600000);
    const end = new Date(start.getTime() + sched.duration_minutes * 60000);
    const live = st.live && st.start.getUTCHours() === h;
    const pad = (n) => String(n).padStart(2, '0');
    return `<tr${live ? ' class="highlight"' : ''}>
      <td>${pad(h)}:00 - ${pad(end.getUTCHours())}:00 UTC</td>
      <td>${MerchantClock.localTime(start)} - ${MerchantClock.localTime(end)}</td>
      <td>${live ? '<strong>Now</strong>' : ''}</td></tr>`;
  }).join('');

  document.getElementById('tiers').innerHTML = data.tiers.map((t) => `
    <tr><td>${t.tier}</td><td>${esc(t.stages)}</td><td>${esc(t.item)}</td>
    <td>${t.price_gems == null ? '<span class="muted">varies</span>' : t.price_gems.toLocaleString()}</td></tr>`).join('');

  document.getElementById('facts').innerHTML = FS.factList(data.facts);

  // Gem planner: which slimes a gem balance covers, cheapest first.
  const gemsEl = document.getElementById('gems');
  gemsEl.value = FS.store.get('gems', '');
  const priced = data.tiers.filter((t) => t.price_gems != null);
  function plan() {
    const gems = Number(gemsEl.value) || 0;
    FS.store.set('gems', gemsEl.value);
    document.getElementById('gem-plan').innerHTML = priced.map((t) => {
      const n = Math.floor(gems / t.price_gems);
      return `<tr><td>${esc(t.item)}</td><td>${t.price_gems.toLocaleString()}</td><td>${n}</td>
        <td>${n ? '' : `${(t.price_gems - gems).toLocaleString()} short`}</td></tr>`;
    }).join('');
  }
  gemsEl.addEventListener('input', plan);
  plan();
});
