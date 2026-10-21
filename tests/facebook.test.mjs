import assert from 'node:assert/strict';
import { test } from 'node:test';
import { facebookPostUrlOrUndefined } from '../src/utils/facebook.ts';

test('accetta i link HTTPS ai post Facebook e fb.watch', () => {
  assert.equal(
    facebookPostUrlOrUndefined('https://www.facebook.com/share/p/abc123/'),
    'https://www.facebook.com/share/p/abc123/',
  );
  assert.equal(facebookPostUrlOrUndefined('https://fb.watch/abc123/'), 'https://fb.watch/abc123/');
});

test('non mostra link assenti, insicuri o di altri domini', () => {
  for (const url of [
    null,
    '',
    'javascript:alert(1)',
    'http://facebook.com/post/123',
    'https://facebook.com.evil.example/post/123',
    'https://example.com/post/123',
    'https://user:password@facebook.com/post/123',
    'not a URL',
  ]) {
    assert.equal(facebookPostUrlOrUndefined(url), undefined);
  }
});
