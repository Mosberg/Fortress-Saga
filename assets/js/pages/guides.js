FS.page(async () => {
  const { esc } = FS;
  const data = await FS.loadJson('progression');

  document.getElementById('phases').innerHTML = data.phases.map((p) => `
    <div class="card">
      <h2>${esc(p.name)} <span class="muted">stages ${esc(p.stages)}</span></h2>
      ${FS.factList(p.steps)}
    </div>`).join('');

  document.getElementById('tips').innerHTML = data.tips.map((t) => `
    <div class="card"><h3>${esc(t.topic)}</h3>${FS.factList([{ ...t }])}</div>`).join('');

  document.getElementById('unlocks').innerHTML = data.unlocks.map((u) => `
    <tr><td>${esc(u.stage)}</td><td>${esc(u.feature)}</td><td>${FS.status(u.status)} <span class="src muted">[${FS.sourceLinks(u.sources)}]</span></td></tr>`).join('');

  const d = data.dungeons;
  document.getElementById('dungeons').innerHTML = `
    <p>${FS.status(d.status)} <span class="src">[${FS.sourceLinks(d.sources)}]</span></p>
    <ul style="margin:0.5rem 0 0 1.2rem">${d.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
});
