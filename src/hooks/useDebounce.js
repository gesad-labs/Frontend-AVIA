import { useState, useEffect } from 'react';

/**
 * useDebounce — delays updating a value until after `delay` ms of inactivity.
 * Used for search inputs (RF009).
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
