import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHistory } from '../src/features/history.js';

// In-memory mock for localStorage
function createMockStorage() {
  const store = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
  };
}

describe('history', () => {
  let history;
  let storage;

  beforeEach(() => {
    storage = createMockStorage();
    history = createHistory(storage);
  });

  it('starts empty', () => {
    assert.deepEqual(history.getAll(), []);
  });

  it('adds an entry with id and timestamp', () => {
    const entry = history.add({
      action: 'generate',
      smdpAddress: 'carrier.example.com',
      activationCode: 'ABC12-DEF34',
      confirmationCode: '',
      carrierName: 'Test Carrier',
      lpaString: 'LPA:1$carrier.example.com$ABC12-DEF34',
    });
    assert.ok(entry.id);
    assert.ok(entry.timestamp);
    assert.equal(history.getAll().length, 1);
  });

  it('prepends new entries (most recent first)', () => {
    history.add({ action: 'generate', smdpAddress: 'first.com', activationCode: 'AAAAAAAA', confirmationCode: '', carrierName: '', lpaString: '' });
    history.add({ action: 'generate', smdpAddress: 'second.com', activationCode: 'BBBBBBBB', confirmationCode: '', carrierName: '', lpaString: '' });
    assert.equal(history.getAll()[0].smdpAddress, 'second.com');
  });

  it('caps at 20 entries', () => {
    for (let i = 0; i < 25; i++) {
      history.add({ action: 'generate', smdpAddress: `carrier${i}.com`, activationCode: 'AAAAAAAA', confirmationCode: '', carrierName: '', lpaString: '' });
    }
    assert.equal(history.getAll().length, 20);
  });

  it('removes entry by id', () => {
    const entry = history.add({ action: 'generate', smdpAddress: 'carrier.example.com', activationCode: 'AAAAAAAA', confirmationCode: '', carrierName: '', lpaString: '' });
    history.remove(entry.id);
    assert.equal(history.getAll().length, 0);
  });

  it('clears all entries', () => {
    history.add({ action: 'generate', smdpAddress: 'carrier.example.com', activationCode: 'AAAAAAAA', confirmationCode: '', carrierName: '', lpaString: '' });
    history.add({ action: 'scan', smdpAddress: 'other.com', activationCode: 'BBBBBBBB', confirmationCode: '', carrierName: '', lpaString: '' });
    history.clear();
    assert.deepEqual(history.getAll(), []);
  });

  it('survives corrupt localStorage gracefully', () => {
    storage.setItem('esimswap_history', '{not valid json}');
    assert.doesNotThrow(() => history.getAll());
    assert.deepEqual(history.getAll(), []);
  });
});
