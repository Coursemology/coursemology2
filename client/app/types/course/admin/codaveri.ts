export type ProgrammingEvaluator = 'default' | 'codaveri';

export interface ProgrammingQuestion {
  id: number;
  title: string;
  isCodaveri: boolean;
  assessmentId: number;
}
export interface AssessmentProgrammingQuestionsData {
  id: number;
  title: string;
  programmingQuestions: ProgrammingQuestion[];
}
export interface CodaveriSettingsData {
  isOnlyITSP: boolean;
  feedbackWorkflow: 'none' | 'draft' | 'publish';
  assessments: AssessmentProgrammingQuestionsData[];
}

export interface CodaveriSettingsEntity {
  isOnlyITSP: 'itsp' | 'default';
  feedbackWorkflow: CodaveriSettingsData['feedbackWorkflow'];
  assessments: AssessmentProgrammingQuestionsData[];
}

export interface CodaveriSettingsPatchData {
  settings_codaveri_component: {
    is_only_itsp: CodaveriSettingsData['isOnlyITSP'];
    feedback_workflow: CodaveriSettingsData['feedbackWorkflow'];
  };
}

export interface CodaveriSwitchQnsEvaluatorPatchData {
  programming_evaluator: ProgrammingEvaluator;
}
