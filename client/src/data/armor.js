/**
 * Client-side armor metadata. Mirrors the server's bundleController.ARMOR_META
 * so the hero and the forge can render before any request resolves.
 */

export const ARMOR = [
  {
    key: 'helmet',
    name: 'Helmet of Salvation',
    short: 'Helmet',
    verse: 'Take the helmet of salvation.',
    verseRef: 'Ephesians 6:17',
    category: 'kids-comics',
    rack: 'Kids Comics',
    blurb: 'Guard the mind. Where the story starts for the youngest readers.',
    color: '#35e7dc',
    angle: -90,
  },
  {
    key: 'breastplate',
    name: 'Breastplate of Righteousness',
    short: 'Breastplate',
    verse: 'With the breastplate of righteousness in place.',
    verseRef: 'Ephesians 6:14',
    category: 'action-bibles',
    rack: 'Action Bibles',
    blurb: 'The core of the kit. The full Action Bible line.',
    color: '#e3b93b',
    angle: -30,
  },
  {
    key: 'belt',
    name: 'Belt of Truth',
    short: 'Belt',
    verse: 'With the belt of truth buckled around your waist.',
    verseRef: 'Ephesians 6:14',
    category: 'study-editions',
    rack: 'Study Editions',
    blurb: 'Study editions and handbooks that hold everything together.',
    color: '#ff5a2b',
    angle: 30,
  },
  {
    key: 'shield',
    name: 'Shield of Faith',
    short: 'Shield',
    verse: 'Take up the shield of faith.',
    verseRef: 'Ephesians 6:16',
    category: 'devotionals',
    rack: 'Devotionals',
    blurb: 'Devotionals and daily readings for when the arrows come.',
    color: '#7b6bff',
    angle: 90,
  },
  {
    key: 'sword',
    name: 'Sword of the Spirit',
    short: 'Sword',
    verse: 'The sword of the Spirit, which is the word of God.',
    verseRef: 'Ephesians 6:17',
    category: 'boxed-sets',
    rack: 'Boxed Sets',
    blurb: 'Boxed sets and collections. The whole armoury in one crate.',
    color: '#f5f0dc',
    angle: 150,
  },
  {
    key: 'boots',
    name: 'Boots of the Gospel',
    short: 'Boots',
    verse: 'With your feet fitted with readiness.',
    verseRef: 'Ephesians 6:15',
    category: 'gear',
    rack: 'Gear',
    blurb: 'Gear, posters and everything you carry out the door.',
    color: '#4ad991',
    angle: 210,
  },
];

export const ARMOR_BY_KEY = Object.fromEntries(ARMOR.map((a) => [a.key, a]));

export const CATEGORIES = [
  { key: 'action-bibles', label: 'Action Bibles' },
  { key: 'kids-comics', label: 'Kids Comics' },
  { key: 'study-editions', label: 'Study Editions' },
  { key: 'devotionals', label: 'Devotionals' },
  { key: 'boxed-sets', label: 'Boxed Sets' },
  { key: 'gear', label: 'Gear' },
];

export const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Price up' },
  { key: 'price-desc', label: 'Price down' },
  { key: 'rating', label: 'Top rated' },
  { key: 'title', label: 'A to Z' },
];

/** Verses shown by the Verse of the Day beacon. Rotates by day of year. */
export const VERSES = [
  { text: 'Put on the full armor of God, so that you can take your stand.', ref: 'Ephesians 6:11' },
  { text: 'The Lord is my light and my salvation - whom shall I fear?', ref: 'Psalm 27:1' },
  { text: 'Be strong and courageous. Do not be afraid.', ref: 'Joshua 1:9' },
  { text: 'Your word is a lamp for my feet, a light on my path.', ref: 'Psalm 119:105' },
  { text: 'The battle is the Lord’s.', ref: '1 Samuel 17:47' },
  { text: 'I can do all this through him who gives me strength.', ref: 'Philippians 4:13' },
  { text: 'He gives strength to the weary and increases the power of the weak.', ref: 'Isaiah 40:29' },
];

export const verseOfTheDay = () => {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const day = Math.floor((Date.now() - start) / 86400000);
  return VERSES[day % VERSES.length];
};
