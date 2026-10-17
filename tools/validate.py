#!/usr/bin/env python3
"""Check the site's data files.

Usage: python3 tools/validate.py

Always checks, with no dependencies:
  - every data/*.json file parses and has a matching schemas/<name>.schema.json
  - every "status" is confirmed, corrected or unconfirmed
  - every source id used exists in data/sources.json
  - confirmed and corrected values name at least one source
  - ids are unique within each list

If the `jsonschema` package is installed, each file is also validated
against its JSON Schema.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SCHEMAS = ROOT / "schemas"
STATUSES = {"confirmed", "corrected", "unconfirmed"}

errors = []


def walk(node, path, source_ids):
    if isinstance(node, dict):
        if "status" in node:
            status = node["status"]
            if status not in STATUSES:
                errors.append(f"{path}: unknown status {status!r}")
            sources = node.get("sources")
            if sources is None:
                errors.append(f"{path}: has a status but no sources list")
            else:
                for sid in sources:
                    if sid not in source_ids:
                        errors.append(f"{path}: unknown source id {sid!r}")
                if status in ("confirmed", "corrected") and not sources:
                    errors.append(f"{path}: {status} value must name a source")
        for key, value in node.items():
            walk(value, f"{path}.{key}", source_ids)
    elif isinstance(node, list):
        ids = [item["id"] for item in node if isinstance(item, dict) and "id" in item]
        dupes = {i for i in ids if ids.count(i) > 1}
        if dupes:
            errors.append(f"{path}: duplicate ids {sorted(dupes)}")
        for i, item in enumerate(node):
            walk(item, f"{path}[{i}]", source_ids)


def schema_validate(files):
    try:
        from jsonschema import Draft202012Validator
        from referencing import Registry, Resource
    except ImportError:
        print("jsonschema not installed; skipped schema validation (pip install jsonschema)")
        return
    resources = []
    for schema_file in SCHEMAS.glob("*.schema.json"):
        schema = json.loads(schema_file.read_text())
        resources.append((schema["$id"], Resource.from_contents(schema)))
    registry = Registry().with_resources(resources)
    for name, data in files.items():
        schema = json.loads((SCHEMAS / f"{name}.schema.json").read_text())
        validator = Draft202012Validator(schema, registry=registry)
        for err in validator.iter_errors(data):
            where = "/".join(str(p) for p in err.absolute_path) or "(root)"
            errors.append(f"{name}.json {where}: {err.message}")


def main():
    files = {}
    for data_file in sorted(DATA.glob("*.json")):
        name = data_file.stem
        try:
            files[name] = json.loads(data_file.read_text())
        except json.JSONDecodeError as err:
            errors.append(f"{data_file.name}: invalid JSON ({err})")
            continue
        if not (SCHEMAS / f"{name}.schema.json").exists():
            errors.append(f"{data_file.name}: no schemas/{name}.schema.json")

    if "sources" not in files:
        errors.append("data/sources.json is missing")
        source_ids = set()
    else:
        source_ids = {s["id"] for s in files["sources"]["sources"]}

    for name, data in files.items():
        if name != "sources":
            walk(data, name, source_ids)

    if not errors:
        schema_validate(files)

    if errors:
        print("\n".join(errors))
        print(f"\n{len(errors)} problem(s) found.")
        return 1
    print(f"OK: {len(files)} data files checked.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
