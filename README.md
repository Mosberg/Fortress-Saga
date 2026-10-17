# Fortress-Saga
Create a complete repository for a Fortress Saga GitHub.io page for me with all information, wikis, updates, guides, calculators, planners, spreadsheets, wandering merchants, tools, helps, tips, descriptions and everything else that can be useful for a Fortress Saga Player https://share.gemini.google/7eL8PCnZpGYQ

## Site

A static fan hub for Fortress Saga: AFK RPG, served by GitHub Pages from the repo root. Plain HTML, CSS and JavaScript with JSON data; there is no build step.

| Page | What it has |
| --- | --- |
| `index.html` | Home: live merchant timer, latest update, quick tips, links to every tool |
| `heroes.html` | Hero wiki with search, filters and CSV export |
| `constellations.html` | Nebula reference and a Stardust / class unlock planner |
| `merchants.html` | Merchant countdown, daily windows in your time zone, slime prices, gem planner |
| `gear.html` | Gear and rune rules, Legend roll ranges, roll checker |
| `fortress.html` | Cannons, kits, facilities, engines, Machina Engineering |
| `calculators.html` | Damage calculator (community formula) and upgrade comparison |
| `guides.html` | Progression by stage, tips, unlocks, dungeons |
| `updates.html` | Version history |
| `sources.html` | Where the data comes from |

## Layout

```
├── *.html                 one file per page, plus 404.html
├── assets/
│   ├── css/main.css       shared styles
│   ├── img/favicon.svg
│   └── js/
│       ├── core.js        header, footer, data loading, status marks, CSV, storage
│       ├── merchant-clock.js
│       └── pages/         one script per page
├── data/                  all game data as JSON (see CONTRIBUTING.md)
├── schemas/               a JSON Schema for each data file
├── tools/validate.py      checks the data files
└── drafts/                the original AI chat answers the site started from
```

## Data accuracy

Every value in `data/` is marked `confirmed`, `corrected` or `unconfirmed` and names its sources (listed in `data/sources.json`). The drafts in `drafts/` contained many invented numbers; the site only shows them marked as unconfirmed, or leaves them out.

## Run locally

The pages load their data with `fetch`, so serve the folder over HTTP rather than opening the files directly:

```
python3 -m http.server
```

Then open http://localhost:8000. Check the data with `python3 tools/validate.py`.

## Publishing

After merging to `main`, enable Pages in Settings → Pages (branch `main`, folder `/`). The site will be at https://mosberg.github.io/Fortress-Saga/.
