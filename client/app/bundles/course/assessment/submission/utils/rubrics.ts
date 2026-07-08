import { AnswerRubricGradeData } from 'types/course/assessment/question/rubric-based-responses';

// Sum of the selected criterion grades across the rubric categories (the "breakdown").
export const sumRubricBreakdown = (
  categoryGrades: Record<number, AnswerRubricGradeData>,
): number =>
  Object.values(categoryGrades).reduce(
    (sum, category) => sum + Number(category.grade ?? 0),
    0,
  );

// Moderation is the part of the answer's grade not explained by the criterion breakdown (a manual
// adjustment). It is FE-only -- derived from answer.grade and the breakdown, not stored as a selection.
export const moderationGradeOf = (
  categoryGrades: Record<number, AnswerRubricGradeData>,
  answerGrade: number,
): number => answerGrade - sumRubricBreakdown(categoryGrades);

// New total grade when the breakdown changes from `previous` to `next`, preserving the moderation delta
// already baked into `currentGrade` (currentGrade = previous breakdown + moderation). Clamped to [0, max].
export const gradeWithModerationPreserved = (
  previous: Record<number, AnswerRubricGradeData>,
  next: Record<number, AnswerRubricGradeData>,
  currentGrade: number,
  maximumGrade: number,
): number => {
  const delta = sumRubricBreakdown(next) - sumRubricBreakdown(previous);
  return Math.max(0, Math.min(currentGrade + delta, maximumGrade));
};

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
