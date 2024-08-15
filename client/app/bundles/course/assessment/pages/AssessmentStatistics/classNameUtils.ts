import { green } from 'theme/colors';
import { AttemptInfo } from 'types/course/statistics/assessmentStatistics';

const redBackgroundColorClassName = {
  0: 'bg-red-50',
  100: 'bg-red-100',
  200: 'bg-red-200',
  300: 'bg-red-300',
  400: 'bg-red-400',
  500: 'bg-red-500',
};

const greenBackgroundColorClassName = {
  0: 'bg-green-50',
  100: 'bg-green-100',
  200: 'bg-green-200',
  300: 'bg-green-300',
  400: 'bg-green-400',
  500: 'bg-green-500',
};

// 1. we compute the distance between the value and the halfMaxValue
// 2. then, we compute the fraction of it -> range becomes [0,1]
// 3. then we convert it into range [0,5] so that the shades will become [100, 200, 300, 400, 500]
const calculateTwoSidedColorGradientLevel = (
  value: number,
  halfMaxValue: number,
): number => {
  return Math.round((Math.abs(value - halfMaxValue) / halfMaxValue) * 5) * 100;
};

const calculateOneSidedColorGradientLevel = (
  value: number,
  maxValue: number,
): number => {
  return Math.round((value / maxValue) * 5) * 100;
};

// for marks per question cell, the difference in color means the following:
// 1. Green : the grade obtained is at least half the maximum possible grade
// 2. Red : the grade obtained is less than half the maximum possible grade
export const getClassNameForMarkCell = (
  grade: number,
  maxGrade: number,
): string => {
  const gradientLevel = calculateTwoSidedColorGradientLevel(
    grade,
    maxGrade / 2,
  );
  return grade >= maxGrade / 2
    ? `${greenBackgroundColorClassName[gradientLevel]} p-[1rem]`
    : `${redBackgroundColorClassName[gradientLevel]} p-[1rem]`;
};

// for attempt count cell, the difference in color means the following:
// 1. Gray : the final attempt by user has no judgment result (whether it's correct or not)
// 2. Green : the final attempt by user is rendered correct
// 3. Red : the final attempt by user is rendered wrong / incorrect
export const getClassNameForAttemptCountCell = (
  attempt: AttemptInfo,
): string => {
  if (!attempt.isAutograded || attempt.correct === null) {
    return 'bg-gray-300 p-[1rem]';
  }

  return attempt.correct ? 'bg-green-300 p-[1rem]' : 'bg-red-300 p-[1rem]';
};

export const getClassnameForLiveFeedbackCell = (
  count: number,
  maxCount: number,
): string => {
  const gradientLevel = calculateOneSidedColorGradientLevel(count, maxCount);
  return `${redBackgroundColorClassName[gradientLevel]} p-[1rem]`;
};
