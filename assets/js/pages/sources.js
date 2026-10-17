FS.page(async () => {
  const { esc } = FS;
  const data = await FS.loadJson('sources');

  document.getElementById('checked').textContent = `Last checked ${data.checked_on}, against game version ${data.game_version}.`;
  document.getElementById('statuses').innerHTML = Object.entries(data.statuses)
    .map(([k, v]) => `<li>${FS.status(k)}<span>${esc(v)}</span></li>`).join('');
  document.getElementById('source-list').innerHTML = data.sources.map((s) => `
    <tr><td><code>${esc(s.id)}</code></td><td><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></td><td>${esc(s.date)}</td></tr>`).join('');
  document.getElementById('unreachable').innerHTML = data.not_reachable
    .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join('');
});
