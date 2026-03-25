# Collections

This directory contains every SVG concept collection published by the repository.

## Structure

Each collection lives under `collections/<slug>/` and should use this layout:

```text
collections/<slug>/
├─ collection.json
├─ icons/
│  └─ NN-kebab-name.svg
└─ checks/
   ├─ .gitkeep
   └─ optional-browser-checks.png
```

## Required Files

- `collection.json`: metadata, localized copy, theme tokens, and icon inventory
- `icons/`: the SVG assets that belong to the collection
- `checks/`: optional screenshots or browser QA evidence for that collection

## Registry Model

The top-level [`manifest.json`](./manifest.json) is the public registry for the site.

- Add one entry per collection with a unique `slug`.
- Point `manifest` to the collection's `collection.json`.
- Keep `defaultCollection` set to a published collection.

## Collection Metadata

`collection.json` should define:

- `slug`, `status`, and `displayOrder`
- `name`, `summary`, and `description` with `en` and `ja` fields
- optional shared assets such as `mark`, `hero`, and `screenshots`
- `theme` tokens for collection-specific accent colors
- `icons`, where each item has:
  - `id`
  - `order`
  - localized `name`
  - localized `description`
  - `file`
  - `tags`

## Validation

Run the repository validator after adding or editing any collection:

```powershell
node .\scripts\validate-site.mjs
```

To verify the scaffold workflow itself, run:

```powershell
node .\scripts\smoke-test-collection-flow.mjs
```

## Draft Visibility Policy

- Collections may be registered while still in `draft`.
- Draft collections remain visible in the catalog and are labeled clearly.
- Empty `icons` arrays are acceptable for drafts, but published collections should ship with real SVG assets.
