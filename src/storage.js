/**
 * LocalStorage wrapper with a stable JSON shape.
 *
 * Shape:
 * {
 *   version: 1,
 *   items: [{ id, name, category: 'documents'|'clothing'|'toiletries'|'medicine'|'electronics'|'beach'|'food'|'carry-on'|'pre-departure', custom: boolean, checked: boolean }],
 *   theme: 'auto' | 'light' | 'dark',
 *   tripType: 'private' | 'business' | 'weekend',
 *   destinationCountry: string
 * }
 */

export const STORAGE_KEY = 'travel-prep:state:v2';
const LEGACY_STORAGE_KEYS = ['travel-prep:state:v1', 'travel-prep:state'];

/**
 * @typedef {{ id: string, name: string, category: 'documents' | 'clothing' | 'toiletries' | 'medicine' | 'electronics' | 'beach' | 'food' | 'carry-on' | 'pre-departure', custom: boolean, checked: boolean }} Item
 * @typedef {{ version: 1, items: Item[], theme: 'auto'|'light'|'dark', tripType: 'private'|'business'|'weekend', destinationCountry: string }} State
 */

/** @returns {State | null} */
export function loadState(storage = globalThis.localStorage) {
  const parseState = (raw) => {
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.items)) return null;
    return parsed;
  };

  try {
    const current = parseState(storage.getItem(STORAGE_KEY));
    if (current) return current;

    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacy = parseState(storage.getItem(legacyKey));
      if (legacy) return legacy;
    }
    return null;
  } catch {
    return null;
  }
}

/** @param {State} state */
export function saveState(state, storage = globalThis.localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Merge defaults from YAML into existing state without clobbering user changes.
 *
 * - Items already present (matched by category + lowercased name) keep their
 *   `checked` value.
 * - New default items are added unchecked.
 * - Custom (user-added) items are preserved.
 *
 * @param {Record<string, string[]>} defaults
 * @param {State | null} existing
 * @returns {State}
 */
export function mergeDefaults(defaults, existing) {
  /** @type {State} */
  const next = {
    version: 1,
    items: [],
    theme: existing?.theme ?? 'auto',
    tripType: existing?.tripType ?? 'private',
    destinationCountry: existing?.destinationCountry ?? '',
  };

  const existingByKey = new Map();
  if (existing) {
    for (const it of existing.items) {
      existingByKey.set(`${it.category}::${it.name.toLowerCase()}`, it);
    }
  }

  /** @type {Array<'documents'|'clothing'|'toiletries'|'medicine'|'electronics'|'beach'|'food'|'carry-on'|'pre-departure'>} */
  const cats = ['documents', 'clothing', 'toiletries', 'medicine', 'electronics', 'beach', 'food', 'carry-on', 'pre-departure'];
  const yamlKeys = {
    documents: ['documents', 'documenten'],
    clothing: ['clothing', 'kleding'],
    toiletries: ['toiletries', 'toiletartikelen'],
    medicine: ['medicine', 'medicijnen'],
    electronics: ['electronics', 'elektronica'],
    beach: ['beach', 'strand'],
    food: ['food', 'eten'],
    'carry-on': ['carry-on', 'handbagage'],
    'pre-departure': ['pre-departure', 'voor-vertrek'],
  };
  for (const cat of cats) {
    const names = yamlKeys[cat].flatMap((key) => defaults[key] ?? []);
    for (const name of names) {
      const key = `${cat}::${name.toLowerCase()}`;
      const prev = existingByKey.get(key);
      next.items.push({
        id: prev?.id ?? cryptoRandomId(),
        name,
        category: cat,
        custom: false,
        checked: prev?.checked ?? false,
      });
      existingByKey.delete(key);
    }
  }

  // Preserve any remaining items from existing state — these are user-added
  // custom items, or defaults that have since been removed from the YAML
  // (we keep them as custom so the user doesn't lose data).
  for (const it of existingByKey.values()) {
    next.items.push({ ...it, custom: true });
  }

  return next;
}

export function cryptoRandomId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
