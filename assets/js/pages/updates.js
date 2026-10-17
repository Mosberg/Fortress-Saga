FS.page(async () => {
  const { esc } = FS;
  const data = await FS.loadJson('updates');
  document.getElementById('updates-note').textContent = data.note;
  document.getElementById('versions').innerHTML = data.versions.map((v) => `
    <article class="card">
      <h2>Version ${esc(v.version)} <span class="muted">${v.date ? esc(v.date) : 'date not recorded'}</span></h2>
      <ul style="margin-left:1.2rem">${v.changes.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
      <p class="src muted" style="margin-top:0.5rem">[${FS.sourceLinks(v.sources)}]</p>
    </article>`).join('');
});
