import {
  ProgrammingLanguageData,
  ProgrammingUpgradeData,
  ProgrammingUpgradeQuestionData,
} from 'types/course/programmingUpgrade';

import { IN_PROGRESS_STATES } from './constants';

/**
 * The chip states, in the order the backend sorts them by. `null` is a row with no chip — a question
 * already on the newest version of its language.
 */
export type UpgradeStatus =
  | 'importFailed'
  | 'pending'
  | 'deprecated'
  | 'upgradable'
  | 'ok'
  | null;

export const isInProgress = (upgrade?: ProgrammingUpgradeData): boolean =>
  Boolean(
    upgrade && IN_PROGRESS_STATES.includes(upgrade.workflowState as never),
  );

/**
 * The single source of truth for a row's status, shared by the chip and the Status column filter so
 * the two cannot disagree.
 *
 * The upgrade row's state takes precedence over the language-derived state: a failed upgrade on a
 * question whose language is also deprecated must read as "Import Failed", or the actionable state is
 * hidden behind the passive one. This mirrors the backend's own ordering.
 */
export const statusOf = (
  question: ProgrammingUpgradeQuestionData,
  language?: ProgrammingLanguageData,
): UpgradeStatus => {
  const state = question.upgrade?.workflowState;

  if (isInProgress(question.upgrade)) return 'pending';
  if (state === 'failed') return 'importFailed';
  if (state === 'completed') return 'ok';
  if (language?.deprecated) return 'deprecated';
  if (question.upgradable) return 'upgradable';

  return null;
};
