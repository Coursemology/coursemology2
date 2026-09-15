import { JobCompleted, JobErrored, JobSubmitted } from 'types/jobs';

export type ProgrammingUpgradeWorkflowState =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'reverting';

export interface ProgrammingLanguageData {
  id: number;
  name: string;
  deprecated: boolean;
}

export interface ProgrammingUpgradeData {
  questionId: number;
  workflowState: ProgrammingUpgradeWorkflowState;
  oldLanguageId: number;
  newLanguageId: number;
  updatedAt: string | null;
  job?: JobSubmitted | JobCompleted | JobErrored;
}

export interface ProgrammingUpgradeQuestionData {
  id: number;
  title: string | null;
  editUrl?: string;
  assessment?: {
    id: number;
    title: string;
    url: string;
  };
  submissionCount: number;
  /** Languages are sent once per response and referenced by id. */
  languageId: number;
  /** Valid target versions, newest first. Empty when there is nowhere to move to. */
  upgradeTargetIds: number[];
  upgradable: boolean;
  upgrade?: ProgrammingUpgradeData;
}

export interface ProgrammingUpgradeListData {
  questions: ProgrammingUpgradeQuestionData[];
  languages: ProgrammingLanguageData[];
  rowCount: number;
}

export interface ProgrammingUpgradeResponseData {
  upgrades: ProgrammingUpgradeData[];
  /** Question id => why that question was not upgraded. */
  rejected: Record<string, string>;
}
