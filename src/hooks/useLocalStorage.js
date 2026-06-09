import { useState, useEffect } from 'react';

/**
 * useLocalStorage — syncs state with localStorage.
 *
 * @param {string} key - localStorage key
 * @param {*}      initialValue
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { /* quota exceeded or private mode */ }
  }, [key, value]);

  return [value, setValue];
}
