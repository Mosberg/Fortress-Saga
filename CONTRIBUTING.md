# Contributing

All game data lives in `data/*.json`; the pages only display it. To fix a value, edit the JSON and open a pull request.

## Status marks

Every value carries a `status` and a `sources` list:

- `confirmed`: a public source states it. List at least one source id.
- `corrected`: the original drafts had it wrong and the value now follows a source. List the source, and say what changed in `note`.
- `unconfirmed`: nobody has found a source yet. `sources` may be empty.

Source ids are defined in `data/sources.json`. Add a new source there (id, name, url, date) before using it. An in-game screenshot linked from an issue counts as a source.

A typical fact looks like this:

```json
{ "text": "Merchants stay for 2 hours.", "status": "confirmed", "sources": ["gt"] }
```

## Before opening a pull request

Run the checker, which validates every file against its schema in `schemas/` when `jsonschema` is installed:

```
python3 tools/validate.py
```

Then serve the site (`python3 -m http.server`) and look at the page you changed.

## Adding a page

1. Copy an existing page such as `updates.html` and change its title, description and content containers.
2. Add a script in `assets/js/pages/` that calls `FS.page(async () => { ... })`.
3. Add the page to the `NAV` list in `assets/js/core.js`.
