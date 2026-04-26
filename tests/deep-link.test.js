import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseDeepLink, generateDeepLink } from '../src/features/deep-link.js';

describe('generateDeepLink', () => {
  it('encodes LPA string into URL', () => {
    const url = generateDeepLink('LPA:1$carrier.example.com$ABC12-DEF34', 'https://example.com');
    assert.ok(url.startsWith('https://example.com/?lpa='));
    assert.ok(url.includes('LPA%3A1%24'));
  });
  it('round-trips through parseDeepLink', () => {
    const lpa = 'LPA:1$carrier.example.com$ABC12-DEF34-GHI56';
    const url = generateDeepLink(lpa, 'https://example.com');
    const search = '?' + url.split('?')[1];
    assert.equal(parseDeepLink(search), lpa);
  });
});

describe('parseDeepLink', () => {
  it('extracts lpa parameter', () => {
    const search = '?lpa=LPA%3A1%24carrier.example.com%24ABC12-DEF34';
    assert.equal(parseDeepLink(search), 'LPA:1$carrier.example.com$ABC12-DEF34');
  });
  it('returns null when lpa param absent', () => {
    assert.equal(parseDeepLink('?foo=bar'), null);
    assert.equal(parseDeepLink(''), null);
  });
});
