import { describe, it, expect } from 'vitest';
import { mergeDefaults, loadState, saveState, STORAGE_KEY } from '../src/storage.js';

function memStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    length: 0,
  };
}

describe('storage', () => {
  it('saves and loads state round-trip', () => {
    const s = memStorage();
    const state = {
      version: 1,
      theme: 'dark',
      items: [
        { id: 'a', name: 'passport', category: 'must-have', custom: false, checked: true },
      ],
    };
    saveState(state, s);
    expect(loadState(s)).toEqual(state);
    expect(s.getItem(STORAGE_KEY)).toBeTruthy();
  });

  it('returns null for missing or corrupt state', () => {
    const s = memStorage();
    expect(loadState(s)).toBeNull();
    s.setItem(STORAGE_KEY, '{not json');
    expect(loadState(s)).toBeNull();
    s.setItem(STORAGE_KEY, '{"version":99}');
    expect(loadState(s)).toBeNull();
  });

  it('loads state from a legacy storage key when v2 key is missing', () => {
    const s = memStorage();
    const legacyState = {
      version: 1,
      theme: 'light',
      tripType: 'private',
      items: [
        { id: 'legacy-1', name: 'paspoort', category: 'documents', custom: false, checked: true },
      ],
    };
    s.setItem('travel-prep:state', JSON.stringify(legacyState));

    expect(loadState(s)).toEqual(legacyState);
  });

  it('prefers v2 state over legacy storage keys', () => {
    const s = memStorage();
    const currentState = {
      version: 1,
      theme: 'dark',
      tripType: 'business',
      items: [
        { id: 'v2-1', name: 'company card', category: 'documents', custom: false, checked: false },
      ],
    };
    const legacyState = {
      version: 1,
      theme: 'light',
      tripType: 'private',
      items: [
        { id: 'legacy-1', name: 'paspoort', category: 'documents', custom: false, checked: true },
      ],
    };

    s.setItem(STORAGE_KEY, JSON.stringify(currentState));
    s.setItem('travel-prep:state', JSON.stringify(legacyState));

    expect(loadState(s)).toEqual(currentState);
  });
});

describe('mergeDefaults', () => {
  const defaults = {
    'documents': ['passport'],
    'clothing': ['socks'],
    'toiletries': ['sunscreen'],
    'electronics': ['laptop'],
    'pre-departure': ['water plants'],
  };

  it('creates fresh state from defaults', () => {
    const merged = mergeDefaults(defaults, null);
    expect(merged.items).toHaveLength(5);
    expect(merged.items.every((i) => i.checked === false)).toBe(true);
    expect(merged.items.every((i) => i.custom === false)).toBe(true);
    expect(merged.theme).toBe('auto');
    expect(merged.tripType).toBe('private');
  });

  it('accepts Dutch category keys from the seed YAML', () => {
    const merged = mergeDefaults({
      documenten: ['paspoort'],
      kleding: ['sokken'],
      toiletartikelen: ['zonnebrandcrème'],
      elektronica: ['laptop'],
      'voor-vertrek': ['planten water geven'],
    }, null);

    expect(merged.items.map((i) => `${i.category}:${i.name}`)).toEqual([
      'documents:paspoort',
      'clothing:sokken',
      'toiletries:zonnebrandcrème',
      'electronics:laptop',
      'pre-departure:planten water geven',
    ]);
  });

  it('preserves checked state of existing default items (case-insensitive)', () => {
    const existing = {
      version: 1,
      theme: 'dark',
      tripType: 'business',
      items: [
        { id: 'p', name: 'Passport', category: 'documents', custom: false, checked: true },
      ],
    };
    const merged = mergeDefaults(defaults, existing);
    const passport = merged.items.find((i) => i.name === 'passport');
    expect(passport.checked).toBe(true);
    expect(merged.theme).toBe('dark');
    expect(merged.tripType).toBe('business');
  });

  it('keeps user-added custom items', () => {
    const existing = {
      version: 1,
      theme: 'auto',
      items: [
        { id: 'x', name: 'kindle', category: 'electronics', custom: true, checked: false },
      ],
    };
    const merged = mergeDefaults(defaults, existing);
    expect(merged.items.find((i) => i.name === 'kindle')).toMatchObject({
      custom: true,
      category: 'electronics',
    });
  });
});
