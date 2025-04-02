import { useEffect } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Add, Delete, Undo } from '@mui/icons-material';
import {
  Alert,
  Button,
  Divider,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { produce } from 'immer';
import {
  CategoryEntity,
  QuestionRubricGradeEntity,
  RubricBasedResponseFormData,
} from 'types/course/assessment/question/rubric-based-responses';

import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import {
  categoryClassName,
  gradeClassName,
  handleDeleteGrade,
  updateMaximumGrade,
} from '../utils';

interface CategoryManagerProps {
  for: CategoryEntity[];
  disabled?: boolean;
  onDirtyChange: (isDirty: boolean) => void;
}

const CategoryManager = (props: CategoryManagerProps): JSX.Element => {
  const { disabled, for: originalCategories } = props;

  const { t } = useTranslation();

  const { control, watch, setValue } =
    useFormContext<RubricBasedResponseFormData>();

  const { append } = useFieldArray({ control, name: 'categories' });

  const categories = watch('categories') ?? [];

  const newQuestionRubricGradeObject = (
    id: string,
  ): QuestionRubricGradeEntity => ({
    id,
    grade: 0,
    explanation: '',
    draft: true,
  });

  const newCategoryObject = (
    categoryId: string,
    levelId: string,
  ): CategoryEntity => ({
    id: categoryId,
    name: '',
    maximumGrade: 0,
    grades: [newQuestionRubricGradeObject(levelId)],
    isBonusCategory: false,
    draft: true,
  });

  const isDirty = (currentCategories: CategoryEntity[]): boolean => {
    if (currentCategories.length !== originalCategories.length) {
      return true;
    }

    return currentCategories.some((category, categoryIndex) => {
      const originalCategory = originalCategories[categoryIndex];

      if (
        category.name !== originalCategory.name ||
        category.grades.length !== originalCategory.grades.length
      ) {
        return true;
      }

      return category.grades.some((catGrade, gradeIndex) => {
        const originalGrade = originalCategory.grades[gradeIndex];

        return (
          catGrade.grade !== originalGrade.grade ||
          catGrade.explanation !== originalGrade.explanation ||
          (catGrade.toBeDeleted ?? false) !==
            (originalGrade.toBeDeleted ?? false)
        );
      });
    });
  };

  useEffect(() => {
    props.onDirtyChange(isDirty(categories));
  }, [categories]);

  const handleAddCategory = (): void => {
    const categoryCount = categories.length;
    const newCategoryId = `new-category-${categoryCount}`;
    const newLevelId = `new-level-${categoryCount}-0`;

    append(newCategoryObject(newCategoryId, newLevelId));
  };

  const handleAddGrade = (categoryIndex: number): void => {
    if (!categories) return;

    const gradeCount = categories[categoryIndex].grades.length;
    const newGradeId = `new-grade-${categoryIndex}-${gradeCount}`;

    const updatedCategories = produce(categories, (draft) => {
      draft[categoryIndex].grades.push(
        newQuestionRubricGradeObject(newGradeId),
      );
    });

    setValue('categories', updatedCategories);
  };

  return (
    <>
      <Alert severity="info">
        <Typography variant="body2">
          {t(translations.bonusReservedNames)}
        </Typography>
      </Alert>

      <Button
        disabled={disabled}
        onClick={handleAddCategory}
        variant="outlined"
      >
        {t(translations.addNewCategory)}
      </Button>

      {categories?.map((category, categoryIndex) => {
        return (
          <Paper
            key={category.id}
            className={categoryClassName(category)}
            variant="outlined"
          >
            <div className="w-full flex flex-row items-center space-x-2 pr-2">
              <div className="w-4/5 pl-2">
                <Controller
                  control={control}
                  name={`categories.${categoryIndex}.name`}
                  render={({ field, fieldState }): JSX.Element => (
                    <FormTextField
                      className="w-full"
                      disabled={disabled}
                      field={field}
                      fieldState={fieldState}
                      label={t(translations.categoryName)}
                      variant="filled"
                    />
                  )}
                />
              </div>

              <div className="w-[15%]">
                <Controller
                  control={control}
                  name={`categories.${categoryIndex}.maximumGrade`}
                  render={({ field, fieldState }): JSX.Element => (
                    <FormTextField
                      className="w-full"
                      disabled
                      field={field}
                      fieldState={fieldState}
                      label={t(translations.categoryMaximumGrade)}
                      type="number"
                      variant="filled"
                    />
                  )}
                />
              </div>

              <div className="w-[5%] pr-4">
                <Tooltip title={t(translations.addNewGrade)}>
                  <IconButton
                    color="info"
                    disabled={disabled}
                    onClick={() => handleAddGrade(categoryIndex)}
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              </div>
            </div>

            <Divider className="mb-3" />

            {category.grades?.map((grade, gradeIndex) => (
              <div
                key={grade.id}
                className={`${gradeClassName(grade)} w-full flex flex-row items-start space-x-2 pl-6 pr-2`}
              >
                <div className="w-4/5 pl-2">
                  <Controller
                    control={control}
                    name={`categories.${categoryIndex}.grades.${gradeIndex}.explanation`}
                    render={({ field, fieldState }): JSX.Element => (
                      <FormRichTextField
                        disabled={disabled}
                        disableMargins
                        field={field}
                        fieldState={fieldState}
                        fullWidth
                        variant="filled"
                      />
                    )}
                  />
                </div>

                <div className="w-[15%]">
                  <Controller
                    control={control}
                    name={`categories.${categoryIndex}.grades.${gradeIndex}.grade`}
                    render={({ field, fieldState }): JSX.Element => (
                      <FormTextField
                        className="w-full"
                        disabled={disabled}
                        disableMargins
                        field={{
                          ...field,
                          onChange: (e) => {
                            field.onChange(e);
                            updateMaximumGrade(
                              categories,
                              categoryIndex,
                              setValue,
                            );
                          },
                        }}
                        fieldState={fieldState}
                        label={t(translations.categoryGrade)}
                        type="number"
                        variant="filled"
                      />
                    )}
                  />
                </div>

                <div className="w-[5%]">
                  <IconButton
                    color={grade.toBeDeleted ? 'info' : 'error'}
                    disabled={disabled}
                    onClick={() => {
                      handleDeleteGrade(
                        categories,
                        categoryIndex,
                        gradeIndex,
                        setValue,
                      );
                    }}
                  >
                    {grade.toBeDeleted ? <Undo /> : <Delete />}
                  </IconButton>
                </div>
              </div>
            ))}
          </Paper>
        );
      })}
    </>
  );
};

export default CategoryManager;
