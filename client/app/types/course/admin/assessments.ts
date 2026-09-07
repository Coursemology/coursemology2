export interface AssessmentSettingsData {
  showPublicTestCasesOutput: boolean;
  showStdoutAndStderr: boolean;
  allowRandomization: boolean;
  allowMrqOptionsRandomization: boolean;
  categories: AssessmentCategory[];
  canCreateCategories: boolean;
  maxProgrammingTimeLimit?: number;
  rubricGradingPromptEnabled: boolean;
  rubricGradingPrompt?: string;
  // AI model configuration, restricted to instance and system admins. When the viewer may not manage it the
  // flag is false and the fields below are absent from the payload entirely.
  canManageAiGradingSettings: boolean;
  availableGradingModels?: string[];
  rubricGradingModel?: string;
  rubricGradingModelOptionsEnabled?: boolean;
  rubricGradingModelOptions?: string;
  rubricGradingSystemPromptEnabled?: boolean;
  rubricGradingSystemPrompt?: string;
  // The built-in prompt an override replaces, and the placeholders both are interpolated with.
  defaultGradingSystemPrompt?: string;
  gradingSystemPromptVariables?: string[];
}

export interface AssessmentCategory {
  id: number;
  title: string;
  weight: number;
  tabs: AssessmentTab[];
  assessmentsCount: number;
  topAssessmentTitles: string[];
  canCreateTabs: boolean;
  canDeleteCategory: boolean;
}

export interface AssessmentTab {
  id: number;
  title: string;
  weight: number;
  categoryId: AssessmentCategory['id'];
  assessmentsCount: number;
  topAssessmentTitles: string[];
  fullTabTitle?: string;
  canDeleteTab?: boolean;
}

export interface MovedAssessmentsResult {
  moved_assessments_count: number;
}

export interface MovedTabsResult {
  moved_tabs_count: number;
}

export interface MoveAssessmentsPostData {
  source_tab_id: AssessmentTab['id'];
  destination_tab_id: AssessmentTab['id'];
}

export interface MoveTabsPostData {
  source_category_id: AssessmentCategory['id'];
  destination_category_id: AssessmentCategory['id'];
}

export interface AssessmentTabInCategoryPostData {
  id: AssessmentTab['id'];
  title: AssessmentTab['title'];
  weight: AssessmentTab['weight'];
  category_id: AssessmentCategory['id'];
}

export interface AssessmentSettingsPostData {
  course: {
    show_public_test_cases_output?: AssessmentSettingsData['showPublicTestCasesOutput'];
    show_stdout_and_stderr?: AssessmentSettingsData['showStdoutAndStderr'];
    allow_randomization?: AssessmentSettingsData['allowRandomization'];
    allow_mrq_options_randomization?: AssessmentSettingsData['allowMrqOptionsRandomization'];
    programming_max_time_limit: AssessmentSettingsData['maxProgrammingTimeLimit'];
    rubric_grading_prompt_enabled?: AssessmentSettingsData['rubricGradingPromptEnabled'];
    rubric_grading_prompt?: AssessmentSettingsData['rubricGradingPrompt'];
    // Only sent when the viewer may manage them; the server drops them from the permitted params otherwise.
    rubric_grading_model?: AssessmentSettingsData['rubricGradingModel'];
    rubric_grading_model_options_enabled?: AssessmentSettingsData['rubricGradingModelOptionsEnabled'];
    rubric_grading_model_options?: AssessmentSettingsData['rubricGradingModelOptions'];
    rubric_grading_system_prompt_enabled?: AssessmentSettingsData['rubricGradingSystemPromptEnabled'];
    rubric_grading_system_prompt?: AssessmentSettingsData['rubricGradingSystemPrompt'];
    assessment_categories_attributes?: {
      id: AssessmentCategory['id'];
      title: AssessmentCategory['title'];
      weight: AssessmentCategory['weight'];
      tabs_attributes: AssessmentTabInCategoryPostData[];
    }[];
  };
}

export interface AssessmentCategoryPostData {
  category: {
    title: AssessmentCategory['title'];
    weight: AssessmentCategory['weight'];
  };
}

export interface AssessmentTabPostData {
  tab: {
    title: AssessmentTab['title'];
    weight: AssessmentTab['weight'];
  };
}
