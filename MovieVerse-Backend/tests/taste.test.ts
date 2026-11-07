import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareTaste, type Signals } from '../src/services/taste.service.js';

const signals = (entries: [number, number][]): Signals => new Map(entries);
// Movies 1-5 are genre 10, movies 6-10 are genre 20.
const genres = new Map(Array.from({ length: 10 }, (_, i) => [i + 1, [i < 5 ? 10 : 20]]));

test('too little activity gives no score rather than a made-up one', () => {
  const match = compareTaste(signals([[1, 1]]), signals([[1, 1], [2, 1], [3, 1]]), genres);
  assert.equal(match.score, null);
  assert.equal(match.shared, 1);
});

test('identical taste scores 100', () => {
  const a = signals([[1, 1], [2, 1], [3, 1]]);
  assert.equal(compareTaste(a, new Map(a), genres).score, 100);
});

test('no shared movies still matches on genre taste', () => {
  const a = signals([[1, 1], [2, 1], [3, 1]]);
  const sameGenre = signals([[4, 1], [5, 1], [4, 1]]);
  const b = new Map(sameGenre);
  b.set(5, 1);
  b.set(3, 0.0001); // keeps three signals; effectively genre-only
  assert.ok(compareTaste(a, b, genres).score! > 60);
});

test('opposite opinions on the same movies score below agreeing on them', () => {
  const a = signals([[1, 1], [2, 1], [6, -1], [7, -1]]);
  const agrees = signals([[1, 1], [2, 1], [6, -1], [7, -1]]);
  const opposes = signals([[1, -1], [2, -1], [6, 1], [7, 1]]);
  assert.ok(compareTaste(a, opposes, genres).score! < compareTaste(a, agrees, genres).score! - 40);
});

test('bothLiked only lists movies both people liked', () => {
  const a = signals([[1, 1], [2, 1], [3, -1]]);
  const b = signals([[1, 0.7], [2, -1], [3, -1]]);
  assert.deepEqual(compareTaste(a, b, genres).bothLiked, [1]);
});
