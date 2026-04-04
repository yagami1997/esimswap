/**
 * eSIM operation history — persisted in localStorage.
 * Designed with an injectable storage interface for testability.
 */

const STORAGE_KEY = 'esimswap_history';
const MAX_ENTRIES = 20;

/**
 * @typedef {{
 *   id: string,
 *   timestamp: number,
 *   action: 'generate' | 'scan',
 *   smdpAddress: string,
 *   activationCode: string,
 *   confirmationCode: string,
 *   carrierName: string,
 *   lpaString: string
 * }} HistoryEntry
 */

/**
 * Create a history manager backed by the given storage.
 * @param {Storage} storage - localStorage or compatible mock
 */
export function createHistory(storage) {
  function getAll() {
    try {
      return JSON.parse(storage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function save(entries) {
    storage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  /**
   * Add a new history entry (most recent first, capped at MAX_ENTRIES).
   * @param {Omit<HistoryEntry, 'id' | 'timestamp'>} entry
   * @returns {HistoryEntry}
   */
  function add(entry) {
    const newEntry = {
      ...entry,
      id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
      timestamp: Date.now(),
    };
    const entries = [newEntry, ...getAll()].slice(0, MAX_ENTRIES);
    save(entries);
    return newEntry;
  }

  /**
   * Remove a single entry by id.
   * @param {string} id
   */
  function remove(id) {
    save(getAll().filter(e => e.id !== id));
  }

  /** Remove all history entries. */
  function clear() {
    storage.removeItem(STORAGE_KEY);
  }

  return { getAll, add, remove, clear };
}

/** Singleton backed by window.localStorage (used in browser). */
export const History = createHistory(
  typeof localStorage !== 'undefined' ? localStorage : {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }
);
