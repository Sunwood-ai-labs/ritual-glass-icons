<div align="center">
  <img src="./assets/ritual-glass-mark.svg" alt="SVG Concept Lab mark" width="112" />
  <h1>SVG Concept Lab</h1>
  <p>
    Codex の <code>frontend-design</code> スキルを使った、コンセプト駆動の SVG コレクション実験リポジトリです。<br />
    現在は Ritual Glass が最初の公開セットで、今後は別コンセプトのコレクションも増やせる構造に整えています。
  </p>
</div>

<p align="center">
  <a href="./README.md"><strong>English</strong></a>
</p>

<p align="center">
  <img alt="Collections" src="https://img.shields.io/badge/Collections-1%20live-0B1320?style=flat-square" />
  <img alt="SVG" src="https://img.shields.io/badge/SVG-10%20icons-0B1320?style=flat-square" />
  <img alt="Pages" src="https://img.shields.io/badge/GitHub%20Pages-ready-0B1320?style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-0B1320?style=flat-square" />
</p>

<p align="center">
  <img src="./assets/ritual-glass-hero.svg" alt="SVG Concept Lab hero artwork" width="960" />
</p>

> このリポジトリは Codex の `frontend-design` スキルの実験用リポジトリです。  
> 公開している SVG デザインは、そのスキルを使って作成したコレクションです。

## ✨ 概要
このリポジトリは、単発の 1 セット置き場ではなく、複数コンセプトの SVG コレクションを育てていくための器として設計しています。トップレベルのカタログと、各コレクションごとのフォルダを分けることで、今後セットが増えても `index.html` や検証ルールを 1 件固定で持ち続けなくて済むようにしています。

現在の公開コレクションは **Ritual Glass** です。軌道、プリズム、光輪、静かな発光をテーマにした 10 個の SVG で構成されています。

## 🧭 公開コレクション一覧
| Slug | 状態 | アイコン数 | Manifest |
| --- | --- | --- | --- |
| `ritual-glass` | `published` | 10 | [`collections/ritual-glass/collection.json`](./collections/ritual-glass/collection.json) |

全体の目録は [`collections/manifest.json`](./collections/manifest.json) にあり、静的サイトはこのファイルを読んで表示を組み立てます。

## 🚀 まず試す
ローカルでサーバーを立ててギャラリーを開きます。

```powershell
uv run python -m http.server 4173
```

その後 `http://127.0.0.1:4173` を開いてください。

## 🖼️ SVG プレビュー
<p align="center">
  <img src="./collections/ritual-glass/icons/01-luminous-orbit-seal.svg" alt="Luminous Orbit Seal" width="72" />
  <img src="./collections/ritual-glass/icons/02-prism-bloom.svg" alt="Prism Bloom" width="72" />
  <img src="./collections/ritual-glass/icons/03-crescent-portal.svg" alt="Crescent Portal" width="72" />
  <img src="./collections/ritual-glass/icons/04-comet-loop.svg" alt="Comet Loop" width="72" />
  <img src="./collections/ritual-glass/icons/05-archive-halo.svg" alt="Archive Halo" width="72" />
</p>

<p align="center">
  <img src="./collections/ritual-glass/icons/06-lumen-orbit.svg" alt="Lumen Orbit" width="72" />
  <img src="./collections/ritual-glass/icons/07-prism-petal.svg" alt="Prism Petal" width="72" />
  <img src="./collections/ritual-glass/icons/08-pulse-crown.svg" alt="Pulse Crown" width="72" />
  <img src="./collections/ritual-glass/icons/09-monolith-lens.svg" alt="Monolith Lens" width="72" />
  <img src="./collections/ritual-glass/icons/10-aether-knot.svg" alt="Aether Knot" width="72" />
</p>

<p align="center">
  <sub>README では現在の公開コレクションに入っている SVG を、そのまま直接表示しています。</sub>
</p>

## 🧱 リポジトリ構造の考え方
- [`collections/manifest.json`](./collections/manifest.json) が公開コレクション一覧の基準です。
- 各コレクションは `collections/<slug>/` にまとまり、`collection.json` でメタデータを持ちます。
- リポジトリ共通の資産は [`assets`](./assets) に置き、コレクション固有の SVG や確認画像は各コレクション内に置きます。
- [`scripts/site-catalog.mjs`](./scripts/site-catalog.mjs) がカタログを読んでギャラリーを描画します。
- [`scripts/validate-site.mjs`](./scripts/validate-site.mjs) が目録、manifest、SVG、README の整合性を検証します。

## ➕ 新しいコレクションを追加する
新規コレクションの雛形は [`scripts/new-collection.mjs`](./scripts/new-collection.mjs) で作れます。

```powershell
node .\scripts\new-collection.mjs --slug aurora-arc --name "Aurora Arc" --ja-name "Aurora Arc"
```

その後は次の順で追加します。

1. `collections/<slug>/collection.json` の内容を埋める。
2. SVG を `collections/<slug>/icons/NN-kebab-name.svg` で追加する。
3. 必要なら `collections/<slug>/checks/` に確認画像を置く。
4. `node .\scripts\validate-site.mjs` を実行する。
5. `uv run python -m http.server 4173` でローカル確認する。

## 🛠️ 追加時のチェックリスト
- slug は `ritual-glass` や `aurora-arc` のような小文字ハイフン区切りにする。
- SVG ファイル名は `NN-kebab-name.svg` にそろえる。
- すべての SVG に `<svg>`、`viewBox`、`<title>` を入れる。
- manifest の英語 / 日本語テキストを両方埋める。
- 1 つのコレクションとして世界観がまとまっているものだけを公開する。

詳しいメンテナンスルールは [`CONTRIBUTING.md`](./CONTRIBUTING.md) と [`collections/README.md`](./collections/README.md) にまとめています。

## ✅ 検証
構造検証は次のコマンドで実行できます。

```powershell
node .\scripts\validate-site.mjs
```

このバリデータでは次を確認します。

- 必須ファイルがそろっていること
- コレクション目録が有効な manifest を参照していること
- 公開対象の SVG が存在し、`<svg>`、`viewBox`、`<title>` を持つこと
- 静的サイトが固定カードではなくカタログ描画スクリプトを参照していること
- 英日 README が相互リンクし、コレクション追加導線を説明していること

加えて、一時ディレクトリで追加導線そのものを確認する smoke test も使えます。

```powershell
node .\scripts\smoke-test-collection-flow.mjs
```

## 📁 リポジトリ構成
```text
.
|-- .github/workflows/
|-- assets/
|   |-- favicon.svg
|   |-- ritual-glass-hero.svg
|   `-- ritual-glass-mark.svg
|-- collections/
|   |-- manifest.json
|   `-- ritual-glass/
|       |-- checks/
|       |-- collection.json
|       `-- icons/
|-- scripts/
|   |-- new-collection.mjs
|   |-- smoke-test-collection-flow.mjs
|   |-- site-catalog.mjs
|   |-- stage-pages.ps1
|   `-- validate-site.mjs
|-- CONTRIBUTING.md
|-- index.html
|-- LICENSE
|-- README.ja.md
|-- README.md
|-- robots.txt
`-- site.webmanifest
```

## 📄 ライセンス
このプロジェクトは [`MIT License`](./LICENSE) で公開しています。
