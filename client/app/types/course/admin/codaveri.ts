export type ProgrammingEvaluator = 'default' | 'codaveri';
export type CodaveriSettings = 'codaveri_evaluator' | 'live_feedback';

export interface ProgrammingQuestion {
  id: number;
  editUrl: string;
  title: string;
  isCodaveri: boolean;
  liveFeedbackEnabled: boolean;
  assessmentId: number;
}
export interface AssessmentProgrammingQuestionsData {
  id: number;
  tabId: number;
  categoryId: number;
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
  adminSettings?: {
    model: string;
    availableModels: string[];
    overrideSystemPrompt: boolean;
    systemPrompt: string;
  };
}

export interface CodaveriSettingsEntity {
  isOnlyITSP: 'itsp' | 'default';
  feedbackWorkflow: CodaveriSettingsData['feedbackWorkflow'];
  assessmentCategories: AssessmentCategoryData[];
  assessmentTabs: AssessmentTabData[];
  assessments: AssessmentProgrammingQuestionsData[];
  adminSettings?: {
    model?: string;
    useSystemPrompt: 'default' | 'override';
    systemPrompt?: string;
  };
}

export interface CodaveriSettingsPatchData {
  settings_codaveri_component: {
    feedback_workflow: CodaveriSettingsData['feedbackWorkflow'];
    model?: string;
    system_prompt?: string;
    override_system_prompt?: boolean;
  };
}

export interface CodaveriSwitchQnsEvaluatorPatchData {
  update_evaluator: {
    programming_question_ids: number[];
    programming_evaluator: ProgrammingEvaluator;
  };
}

export interface CodaveriSwitchQnsLiveFeedbackEnabledPatchData {
  update_live_feedback_enabled: {
    programming_question_ids: number[];
    live_feedback_enabled: boolean;
  };
}
