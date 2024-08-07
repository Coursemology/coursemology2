export type ProgrammingEvaluator = 'default' | 'codaveri';

export interface ProgrammingQuestion {
  id: number;
  editUrl: string;
  title: string;
  isCodaveri: boolean;
  assessmentId: number;
}
export interface AssessmentProgrammingQuestionsData {
  id: number;
  tabId: number;
  title: string;
  url: string;
  programmingQuestions: ProgrammingQuestion[];
}

export interface AssessmentTabData {
  id: number;
  categoryId: number;
  url: string;
  title: string;
}

export interface AssessmentCategoryData {
  id: number;
  url: string;
  title: string;
  weight: number;
}

export interface CodaveriSettingsData {
  isOnlyITSP: boolean;
  feedbackWorkflow: 'none' | 'draft' | 'publish';
  liveFeedbackEnabled: boolean;
  assessmentCategories: AssessmentCategoryData[];
  assessmentTabs: AssessmentTabData[];
  assessments: AssessmentProgrammingQuestionsData[];
}

export interface CodaveriSettingsEntity {
  isOnlyITSP: 'itsp' | 'default';
  feedbackWorkflow: CodaveriSettingsData['feedbackWorkflow'];
  liveFeedbackEnabled: boolean;
  assessmentCategories: AssessmentCategoryData[];
  assessmentTabs: AssessmentTabData[];
  assessments: AssessmentProgrammingQuestionsData[];
}

export interface CodaveriSettingsPatchData {
  settings_codaveri_component: {
    is_only_itsp: CodaveriSettingsData['isOnlyITSP'];
    feedback_workflow: CodaveriSettingsData['feedbackWorkflow'];
    live_feedback_enabled: CodaveriSettingsData['liveFeedbackEnabled'];
  };
}

export interface CodaveriSwitchQnsEvaluatorPatchData {
  update_evaluator: {
    assessment_ids: number[];
    programming_evaluator: ProgrammingEvaluator;
  };
}
