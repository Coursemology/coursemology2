import {
  RubricAnswerData,
  RubricAnswerEvaluationData,
  RubricCategoryData,
  RubricDataWithEvaluations,
  RubricMockAnswerEvaluationData,
} from 'types/course/rubrics';

import { AnswerTableEntry } from './types';

export function answerDataToTableEntry(
  answer: RubricAnswerData,
  isMock: boolean,
  evaluation?:
    | RubricAnswerEvaluationData
    | RubricMockAnswerEvaluationData
    | Record<string, never>,
  compareRubrics?: RubricDataWithEvaluations[],
): AnswerTableEntry {
  const isEvaluating = Boolean(evaluation?.jobUrl);
  const data: AnswerTableEntry = {
    id: answer.id,
    title: answer.title,
    answerText: answer.answerText,
    isMock,
    isEvaluating,
  };
  if (evaluation && !isEvaluating) {
    const grades: Record<number, number> = {};
    let totalGrade = 0;
    if (evaluation?.selections?.length) {
      evaluation.selections.forEach((selection) => {
        grades[selection.categoryId] = selection.grade;
        totalGrade += selection.grade;
      });

      data.evaluation = {
        grades,
        feedback: evaluation?.feedback ?? '',
        totalGrade,
      };
    }
  }

  if (compareRubrics) {
    data.compareGrades = compareRubrics.map(
      (rubric: RubricDataWithEvaluations) => {
        const selections = isMock
          ? rubric.mockAnswerEvaluations[answer.id]?.selections ?? []
          : rubric.answerEvaluations[answer.id]?.selections ?? [];

        return rubric.categories.map((category) => {
          const selection = selections.find(
            (s) => s.categoryId === category.id,
          );
          return selection?.grade;
        });
      },
    );
  }

  return data;
}

export const answerCategoryGradeGetter =
  (category: RubricCategoryData) =>
  (answer: AnswerTableEntry): number | undefined =>
    answer.evaluation?.grades?.[category.id];

export const answerTotalGradeGetter = (
  answer: AnswerTableEntry,
): number | undefined => answer.evaluation?.totalGrade;

export const answerSortFn =
  (answerGetter: (answer: AnswerTableEntry) => number | undefined) =>
  (answerA: AnswerTableEntry, answerB: AnswerTableEntry): number =>
    (answerGetter(answerA) ?? -1) - (answerGetter(answerB) ?? -1);

export const isAnswerAlreadyEvaluated = (answer: AnswerTableEntry): boolean =>
  Boolean(answer.evaluation) && !answer.isEvaluating;
