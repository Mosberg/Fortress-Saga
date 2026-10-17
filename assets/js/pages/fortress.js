FS.page(async () => {
  const { esc } = FS;
  const data = await FS.loadJson('fortress');

  const table = (rows) => `
    <div class="table-wrap"><table><thead><tr><th>Name</th><th>What it does</th><th>Status</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td><strong>${esc(r.name)}</strong></td>
        <td>${esc(r.role)}${r.note ? `<div class="muted">${esc(r.note)}</div>` : ''}</td>
        <td>${FS.status(r.status)}${r.sources.length ? `<div class="src muted">[${FS.sourceLinks(r.sources)}]</div>` : ''}</td></tr>`).join('')}
    </tbody></table></div>`;

  document.getElementById('cannons').innerHTML = table(data.cannons);
  document.getElementById('kits').innerHTML = table(data.kits);
  document.getElementById('facilities').innerHTML = table(data.facilities) + `<div style="margin-top:0.75rem">${FS.factList(data.facility_notes)}</div>`;
  document.getElementById('engines').innerHTML = FS.factList(data.engines);
  document.getElementById('machina').innerHTML = FS.factList(data.machina);
});
