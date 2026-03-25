# Contributing

This repository is organized as a growing catalog of SVG concept collections.

## Ground Rules

- Put each collection in `collections/<slug>/`.
- Use kebab-case for the collection slug.
- Keep SVG filenames in `NN-kebab-name.svg` form.
- Every SVG must include `<svg>`, `viewBox`, and `<title>`.
- Keep English and Japanese metadata aligned in `collection.json`.
- Use `draft` for incomplete collections and switch to `published` only when the set feels coherent.

## Recommended Workflow

1. Create a branch for the collection work.
2. Scaffold the collection:

   ```powershell
   node .\scripts\new-collection.mjs --slug aurora-arc --name "Aurora Arc" --ja-name "Aurora Arc"
   ```

3. Fill in `collections/<slug>/collection.json`.
4. Add SVG files to `collections/<slug>/icons/`.
5. Add optional browser QA screenshots to `collections/<slug>/checks/`.
6. Run:

   ```powershell
   node .\scripts\validate-site.mjs
   node .\scripts\smoke-test-collection-flow.mjs
   uv run python -m http.server 4173
   ```

7. Open `http://127.0.0.1:4173` and confirm the collection renders correctly.

## Draft Policy

- New collections start in `draft`.
- Draft collections stay visible in the catalog with a `Draft` badge so design work can be reviewed in context.
- Draft collections may temporarily contain zero SVG files, but they should still keep valid metadata and folder structure.

## Smoke Test

Use the scaffold smoke test before publishing a structural refactor:

```powershell
node .\scripts\smoke-test-collection-flow.mjs
```

This command creates a temporary workspace, runs `new-collection.mjs`, and verifies that the registry and draft scaffold are produced correctly.

## Review Expectations

- Keep collection metadata readable without opening the SVG source.
- Use tags that help future filtering or search.
- Update README copy only when the public story changes.
- Treat screenshots as QA evidence, not as the primary showcase asset.
