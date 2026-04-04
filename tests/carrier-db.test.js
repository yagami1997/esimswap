import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lookup } from '../src/features/carrier-db.js';

describe('lookup', () => {
  it('returns carrier for exact known domain', () => {
    const result = lookup('lpa.fi.google.com');
    assert.ok(result);
    assert.equal(result.name, 'Google Fi');
    assert.equal(result.region, 'US');
  });
  it('returns carrier for subdomain of known suffix', () => {
    const result = lookup('consumer.idemia.io');
    assert.ok(result);
    assert.ok(result.name.length > 0);
  });
  it('returns null for unknown domain', () => {
    assert.equal(lookup('unknown.carrier.xyz'), null);
  });
  it('returns null for empty input', () => {
    assert.equal(lookup(''), null);
    assert.equal(lookup(null), null);
  });
  it('is case-insensitive', () => {
    const r1 = lookup('LPA.FI.GOOGLE.COM');
    const r2 = lookup('lpa.fi.google.com');
    assert.deepEqual(r1, r2);
  });
});
