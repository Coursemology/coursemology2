import { AxiosError } from 'axios';
import {
  AssessmentCategory,
  AssessmentCategoryPostData,
  AssessmentSettingsData,
  AssessmentSettingsPostData,
  AssessmentTab,
  AssessmentTabInCategoryPostData,
  AssessmentTabPostData,
  MoveAssessmentsPostData,
  MoveTabsPostData,
} from 'types/course/admin/assessments';

import CourseAPI from 'api/course';

type Data = Promise<AssessmentSettingsData>;

type CategoriesHash = Record<
  AssessmentCategory['id'],
  AssessmentTabInCategoryPostData[]
>;

const rearrangeCategoriesAndTabs = (
  categories: AssessmentCategory[],
): CategoriesHash => {
  const categoriesHash: CategoriesHash = {};

  categories.forEach((category) => {
    category.tabs.forEach((tab) => {
      if (!categoriesHash[tab.categoryId]) categoriesHash[tab.categoryId] = [];
      categoriesHash[tab.categoryId].push({
        id: tab.id,
        title: tab.title,
        weight: tab.weight,
        category_id: category.id,
      });
    });
  });

  return categoriesHash;
};

export const updateAssessmentSettings = async (
  data: AssessmentSettingsData,
): Data => {
  const categoriesHash = rearrangeCategoriesAndTabs(data.categories);

  const adaptedData: AssessmentSettingsPostData = {
    course: {
      show_public_test_cases_output: data.showPublicTestCasesOutput,
      show_stdout_and_stderr: data.showStdoutAndStderr,
      allow_randomization: data.allowRandomization,
      allow_mrq_options_randomization: data.allowMrqOptionsRandomization,
      programming_max_time_limit: data.maxProgrammingTimeLimit,
      assessment_categories_attributes: data.categories.map((category) => ({
        id: category.id,
        title: category.title,
        weight: category.weight,
        tabs_attributes: categoriesHash[category.id],
      })),
    },
  };

  try {
    const response = await CourseAPI.admin.assessments.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const fetchAssessmentsSettings = async (): Data => {
  const response = await CourseAPI.admin.assessments.index();
  return response.data;
};

export const deleteCategory = async (id: AssessmentCategory['id']): Data => {
  try {
    const response = await CourseAPI.admin.assessments.deleteCategory(id);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const deleteTabInCategory = async (
  id: AssessmentCategory['id'],
  tabId: AssessmentTab['id'],
): Data => {
  try {
    const response = await CourseAPI.admin.assessments.deleteTabInCategory(
      id,
      tabId,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const createCategory = async (
  title: AssessmentCategory['title'],
  weight: AssessmentCategory['weight'],
): Data => {
  const adaptedData: AssessmentCategoryPostData = {
    category: { title, weight },
  };

  try {
    const response = await CourseAPI.admin.assessments.createCategory(
      adaptedData,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const createTabInCategory = async (
  id: AssessmentCategory['id'],
  title: AssessmentTab['title'],
  weight: AssessmentTab['weight'],
): Data => {
  const adaptedData: AssessmentTabPostData = {
    tab: { title, weight },
  };

  try {
    const response = await CourseAPI.admin.assessments.createTabInCategory(
      id,
      adaptedData,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const moveAssessments = async (
  sourceTabId: AssessmentTab['id'],
  destinationTabId: AssessmentTab['id'],
): Promise<number> => {
  const adaptedData: MoveAssessmentsPostData = {
    source_tab_id: sourceTabId,
    destination_tab_id: destinationTabId,
  };

  try {
    const response = await CourseAPI.admin.assessments.moveAssessments(
      adaptedData,
    );
    return response.data.moved_assessments_count;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const moveTabs = async (
  sourceCategoryId: AssessmentCategory['id'],
  destinationCategoryId: AssessmentCategory['id'],
): Promise<number> => {
  const adaptedData: MoveTabsPostData = {
    source_category_id: sourceCategoryId,
    destination_category_id: destinationCategoryId,
  };

  try {
    const response = await CourseAPI.admin.assessments.moveTabs(adaptedData);
    return response.data.moved_tabs_count;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
