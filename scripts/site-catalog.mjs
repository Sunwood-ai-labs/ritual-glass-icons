const page = {
  title: document.querySelector("#page-title"),
  description: document.querySelector("#page-description"),
  status: document.querySelector("#page-status"),
  pills: document.querySelector("#site-pills"),
  switcher: document.querySelector("#collection-switcher"),
  featured: document.querySelector("#featured-collection"),
  list: document.querySelector("#collection-list"),
  heroMark: document.querySelector("#hero-mark"),
  heroArt: document.querySelector("#hero-art"),
  metaDescription: document.querySelector('meta[name="description"]'),
  ogTitle: document.querySelector('meta[property="og:title"]'),
  ogDescription: document.querySelector('meta[property="og:description"]'),
  ogImage: document.querySelector('meta[property="og:image"]'),
};

const DEFAULT_MARK = "./assets/ritual-glass-mark.svg";
const DEFAULT_HERO = "./assets/ritual-glass-hero.svg";
const url = new URL(window.location.href);
const locale = url.searchParams.get("lang") === "ja" || navigator.language.startsWith("ja") ? "ja" : "en";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[character];
  });
}

function pickText(value) {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  return value[locale] ?? value.en ?? value.ja ?? "";
}

function titleCaseStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return status.slice(0, 1).toUpperCase() + status.slice(1);
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return "143 239 255";
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `${red} ${green} ${blue}`;
}

function resolveCollectionUrl(collection, relativePath, fallback = "") {
  if (!relativePath) {
    return fallback;
  }

  return new URL(relativePath, collection._manifestUrl).href;
}

function setTheme(collection) {
  const theme = collection.theme ?? {};
  const accent = theme.accent ?? "#8fefff";
  const accentWarm = theme.accentWarm ?? "#f8d4a0";
  const surface = theme.surface ?? "#081322";

  document.documentElement.style.setProperty("--collection-accent", accent);
  document.documentElement.style.setProperty("--collection-accent-rgb", hexToRgb(accent));
  document.documentElement.style.setProperty("--collection-warm", accentWarm);
  document.documentElement.style.setProperty("--collection-warm-rgb", hexToRgb(accentWarm));
  document.documentElement.style.setProperty("--collection-surface", surface);
  document.documentElement.style.setProperty("--collection-surface-rgb", hexToRgb(surface));
}

function setMeta(registry, collection) {
  const siteTitle = registry.site?.title ?? "SVG Concept Lab";
  const collectionName = pickText(collection.name);
  const description = pickText(collection.description) || pickText(collection.summary);
  const hero = resolveCollectionUrl(collection, collection.hero, DEFAULT_HERO);

  document.title = `${siteTitle} • ${collectionName}`;
  page.metaDescription?.setAttribute("content", description);
  page.ogTitle?.setAttribute("content", `${siteTitle} • ${collectionName}`);
  page.ogDescription?.setAttribute("content", description);
  page.ogImage?.setAttribute("content", hero);
}

function renderSitePills(registry, collections) {
  const totalIcons = collections.reduce((count, collection) => count + collection.icons.length, 0);
  const pills = [
    `${collections.length} collection${collections.length === 1 ? "" : "s"}`,
    `${totalIcons} SVG icons`,
    "frontend-design Experiment",
  ];

  page.pills.innerHTML = pills
    .map((pill) => `<span class="meta-pill">${escapeHtml(pill)}</span>`)
    .join("");

  const activeName = collections.find((collection) => collection.slug === state.activeSlug)?.name ?? "";
  page.status.innerHTML = `
    <span class="status-pill status-${escapeHtml(state.activeCollection.status)}">${escapeHtml(titleCaseStatus(state.activeCollection.status))}</span>
    <span class="status-text">${escapeHtml(pickText(activeName))}</span>
  `;

  page.title.textContent = registry.site?.title ?? "SVG Concept Lab";
  page.description.textContent = pickText(state.activeCollection.summary) || (registry.site?.tagline ?? "");
}

