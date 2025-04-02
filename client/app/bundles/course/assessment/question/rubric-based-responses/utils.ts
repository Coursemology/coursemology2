import { UseFormSetValue } from 'react-hook-form';
import { produce } from 'immer';
import {
  CategoryEntity,
  QuestionRubricGradeEntity,
  RubricBasedResponseFormData,
} from 'types/course/assessment/question/rubric-based-responses';

export const updateMaximumGrade = (
  cats: CategoryEntity[],
  categoryIndex: number,
  setValue: UseFormSetValue<RubricBasedResponseFormData>,
): void => {
  const maximumCategoryGrade = Math.max(
    ...cats[categoryIndex].grades
      .filter((cat) => !cat.toBeDeleted)
      .map((cat) => Number(cat.grade)),
  );

  setValue(`categories.${categoryIndex}.maximumGrade`, maximumCategoryGrade);

  const maximumGrade = cats
    .map((cat, index) =>
      index !== categoryIndex ? Number(cat.maximumGrade) : maximumCategoryGrade,
    )
    .reduce((curMax, catScore) => curMax + catScore, 0);

  setValue('question.maximumGrade', `${maximumGrade}`);
};

export const handleDeleteGrade = (
  categories: CategoryEntity[],
  categoryIndex: number,
  gradeIndex: number,
  setValue: UseFormSetValue<RubricBasedResponseFormData>,
): void => {
  if (!categories) return;

  const countGrades = categories[categoryIndex].grades.length;
  if (countGrades === 0) return;

  if (!categories[categoryIndex].grades[gradeIndex].draft) {
    const updatedCategories = produce(categories, (draft) => {
      draft[categoryIndex].grades[gradeIndex].toBeDeleted =
        !draft[categoryIndex].grades[gradeIndex].toBeDeleted;
    });
    setValue('categories', updatedCategories);

    updateMaximumGrade(updatedCategories, categoryIndex, setValue);
    return;
  }

  if (countGrades === 1) {
    const updatedCategories = produce(categories, (draft) => {
      draft.splice(categoryIndex, 1);
    });
    setValue('categories', updatedCategories);
  } else {
    const updatedCategories = produce(categories, (draft) => {
      draft[categoryIndex].grades.splice(gradeIndex, 1);
    });
    setValue('categories', updatedCategories);

    updateMaximumGrade(updatedCategories, categoryIndex, setValue);
  }
};

export const categoryClassName = (category: CategoryEntity): string => {
  if (category.draft) {
    return 'bg-lime-50';
  }

  if (category.grades?.every((grade) => grade.toBeDeleted)) {
    return 'bg-red-50';
  }

  return '';
};

export const gradeClassName = (grade: QuestionRubricGradeEntity): string => {
  if (grade.draft) {
    return 'bg-lime-50';
  }

  if (grade.toBeDeleted) {
    return 'bg-red-50';
  }

  return '';
};
