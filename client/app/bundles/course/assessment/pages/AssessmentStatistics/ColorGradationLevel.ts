const lowerGradeBackgroundColorClassName = {
  0: 'bg-red-50',
  100: 'bg-red-100',
  200: 'bg-red-200',
  300: 'bg-red-300',
  400: 'bg-red-400',
  500: 'bg-red-500',
};

const higherGradeBackgroundColorClassName = {
  0: 'bg-green-50',
  100: 'bg-green-100',
  200: 'bg-green-200',
  300: 'bg-green-300',
  400: 'bg-green-400',
  500: 'bg-green-500',
};

// calculate the gradient of the color in each grade cell
// 1. we compute the distance between the grade and the mid-grade (half the maximum)
// 2. then, we compute the fraction of it -> range becomes [0,1]
// 3. then we convert it into range [0,3] so that the shades will become [100, 200, 300]
const calculateColorGradientLevel = (
  grade: number,
  halfMaxGrade: number,
): number => {
  return Math.round((Math.abs(grade - halfMaxGrade) / halfMaxGrade) * 5) * 100;
};

export const getClassNameForMarkCell = (
  grade: number,
  maxGrade: number,
): string => {
  const gradientLevel = calculateColorGradientLevel(grade, maxGrade / 2);
  return grade >= maxGrade / 2
    ? `${higherGradeBackgroundColorClassName[gradientLevel]} p-[1rem]`
    : `${lowerGradeBackgroundColorClassName[gradientLevel]} p-[1rem]`;
};
