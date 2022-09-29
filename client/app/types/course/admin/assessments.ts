export interface AssessmentSettingsData {
  showPublicTestCasesOutput: boolean;
  showStdoutAndStderr: boolean;
  allowRandomization: boolean;
  allowMrqOptionsRandomization: boolean;
  categories: AssessmentCategory[];
}

export interface AssessmentCategory {
  id: number;
  title: string;
  weight: number;
  tabs: AssessmentTab[];
  assessmentsCount: number;
  assessmentsIds: number[];
  topAssessmentsTitles: string[];
}

export interface AssessmentTab {
  id: number;
  title: string;
  weight: number;
  categoryId: AssessmentCategory['id'];
  assessmentsCount: number;
  assessmentsIds: number[];
  topAssessmentsTitles: string[];
  fullTabTitle?: string;
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
