import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import {
  AssessmentCategory,
  AssessmentCategoryPostData,
  AssessmentSettingsData,
  AssessmentSettingsPostData,
  AssessmentTab,
  AssessmentTabInCategoryPostData,
  AssessmentTabPostData,
} from 'types/course/admin/assessments';

type Data = Promise<AssessmentSettingsData>;
type ProbableData = Promise<AssessmentSettingsData | undefined>;

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
): ProbableData => {
  const categoriesHash = rearrangeCategoriesAndTabs(data.categories);

  const adaptedData: AssessmentSettingsPostData = {
    course: {
      show_public_test_cases_output: data.showPublicTestCasesOutput,
      show_stdout_and_stderr: data.showStdoutAndStderr,
      allow_randomization: data.allowRandomization,
      allow_mrq_options_randomization: data.allowMrqOptionsRandomization,
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
    if (error instanceof AxiosError)
      throw new Error(error.response?.data.errors);

    return undefined;
  }
};

export const fetchAssessmentsSettings = async (): Data => {
  const response = await CourseAPI.admin.assessments.index();
  return response.data;
};

export const deleteCategory = async (
  id: AssessmentCategory['id'],
): ProbableData => {
  try {
    const response = await CourseAPI.admin.assessments.deleteCategory(id);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data.errors);

    return undefined;
  }
};

export const deleteTabInCategory = async (
  id: AssessmentCategory['id'],
  tabId: AssessmentTab['id'],
): ProbableData => {
  try {
    const response = await CourseAPI.admin.assessments.deleteTabInCategory(
      id,
      tabId,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data.errors);

    return undefined;
  }
};

export const createCategory = async (
  title: AssessmentCategory['title'],
  weight: AssessmentCategory['weight'],
): ProbableData => {
  const adaptedData: AssessmentCategoryPostData = {
    category: { title, weight },
  };

  try {
    const response = await CourseAPI.admin.assessments.createCategory(
      adaptedData,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data.errors);

    return undefined;
  }
};

export const createTabInCategory = async (
  id: AssessmentCategory['id'],
  title: AssessmentTab['title'],
  weight: AssessmentTab['weight'],
): ProbableData => {
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
    if (error instanceof AxiosError)
      throw new Error(error.response?.data.errors);

    return undefined;
  }
};

export const moveAssessmentsToTab = (
  assessmentIds: number[],
  tabId: AssessmentTab['id'],
): Promise<unknown[]> => {
  const promises = assessmentIds.map((id) =>
    CourseAPI.assessment.assessments.update(id, {
      assessment: { tab_id: tabId },
    }),
  );

  return Promise.all(promises);
};
