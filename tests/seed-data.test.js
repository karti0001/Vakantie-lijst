import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { parseYaml } from '../src/yaml.js';

const seedItems = parseYaml(readFileSync('data/items.yaml', 'utf8'));
const privateSeedItems = parseYaml(readFileSync('data/items-private.yaml', 'utf8'));
const weekendSeedItems = parseYaml(readFileSync('data/items-weekend.yaml', 'utf8'));

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

  it('contains 240 default private-trip items', () => {
    const privateTripItemCount = Object.values(privateSeedItems).flat().length;

    expect(privateTripItemCount).toBe(240);
  });

  it('keeps private-trip seed items divided over the supported categories', () => {
    expect(privateSeedItems.documenten).toEqual(expect.arrayContaining([
      'paspoort',
      'rijbewijs',
      'zorgpas',
    ]));
    expect(privateSeedItems.kleding).toEqual(expect.arrayContaining([
      "bh's",
      't-shirts',
      'strandjurk',
      'sokken',
      'slippers',
    ]));
    expect(privateSeedItems.toiletartikelen).toEqual(expect.arrayContaining([
      'shampoo',
      'conditioner',
      'zonnebrandcrème',
      'tandpasta',
      'tandenborstels',
      'borstel',
      'aftersun',
    ]));
    expect(privateSeedItems.medicijnen).toEqual(expect.arrayContaining([
      'paracetamol',
      'allergiepillen',
      'melatonine',
    ]));
    expect(privateSeedItems.elektronica).toEqual(expect.arrayContaining([
      'AirPods + oplader',
      'laptop + oplader',
      'e-readers + oplader',
    ]));
    expect(privateSeedItems.strand).toEqual(expect.arrayContaining([
      'badpak',
      "bikini's",
      'snorkels + bril',
    ]));
    expect(privateSeedItems.eten).toEqual(expect.arrayContaining([
      'rijstwafels',
      'smint',
      'waterfles',
    ]));
    // The handbagage section is intentionally a carry-on checklist:
    // it contains a curated subset of items from other categories so the
    // traveller can tick them off independently when packing the cabin bag.
    expect(privateSeedItems.handbagage).toEqual(expect.arrayContaining([
      'paracetamol',
      'melatonine',
      'AirPods',
    ]));
    // Verify the cross-category duplication is explicit and expected:
    // an item present in handbagage may also appear in its primary category.
    expect(privateSeedItems.medicijnen).toContain('paracetamol');
    expect(privateSeedItems.handbagage).toContain('paracetamol');
    expect(privateSeedItems['voor-vertrek']).toEqual(expect.arrayContaining(['planten water geven']));
  });

  it('contains the requested Weekend weg default items', () => {
    const weekendItems = Object.values(weekendSeedItems).flat();

    expect(weekendItems).toEqual(expect.arrayContaining([
      'Paspoorten',
      'Rijbewijs',
      'Bankpasjes',
      'Dekbedden',
      'Dekbedovertrek',
      'Kussensloop',
      'Hoeslaken',
      'Hoofd kussens',
      'Kleine kussens',
      'Kussens Bart',
      'AirPods + oplader',
      'Telefoons + opladers',
      'Horloge + oplader',
      'Stekkerdozen',
      'Laptop + oplader',
      'Ventilator + oplader',
      'Föhn',
      'Electrische tandenborstel + lader',
      'Handtas',
      'Waterdichte tas',
      'Waterdichte heuptasjes',
      'Contactlenzen',
      'Bril',
      'Leesbril',
      'Zonnebrillen',
      'Oordoppen',
      'Puffers',
      'Medicijn doosje',
      'Rennies',
      'Allergiepillen (!)',
      'Maandverband',
      'Tampons',
      'Inlegkruisjes',
      'Make-up',
      'Spiegel',
      'Pincet',
      'Haarklemmen',
      'Elastiekjes',
      'Borstels klein groot',
      'Tandenborstels',
      'Tandpasta',
      'Tandenstokers/flos/gummetjes',
      'Nachtbeugel',
      'Scheermesje',
      'Doucheschuim',
      'Conditioner',
      'Shampoo',
      'Bodylotion',
      'Handzeep',
      'Zonnebrandcrème',
      'Dagcrème',
      'Haarspray',
      'Haarolie',
      'Uitgroeispray',
      'Muggenspul deet',
      'Anti muggenjeuk',
      'Vliegenmepper',
      'Luchtjes',
      'Micellair water',
      'Micellair waterproef',
      'Watjes',
      'Wattenstaafjes',
      'Nagelknipper',
      'Nagelvijl',
      'Nagellak remover',
      'Nagellak',
      'Pleisters',
      'Schaar',
      'Mesje',
      'Purol/lipbalm',
      'Schoonmaakdoekjes glorix (!!!)',
      'Zakdoekjes',
      'Pedaalemmerzakken',
      'Waterfles',
      'Waterdrops',
      'Telefoonhoesje met touwtje',
      'Waterdicht telefoonhoesje',
      'Waterdicht heuptasje',
      'Waterdichte rugtas zwart',
      'Opvouwbaar tasje',
      'Onderbroek met pijpjes',
      'Armsleeve',
      'Polsband',
      'Spelletjes',
      'Ondergoed',
      'Bh’s',
      'BH clipje',
      'Korte broeken',
      'Lange broek',
      'Lange mouwen',
      'Hemdjes',
      'T-shirts',
      'Sportleggings',
      'Sport shirt',
      'Sweater',
      'Sokken',
      'Slaap hemdje',
      'Slaap broekje',
      'Handdoeken',
      'Badhanddoeken dunne',
      '(Natte) washandjes',
      'Zwemkleding',
      'Waterschoentjes (!!!)',
      'Carbijnhaken',
      'Sportkleding + schoenen',
      'Slippers',
      'Sneakers',
      'Wandelschoenen',
      'Puzzelboekjes',
      'Pennen uitwisbare',
      'Yahtzee',
      'Catan',
      'The Game',
      'Tric trac',
      'Theedoek',
      'Eiwitpoeder',
      'Blender??',
    ]));
  });
});
