/** How often rows with an in-progress upgrade are re-read. */
export const UPGRADES_POLL_INTERVAL_MILLISECONDS = 5000;

/** Workflow states that mean an upgrade or revert is still running. */
export const IN_PROGRESS_STATES = ['pending', 'running', 'reverting'] as const;
