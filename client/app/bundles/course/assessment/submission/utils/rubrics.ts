import { AnswerRubricGradeData } from 'types/course/assessment/question/rubric-based-responses';

export const transformRubric = (
  newCategoryGrades: Record<number, AnswerRubricGradeData>,
): (Omit<AnswerRubricGradeData, 'name'> & { categoryId: number })[] => {
  return Object.keys(newCategoryGrades).map((catId) => ({
    id: newCategoryGrades[Number(catId)].id,
    categoryId: Number(catId),
    gradeId: newCategoryGrades[Number(catId)].gradeId,
    grade: newCategoryGrades[Number(catId)].grade,
    explanation: newCategoryGrades[Number(catId)].explanation,
  }));
};
