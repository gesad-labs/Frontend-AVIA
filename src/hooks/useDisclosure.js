import { useState, useCallback } from 'react';

/**
 * useDisclosure — controls open/close state for modals and drawers.
 *
 * @returns {{ isOpen, open, close, toggle }}
 */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const open   = useCallback(() => setIsOpen(true),  []);
  const close  = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((s) => !s), []);
  return { isOpen, open, close, toggle };
}
