import { UseFormSetValue } from 'react-hook-form';
import { produce } from 'immer';
import { QuestionRubricGradeEntity } from 'types/course/assessment/question/rubric-based-responses';
import {
  RubricAnswerData,
  RubricDataWithEvaluations,
} from 'types/course/rubrics';

import { RubricState } from '../reducers/rubrics';

import { AnswerTableEntry } from './AnswerEvaluationsTable/types';
import { answerDataToTableEntry } from './AnswerEvaluationsTable/utils';
import { RubricCategoryEntity, RubricEditFormData } from './types';

export const generateNewElementId = (elements: { id: number }[]): number =>
  1 + Math.max(-1, ...elements.map((element) => element.id));

// Keeps only each student's latest (current) answer -- the same notion of "latest" the past-answers views
// use (the `current_answer` flag), rather than a recency heuristic.
export const currentAnswersOnly = <T extends { currentAnswer: boolean }>(
  items: T[],
): T[] => items.filter((item) => item.currentAnswer);

// Converts a saved rubric (store shape) into editable form values, seeding the per-row draft/delete
// flags. Used to initialise the edit draft and to render read-only previews of saved revisions.
export const rubricStateToFormData = (
  rubric?: RubricState,
): RubricEditFormData => ({
  categories: (rubric?.categories ?? []).map((category) => ({
    ...category,
    criterions: category.criterions.map((criterion) => ({
      ...criterion,
      draft: false,
      toBeDeleted: false,
    })),
    toBeDeleted: false,
  })),
  gradingPrompt: rubric?.gradingPrompt ?? '',
  modelAnswer: rubric?.modelAnswer ?? '',
});

const markGradeForDeletion = (
  categories: RubricCategoryEntity[],
  categoryIndex: number,
  gradeIndex: number,
): RubricCategoryEntity[] => {
  return produce(categories, (draft) => {
    draft[categoryIndex].criterions[gradeIndex].toBeDeleted =
      !draft[categoryIndex].criterions[gradeIndex].toBeDeleted;
    draft[categoryIndex].toBeDeleted = draft[categoryIndex].criterions.every(
      (grade) => grade.toBeDeleted,
    );
  });
};

export const handleDeleteGrade = (
  categories: RubricCategoryEntity[],
  categoryIndex: number,
  gradeIndex: number,
  setValue: UseFormSetValue<RubricEditFormData>,
): void => {
  if (!categories) return;

  const countGrades = categories[categoryIndex].criterions.length;
  if (countGrades === 0) return;

  if (!categories[categoryIndex].criterions[gradeIndex].draft) {
    const updatedCategories = markGradeForDeletion(
      categories,
      categoryIndex,
      gradeIndex,
    );
    setValue('categories', updatedCategories, { shouldDirty: true });
    return;
  }

  if (countGrades === 1) {
    const updatedCategories = produce(categories, (draft) => {
      draft.splice(categoryIndex, 1);
    });
    setValue('categories', updatedCategories, { shouldDirty: true });
  } else {
    const updatedCategories = produce(categories, (draft) => {
      draft[categoryIndex].criterions.splice(gradeIndex, 1);
    });
    setValue('categories', updatedCategories, { shouldDirty: true });
  }
};

export const categoryClassName = (category: RubricCategoryEntity): string => {
  if (category.draft) {
    return 'bg-lime-50';
  }

  if (category.criterions?.every((criterion) => criterion.toBeDeleted)) {
    return 'bg-red-50';
  }

  return '';
};

export const criterionClassName = (
  grade: QuestionRubricGradeEntity,
): string => {
  if (grade.draft) {
    return 'bg-lime-50';
  }

  if (grade.toBeDeleted) {
    return 'bg-red-50';
  }

  return '';
};

export const computeMaximumCategoryGrade = (
  category: RubricCategoryEntity,
): number =>
  Math.max(
    0,
    ...category.criterions
      .filter((cat) => !cat.toBeDeleted)
      .map((cat) => Number(cat.grade)),
  );

export const buildSelectedRubricTableData = (
  selectedRubric: RubricDataWithEvaluations,
  answers: Record<number, RubricAnswerData>,
  mockAnswers: Record<number, RubricAnswerData>,
  compareRubrics?: RubricDataWithEvaluations[],
): AnswerTableEntry[] => {
  return Object.values(answers)
    .filter((answer) => answer.id in selectedRubric.answerEvaluations)
    .map((answer) =>
      answerDataToTableEntry(
        answer,
        false,
        selectedRubric.answerEvaluations[answer.id],
        compareRubrics,
      ),
    )
    .concat(
      ...Object.values(mockAnswers)
        .filter(
          (mockAnswer) => mockAnswer.id in selectedRubric.mockAnswerEvaluations,
        )
        .map((mockAnswer) =>
          answerDataToTableEntry(
            mockAnswer,
            true,
            selectedRubric.mockAnswerEvaluations[mockAnswer.id],
            compareRubrics,
          ),
        ),
    );
};
