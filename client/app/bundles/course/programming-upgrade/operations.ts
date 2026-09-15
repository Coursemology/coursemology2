import {
  ProgrammingUpgradeListData,
  ProgrammingUpgradeResponseData,
} from 'types/course/programmingUpgrade';

import CourseAPI from 'api/course';

/**
 * A course can hold well over a thousand programming questions, so the index is paginated server
 * side. The table paginates client side over whatever it is given; widening this to true server-driven
 * paging is a follow-up.
 */
const PAGE_LENGTH = 500;

export const fetchQuestions = async (
  pageNum = 1,
): Promise<ProgrammingUpgradeListData> => {
  const response = await CourseAPI.programmingUpgrade.fetchQuestions(
    pageNum,
    PAGE_LENGTH,
  );

  return response.data;
};

export const upgradeQuestions = async (
  upgrades: Record<number, number>,
): Promise<ProgrammingUpgradeResponseData> => {
  const response = await CourseAPI.programmingUpgrade.upgrade(upgrades);

  return response.data;
};

export const revertQuestion = async (
  questionId: number,
): Promise<ProgrammingUpgradeResponseData> => {
  const response = await CourseAPI.programmingUpgrade.revert(questionId);

  return response.data;
};

export const fetchUpgrades = async (
  questionIds: number[],
): Promise<ProgrammingUpgradeResponseData> => {
  const response =
    await CourseAPI.programmingUpgrade.fetchUpgrades(questionIds);

  return response.data;
};
