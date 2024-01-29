import { isAuthenticatedAssessmentData } from 'types/course/assessment/assessments';
import { getIdFromUnknown } from 'utilities';

import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';

import { fetchAssessment, fetchAssessments } from './operations/assessments';

const getTabTitle = async (
  categoryId?: number,
  tabId?: number,
): Promise<CrumbPath> => {
  const { display } = await fetchAssessments(categoryId, tabId);

  return {
    activePath: display.tabUrl.split('&tab')[0],
    content: {
      url: display.tabUrl,
      title: display.tabTitle,
    },
  };
};

const getTabTitleFromAssessmentId = async (
  assessmentId: number,
): Promise<CrumbPath> => {
  const data = await fetchAssessment(assessmentId);

  return {
    activePath: data.tabUrl.split('&tab')[0],
    content: {
      url: data.tabUrl,
      title: data.tabTitle,
    },
  };
};

/**
 * Gets the crumb data and active path for assessments pages,
 * except Submissions and Skills.
 */
export const assessmentsHandle: DataHandle = (match, location) => {
  if (location.pathname.includes('assessments/s')) return null;

  let promise: Promise<CrumbPath>;

  const assessmentId = getIdFromUnknown(match.params?.assessmentId);
  if (assessmentId) {
    promise = getTabTitleFromAssessmentId(assessmentId);
  } else {
    const searchParams = new URLSearchParams(location.search);
    const categoryId = getIdFromUnknown(searchParams.get('category'));
    const tabId = getIdFromUnknown(searchParams.get('tab'));
    promise = getTabTitle(categoryId, tabId);
  }

  return { shouldRevalidate: true, getData: () => promise };
};

export const assessmentHandle: DataHandle = (match) => {
  const assessmentId = getIdFromUnknown(match.params?.assessmentId);
  if (!assessmentId) throw new Error(`Invalid assessment id: ${assessmentId}`);

  return {
    getData: async (): Promise<string> => {
      const data = await fetchAssessment(assessmentId);
      return data.title;
    },
  };
};

export const questionHandle: DataHandle = (match, location) => {
  if (location.pathname.endsWith('new')) return null;

  const assessmentId = getIdFromUnknown(match.params?.assessmentId);
  if (!assessmentId) throw new Error(`Invalid assessment id: ${assessmentId}`);

  return {
    getData: async (): Promise<string | null> => {
      const data = await fetchAssessment(assessmentId);
      if (!isAuthenticatedAssessmentData(data)) return null;

      const question = data.questions?.find(
        ({ editUrl }) => editUrl === location.pathname,
      );

      if (!question) return null;

      return question.title
        ? `${question.defaultTitle}: ${question.title}`
        : question.defaultTitle;
    },
  };
};
