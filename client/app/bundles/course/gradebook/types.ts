import type {
  AssessmentData,
  StudentRow,
  TabData,
} from 'types/course/gradebook';

export type {
  AssessmentData,
  GradebookData,
  StudentRow,
  TabData,
} from 'types/course/gradebook';

export const SAVE_GRADEBOOK = 'course/gradebook/SAVE_GRADEBOOK';

export interface SaveGradebookAction {
  type: typeof SAVE_GRADEBOOK;
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentRow[];
}

export type GradebookActionType = SaveGradebookAction;

export interface GradebookState {
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentRow[];
}
