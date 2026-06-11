import { useState } from 'react';

interface DismissibleOnce {
  dismissed: boolean;
  dismiss: () => void;
}

/**
 * Tracks whether a one-time, dismissable UI element (e.g. an onboarding hint) has
 * been dismissed, persisting the choice in localStorage so it never reappears.
 *
 * The key is namespaced by userId (`${userId}:${key}`) when provided, so two users
 * on the same device don't share dismissals. Persistence degrades to in-session-only
 * state if userId is absent or if localStorage is unavailable (private browsing /
 * quota), and never throws.
 */
const useDismissibleOnce = (
  key: string,
  userId: number | undefined,
): DismissibleOnce => {
  const storageKey =
    userId !== undefined && userId > 0 ? `${userId}:${key}` : undefined;

  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (!storageKey) return false;
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  const dismiss = (): void => {
    setDismissed(true);
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // setItem throws QuotaExceededError (storage full) or SecurityError (private
      // browsing on some browsers). Dismissal is best-effort; the current session is
      // unaffected if it fails — the hint just reappears on the next visit.
    }
  };

  return { dismissed, dismiss };
};

export default useDismissibleOnce;
