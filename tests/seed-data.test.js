import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { parseYaml } from '../src/yaml.js';

const seedItems = parseYaml(readFileSync('data/items.yaml', 'utf8'));

describe('seed packing list', () => {
  it('keeps private-trip items divided over the supported categories', () => {
    expect(seedItems.documenten).toEqual(expect.arrayContaining([
      'paspoorten',
      'visum',
      'creditcard en pasjes ABN ING',
    ]));
    expect(seedItems.kleding).toEqual(expect.arrayContaining([
      'handbagage tas',
      'sport elastieken',
      'UV shirt + broekje',
    ]));
    expect(seedItems.toiletartikelen).toEqual(expect.arrayContaining([
      'tandenstokers / flos / gummetjes / raggers',
      'muggenspul deet',
      'conditioner',
    ]));
    expect(seedItems.elektronica).toEqual(expect.arrayContaining([
      'AirPods + oplader',
      'telefoons + opladers',
      'laptop + oplader',
    ]));
    expect(seedItems['voor-vertrek']).toEqual(expect.arrayContaining([
      'waterdrop',
      'B&B vol liefde kaartspel',
      'nespresso cupjes',
    ]));
  });

  it('does not contain duplicate seed items', () => {
    const allItems = Object.values(seedItems).flat();
    const normalizedItems = allItems.map((item) => item.toLowerCase());

    expect(new Set(normalizedItems).size).toBe(normalizedItems.length);
  });
});
