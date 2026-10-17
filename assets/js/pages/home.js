FS.page(async () => {
  const { esc } = FS;
  const [merchants, updates, sources, progression] = await Promise.all(
    ['merchants', 'updates', 'sources', 'progression'].map(FS.loadJson));

  MerchantClock.mount(document.getElementById('merchant-clock'), merchants.schedule);

  const latest = updates.versions[0];
  document.getElementById('latest-update').innerHTML = `
    <h3>Version ${esc(latest.version)}${latest.date ? ` <span class="muted">${esc(latest.date)}</span>` : ''}</h3>
    <ul class="facts">${latest.changes.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    <p class="muted" style="margin-top:0.5rem"><a href="updates.html">All updates</a></p>`;

  const tips = progression.tips.slice(0, 4);
  document.getElementById('quick-tips').innerHTML = FS.factList(tips.map((t) => ({ ...t, text: `${t.topic}: ${t.text}` })));

  document.getElementById('data-status').innerHTML = `
    <p>Game data was last checked against public guides on <strong>${esc(sources.checked_on)}</strong> (game version ${esc(sources.game_version)}). Every value carries a mark:</p>
    <ul class="facts" style="margin-top:0.5rem">
      ${Object.entries(sources.statuses).map(([k, v]) => `<li>${FS.status(k)}<span>${esc(v)}</span></li>`).join('')}
    </ul>`;
});
