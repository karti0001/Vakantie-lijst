import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { parseYaml } from '../src/yaml.js';

const seedItems = parseYaml(readFileSync('data/items.yaml', 'utf8'));
const privateSeedItems = parseYaml(readFileSync('data/items-private.yaml', 'utf8'));

describe('seed packing list', () => {
  it('keeps business-trip items divided over the supported categories', () => {
    expect(seedItems.documenten).toEqual(expect.arrayContaining([
      'paspoort',
      'pasjes',
      'creditcard',
      'company card',
    ]));
    expect(seedItems.kleding).toEqual(expect.arrayContaining([
      'onderbroeken',
      "bh's",
      't-shirt',
      'overhemd',
      'truitje',
      'sokken',
      'slippers',
    ]));
    expect(seedItems.toiletartikelen).toEqual(expect.arrayContaining([
      'shampoo',
      'conditioner',
      'gezicht creme',
      'tandpasta',
      'tandenborstel',
      'borstel',
      'luchtje',
      'beugel',
      'beugelbakje',
      'medicijnen',
    ]));
    expect(seedItems.elektronica).toEqual(expect.arrayContaining([
      'laptop',
      'opladers',
      'powerbank',
      'stekkerdoos',
    ]));
    expect(seedItems['voor-vertrek']).toEqual([]);
  });

  it('does not contain duplicate seed items', () => {
    const allItems = Object.values(seedItems).flat();
    const normalizedItems = allItems.map((item) => item
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim());

    expect(new Set(normalizedItems).size).toBe(normalizedItems.length);
  });

  it('contains 223 default private-trip items', () => {
    const privateTripItemCount = Object.values(privateSeedItems).flat().length;

    expect(privateTripItemCount).toBe(223);
  });

  it('keeps private-trip seed items divided over the supported categories', () => {
    expect(privateSeedItems.documenten).toEqual(expect.arrayContaining([
      'paspoort',
      'pasjes',
      'zorgpas',
    ]));
    expect(privateSeedItems.kleding).toEqual(expect.arrayContaining([
      'onderbroeken',
      "bh's",
      't-shirt',
      'jurk',
      'zwemkleding',
      'sokken',
      'slippers',
    ]));
    expect(privateSeedItems.toiletartikelen).toEqual(expect.arrayContaining([
      'shampoo',
      'conditioner',
      'zonnebrand',
      'tandpasta',
      'tandenborstel',
      'borstel',
      'aftersun',
      'medicijnen',
    ]));
    expect(privateSeedItems.elektronica).toEqual(expect.arrayContaining([
      'telefoon',
      'oplader',
      'oortjes',
      'e-reader',
    ]));
    expect(privateSeedItems['voor-vertrek']).toEqual(expect.arrayContaining(['plantjes water geven']));
  });
});
