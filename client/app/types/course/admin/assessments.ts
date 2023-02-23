export interface AssessmentSettingsData {
  showPublicTestCasesOutput: boolean;
  showStdoutAndStderr: boolean;
  allowRandomization: boolean;
  allowMrqOptionsRandomization: boolean;
  categories: AssessmentCategory[];
  canCreateCategories: boolean;
  maxProgrammingTimeLimit?: number;
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
