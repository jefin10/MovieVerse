import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.DATABASE_URL ??= 'postgresql://x:x@localhost:5432/x';
const { score } = await import('../src/services/recommendation.service.js');

const movie = (genres: string[], director = '', stars: string[] = [], imdb = 8) => ({
  genres: new Set(genres),
  director,
  stars: new Set(stars),
  imdb,
});
const quality = { ourRating: 0, imdb: 8 };

test('a movie like one you liked beats an unrelated one', () => {
  const liked = [movie(['comedy'], 'a')];
  assert.ok(score(movie(['comedy']), liked, [], quality) > score(movie(['horror']), liked, [], quality));
});

test('being like a disliked movie lowers the score', () => {
  const liked = [movie(['comedy'])];
  const disliked = [movie(['horror'], 'b')];
  const cand = movie(['comedy', 'horror'], 'b');
  assert.ok(score(cand, liked, disliked, quality) < score(cand, liked, [], quality));
});

test('same director and cast add to the score', () => {
  const liked = [movie(['drama'], 'nolan', ['bale'])];
  const related = movie(['drama'], 'nolan', ['bale']);
  const unrelated = movie(['drama'], 'other', ['other']);
  assert.ok(score(related, liked, [], quality) - score(unrelated, liked, [], quality) > 1.8);
});

test('only the closest liked movie counts, so wide taste is not punished', () => {
  const cand = movie(['comedy']);
  const one = score(cand, [movie(['comedy'])], [], quality);
  const many = score(cand, [movie(['comedy']), movie(['horror']), movie(['war'])], [], quality);
  assert.equal(one, many);
});
