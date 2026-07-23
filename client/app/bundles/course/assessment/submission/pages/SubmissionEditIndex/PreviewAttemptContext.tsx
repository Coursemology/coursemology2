import { createContext } from 'react';

export interface PreviewAttemptContextValue {
  isPreview: boolean;
  attemptId?: number;
  listingId?: number;
}

/**
 * Tells the reused submission edit page it is rendering a marketplace preview attempt.
 * Default `isPreview: false` so the shared page renders normally for real submissions
 * (no provider on the real submission route).
 */
const PreviewAttemptContext = createContext<PreviewAttemptContextValue>({
  isPreview: false,
});

export default PreviewAttemptContext;
