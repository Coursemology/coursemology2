import { useEffect } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Delete, Undo } from '@mui/icons-material';
import { Button, Divider, Grid, IconButton, Paper } from '@mui/material';
import { produce } from 'immer';
import {
  CategoryEntity,
  CategoryLevelEntity,
  RubricBasedResponseFormData,
} from 'types/course/assessment/question/rubric-based-responses';

import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

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

  const newLevelObject = (id: string): CategoryLevelEntity => ({
    id,
    level: 0,
    explanation: '',
    draft: true,
  });

  const newCategoryObject = (
    categoryId: string,
    levelId: string,
  ): CategoryEntity => ({
    id: categoryId,
    name: '',
    maximumScore: 0,
    levels: [newLevelObject(levelId)],
    isBonusCategory: false,
    draft: true,
  });

  const isDirty = (currentCategories: CategoryEntity[]): boolean => {
    if (currentCategories.length !== originalCategories.length) {
      return true;
    }

    return currentCategories.some((category, index) => {
      const originalCategory = originalCategories[index];

      if (
        category.name !== originalCategory.name ||
        category.maximumScore !== originalCategory.maximumScore ||
        category.levels.length !== originalCategory.levels.length
      ) {
        return true;
      }

      return category.levels.some((level, levelIndex) => {
        const originalLevel = originalCategory.levels[levelIndex];

        return (
          level.level !== originalLevel.level ||
          level.explanation !== originalLevel.explanation ||
          (level.toBeDeleted ?? false) !== (originalLevel.toBeDeleted ?? false)
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

  const handleAddLevel = (index: number): void => {
    if (!categories) return;

    const levelCount = categories[index].levels.length;
    const newLevelId = `new-level-${index}-${levelCount}`;

    const updatedCategories = produce(categories, (draft) => {
      draft[index].levels.push(newLevelObject(newLevelId));
    });

    setValue('categories', updatedCategories);
  };

  const handleDeleteLevel = (index: number, levelIndex: number): void => {
    if (!categories) return;

    const countLevels = categories[index].levels.length;
    if (countLevels === 0) return;

    if (!categories[index].levels[levelIndex].draft) {
      const updatedCategories = produce(categories, (draft) => {
        draft[index].levels[levelIndex].toBeDeleted =
          !draft[index].levels[levelIndex].toBeDeleted;
      });
      setValue('categories', updatedCategories);
      return;
    }

    if (countLevels === 1) {
      const updatedCategories = produce(categories, (draft) => {
        draft.splice(index, 1);
      });
      setValue('categories', updatedCategories);
    } else {
      const updatedCategories = produce(categories, (draft) => {
        draft[index].levels.splice(levelIndex, 1);
      });
      setValue('categories', updatedCategories);
    }
  };

  const categoryClassName = (category: CategoryEntity): string => {
    if (category.draft) {
      return 'bg-lime-50';
    }

    if (category.levels?.every((level) => level.toBeDeleted)) {
      return 'bg-red-50';
    }

    return '';
  };

  const levelClassName = (level: CategoryLevelEntity): string => {
    if (level.draft) {
      return 'bg-lime-50';
    }

    if (level.toBeDeleted) {
      return 'bg-red-50';
    }

    return '';
  };

  return (
    <>
      <Button
        disabled={disabled}
        onClick={handleAddCategory}
        variant="outlined"
      >
        {t(translations.addNewCategory)}
      </Button>

      {categories?.map((category, index) => {
        return (
          <Paper
            key={category.id}
            className={categoryClassName(category)}
            variant="outlined"
          >
            <Grid container direction="row">
              <Grid item xs={4}>
                <div className="w-full flex flex-col pl-4 pr-4">
                  <Controller
                    control={control}
                    name={`categories.${index}.name`}
                    render={({ field, fieldState }): JSX.Element => (
                      <FormTextField
                        disabled={disabled}
                        field={field}
                        fieldState={fieldState}
                        label={t(translations.categoryName)}
                        variant="filled"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={`categories.${index}.maximumScore`}
                    render={({ field, fieldState }): JSX.Element => (
                      <FormTextField
                        disabled={disabled}
                        field={{
                          ...field,
                          onChange: (e) => {
                            field.onChange(e);
                            const maximumGrade = categories
                              .map((cat) => Number(cat.maximumScore))
                              .reduce(
                                (curMax, catScore) => curMax + catScore,
                                0,
                              );

                            setValue(
                              'question.maximumGrade',
                              `${maximumGrade}`,
                            );
                          },
                        }}
                        fieldState={fieldState}
                        label={t(translations.categoryMaximumScore)}
                        type="number"
                        variant="filled"
                      />
                    )}
                  />

                  <div className="w-fit">
                    <Button
                      disabled={disabled}
                      onClick={() => handleAddLevel(index)}
                      variant="outlined"
                    >
                      {t(translations.addNewLevel)}
                    </Button>
                  </div>
                </div>
              </Grid>

              <Grid item xs={8}>
                {category.levels?.map((level, levelIndex) => (
                  <div key={level.id} className={levelClassName(level)}>
                    <div className="w-full pr-2 flex flex-row items-center">
                      <Controller
                        control={control}
                        name={`categories.${index}.levels.${levelIndex}.level`}
                        render={({ field, fieldState }): JSX.Element => (
                          <FormTextField
                            disabled={disabled}
                            field={field}
                            fieldState={fieldState}
                            fullWidth
                            label={t(translations.levelLevel)}
                            type="number"
                            variant="filled"
                          />
                        )}
                      />
                      {level.toBeDeleted ? (
                        <IconButton
                          color="info"
                          disabled={disabled}
                          onClick={() => {
                            handleDeleteLevel(index, levelIndex);
                          }}
                        >
                          <Undo />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="error"
                          disabled={disabled}
                          onClick={() => {
                            handleDeleteLevel(index, levelIndex);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </div>

                    <div className="pr-4">
                      <Controller
                        control={control}
                        name={`categories.${index}.levels.${levelIndex}.explanation`}
                        render={({ field, fieldState }): JSX.Element => (
                          <FormRichTextField
                            disabled={disabled}
                            field={field}
                            fieldState={fieldState}
                            fullWidth
                            label={t(translations.levelExplanation)}
                            variant="filled"
                          />
                        )}
                      />
                    </div>

                    {levelIndex !== category.levels.length - 1 && <Divider />}
                  </div>
                ))}
              </Grid>
            </Grid>
          </Paper>
        );
      })}
    </>
  );
};

export default CategoryManager;