function renderSwitcher(collections) {
  page.switcher.innerHTML = "";

  for (const collection of collections) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "switch-chip";
    button.dataset.slug = collection.slug;
    button.setAttribute("aria-pressed", String(collection.slug === state.activeSlug));
    button.innerHTML = `
      <span class="switch-chip__name">${escapeHtml(pickText(collection.name))}</span>
      <span class="switch-chip__meta">${escapeHtml(collection.icons.length)} icons</span>
    `;
    button.addEventListener("click", () => selectCollection(collection.slug));
    page.switcher.append(button);
  }
}

function renderFeatured(collection) {
  const hero = resolveCollectionUrl(collection, collection.hero, DEFAULT_HERO);
  const mark = resolveCollectionUrl(collection, collection.mark, DEFAULT_MARK);
  const desktopCheck = resolveCollectionUrl(collection, collection.screenshots?.desktop);
  const mobileCheck = resolveCollectionUrl(collection, collection.screenshots?.mobile);
  const collectionName = pickText(collection.name);
  const summary = pickText(collection.summary);
  const description = pickText(collection.description);
  const skill = collection.credits?.skill ? `${collection.credits.skill} skill` : "concept collection";
  const firstIconUrl = collection.icons[0] ? resolveCollectionUrl(collection, collection.icons[0].file) : "";
  const checkFrames = [
    desktopCheck
      ? `<figure class="check-frame"><img src="${escapeHtml(desktopCheck)}" alt="${escapeHtml(collectionName)} desktop QA check" /><figcaption>Desktop QA</figcaption></figure>`
      : "",
    mobileCheck
      ? `<figure class="check-frame"><img src="${escapeHtml(mobileCheck)}" alt="${escapeHtml(collectionName)} mobile QA check" /><figcaption>Mobile QA</figcaption></figure>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  page.heroMark.src = mark;
  page.heroMark.alt = `${collectionName} mark`;
  page.heroArt.src = hero;
  page.heroArt.alt = `${collectionName} hero artwork`;

  page.featured.innerHTML = `
    <article class="feature-card">
      <div class="feature-copy">
        <div class="feature-topline">
          <span class="status-pill status-${escapeHtml(collection.status)}">${escapeHtml(titleCaseStatus(collection.status))}</span>
          <span class="meta-pill">${escapeHtml(collection.icons.length)} icons</span>
          <span class="meta-pill">${escapeHtml(skill)}</span>
        </div>
        <h2>${escapeHtml(collectionName)}</h2>
        <p class="feature-summary">${escapeHtml(summary)}</p>
        <p class="feature-description">${escapeHtml(description)}</p>
        <div class="feature-actions">
          <a class="action-link" href="${escapeHtml(collection._manifestUrl)}">Open manifest</a>
          ${firstIconUrl ? `<a class="action-link" href="${escapeHtml(firstIconUrl)}">Open first SVG</a>` : ""}
        </div>
      </div>
      <div class="feature-visual">
        <img class="feature-hero" src="${escapeHtml(hero)}" alt="${escapeHtml(collectionName)} hero artwork" />
        ${checkFrames ? `<div class="check-grid">${checkFrames}</div>` : ""}
      </div>
    </article>
  `;
}

function renderCollectionList(collections) {
  const ordered = [
    ...collections.filter((collection) => collection.slug === state.activeSlug),
    ...collections.filter((collection) => collection.slug !== state.activeSlug),
  ];

  page.list.innerHTML = ordered
    .map((collection) => {
      const collectionName = pickText(collection.name);
      const isActive = collection.slug === state.activeSlug;
      const iconCards = collection.icons
        .slice()
        .sort((left, right) => left.order - right.order)
        .map((icon) => {
          const fileUrl = resolveCollectionUrl(collection, icon.file);
          const tags = Array.isArray(icon.tags)
            ? icon.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")
            : "";

          return `
            <article class="icon-card">
              <div class="icon-stage">
                <img src="${escapeHtml(fileUrl)}" alt="${escapeHtml(pickText(icon.name))}" loading="lazy" />
              </div>
              <div class="icon-meta">
                <span class="icon-order">${String(icon.order).padStart(2, "0")}</span>
                <h3>${escapeHtml(pickText(icon.name))}</h3>
              </div>
              <p>${escapeHtml(pickText(icon.description))}</p>
              <ul class="tag-row">${tags}</ul>
              <a class="asset-link" href="${escapeHtml(fileUrl)}">View SVG</a>
            </article>
          `;
        })
        .join("");
      const gridContent = iconCards || `<div class="empty-state">No SVG icons have been added to this collection yet.</div>`;

      return `
        <section class="collection-card${isActive ? " is-active" : ""}" id="collection-${escapeHtml(collection.slug)}">
          <div class="collection-card__header">
            <div>
              <p class="collection-card__eyebrow">${escapeHtml(titleCaseStatus(collection.status))} collection</p>
              <h2>${escapeHtml(collectionName)}</h2>
            </div>
            <p>${escapeHtml(pickText(collection.summary))}</p>
          </div>
          <div class="icon-grid">
            ${gridContent}
          </div>
        </section>
      `;
    })
    .join("");
}

async function loadRegistry() {
  const registryUrl = new URL("./collections/manifest.json", import.meta.url);
  const registryResponse = await fetch(registryUrl);
  if (!registryResponse.ok) {
    throw new Error(`Failed to load registry: ${registryResponse.status}`);
  }

  const registry = await registryResponse.json();
  const collections = await Promise.all(
    registry.collections.map(async (entry) => {
      const manifestUrl = new URL(entry.manifest, registryUrl).href;
      const response = await fetch(manifestUrl);
      if (!response.ok) {
        throw new Error(`Failed to load collection manifest: ${entry.slug}`);
      }

      const collection = await response.json();
      return {
        ...collection,
        _manifestUrl: manifestUrl,
      };
    }),
  );

  collections.sort((left, right) => left.displayOrder - right.displayOrder || left.slug.localeCompare(right.slug));
  return { registry, collections };
}

function showError(message) {
  page.featured.innerHTML = `
    <article class="feature-card feature-card--error">
      <h2>Unable to load the SVG catalog</h2>
      <p>${escapeHtml(message)}</p>
    </article>
  `;
  page.list.innerHTML = "";
}

function selectCollection(slug) {
  state.activeSlug = slug;
  state.activeCollection = state.collections.find((collection) => collection.slug === slug) ?? state.collections[0];

  if (!state.activeCollection) {
    return;
  }

  setTheme(state.activeCollection);
  setMeta(state.registry, state.activeCollection);
  renderSitePills(state.registry, state.collections);
  renderSwitcher(state.collections);
  renderFeatured(state.activeCollection);
  renderCollectionList(state.collections);

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("collection", state.activeCollection.slug);
  if (locale === "ja") {
    nextUrl.searchParams.set("lang", "ja");
  } else {
    nextUrl.searchParams.delete("lang");
  }
  window.history.replaceState({}, "", nextUrl);
}

const state = {
  registry: null,
  collections: [],
  activeSlug: "",
  activeCollection: null,
};

try {
  const { registry, collections } = await loadRegistry();
  const requestedSlug = url.searchParams.get("collection");
  const activeSlug = collections.some((collection) => collection.slug === requestedSlug)
    ? requestedSlug
    : registry.defaultCollection;

  state.registry = registry;
  state.collections = collections;
  state.activeSlug = activeSlug;
  state.activeCollection = collections.find((collection) => collection.slug === activeSlug) ?? collections[0];

  if (!state.activeCollection) {
    throw new Error("The registry does not contain any collections.");
  }

  selectCollection(state.activeCollection.slug);
} catch (error) {
  console.error(error);
  showError(error.message);
}
