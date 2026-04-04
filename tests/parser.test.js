import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parse, parseSeparated, generateLPA, validateSMDP, validateActivationCode, repair } from '../src/core/parser.js';

describe('validateSMDP', () => {
  it('accepts valid domains', () => {
    assert.equal(validateSMDP('carrier.example.com'), true);
    assert.equal(validateSMDP('t-mobile.idemia.io'), true);
    assert.equal(validateSMDP('lpa.fi.google.com'), true);
  });
  it('rejects invalid domains', () => {
    assert.equal(validateSMDP(''), false);
    assert.equal(validateSMDP('notadomain'), false);
    assert.equal(validateSMDP(null), false);
  });
});

describe('validateActivationCode', () => {
  it('accepts valid codes', () => {
    assert.equal(validateActivationCode('ABC12-DEF34-GHI56-JKL78'), true);
    assert.equal(validateActivationCode('1BCH0T6TKQ'), true);
  });
  it('rejects invalid codes', () => {
    assert.equal(validateActivationCode(''), false);
    assert.equal(validateActivationCode('short'), false);
    assert.equal(validateActivationCode(null), false);
  });
});

describe('generateLPA', () => {
  it('generates without confirmation code', () => {
    assert.equal(
      generateLPA({ smdpAddress: 'carrier.example.com', activationCode: 'ABC12-DEF34', confirmationCode: '' }),
      'LPA:1$carrier.example.com$ABC12-DEF34'
    );
  });
  it('generates with confirmation code', () => {
    assert.equal(
      generateLPA({ smdpAddress: 'carrier.example.com', activationCode: 'ABC12-DEF34', confirmationCode: 'PASS1' }),
      'LPA:1$carrier.example.com$ABC12-DEF34$PASS1'
    );
  });
});

describe('parse', () => {
  it('parses LPA: prefix format', () => {
    const result = parse('LPA:1$carrier.example.com$ABC12-DEF34-GHI56');
    assert.equal(result.success, true);
    assert.equal(result.data.smdpAddress, 'carrier.example.com');
    assert.equal(result.data.activationCode, 'ABC12-DEF34-GHI56');
    assert.equal(result.data.confirmationCode, '');
  });
  it('parses 1$ prefix format', () => {
    const result = parse('1$carrier.example.com$ABC12-DEF34-GHI56');
    assert.equal(result.success, true);
    assert.equal(result.data.smdpAddress, 'carrier.example.com');
  });
  it('parses smdp$activation format', () => {
    const result = parse('carrier.example.com$ABC12-DEF34-GHI56');
    assert.equal(result.success, true);
    assert.equal(result.data.smdpAddress, 'carrier.example.com');
  });
  it('parses with confirmation code', () => {
    const result = parse('LPA:1$carrier.example.com$ABC12-DEF34-GHI56$MYPASS');
    assert.equal(result.success, true);
    assert.equal(result.data.confirmationCode, 'MYPASS');
  });
  it('returns lpaString in result', () => {
    const result = parse('carrier.example.com$ABC12-DEF34-GHI56');
    assert.equal(result.data.lpaString, 'LPA:1$carrier.example.com$ABC12-DEF34-GHI56');
  });
  it('rejects empty input', () => {
    assert.equal(parse('').success, false);
    assert.equal(parse('   ').success, false);
  });
  it('rejects non-eSIM input', () => {
    assert.equal(parse('hello world').success, false);
  });
  it('is case-insensitive for LPA: prefix', () => {
    const result = parse('lpa:1$carrier.example.com$ABC12-DEF34-GHI56');
    assert.equal(result.success, true);
  });
});

describe('parseSeparated', () => {
  it('parses from separate fields', () => {
    const result = parseSeparated({
      smdpAddress: 'carrier.example.com',
      activationCode: 'ABC12-DEF34-GHI56',
      confirmationCode: ''
    });
    assert.equal(result.success, true);
    assert.equal(result.data.smdpAddress, 'carrier.example.com');
  });
});

describe('repair', () => {
  it('returns original if already valid', () => {
    const result = repair('LPA:1$carrier.example.com$ABC12-DEF34-GHI56');
    assert.equal(result.success, true);
    assert.equal(result.problem, null);
  });
  it('adds missing LPA: prefix', () => {
    const result = repair('1$carrier.example.com$ABC12-DEF34-GHI56');
    assert.equal(result.success, true);
    assert.match(result.fixed, /^LPA:/);
  });
  it('adds missing LPA: and version number', () => {
    const result = repair('carrier.example.com$ABC12-DEF34-GHI56');
    assert.equal(result.success, true);
    assert.equal(result.fixed, 'LPA:1$carrier.example.com$ABC12-DEF34-GHI56');
  });
  it('adds missing version number when LPA: exists', () => {
    const result = repair('LPA:carrier.example.com$ABC12-DEF34-GHI56');
    assert.equal(result.success, true);
    assert.match(result.fixed, /^LPA:1\$/);
  });
  it('reports failure for garbage input', () => {
    const result = repair('this is not esim data at all');
    assert.equal(result.success, false);
  });
});
