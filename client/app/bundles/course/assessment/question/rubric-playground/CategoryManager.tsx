import { useEffect } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Add, Delete, Undo } from '@mui/icons-material';
import {
  Button,
  Divider,
  IconButton,
  Paper,
  TextField,
  Tooltip,
} from '@mui/material';
import { produce } from 'immer';

import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import {
  RubricCategoryCriterionEntity,
  RubricCategoryEntity,
  RubricHeaderFormData,
} from './types';
import {
  categoryClassName,
  computeMaximumCategoryGrade,
  criterionClassName,
  generateNewElementId,
  handleDeleteGrade,
} from './utils';

interface CategoryManagerProps {
  for: RubricCategoryEntity[];
  disabled?: boolean;
}

const CategoryManager = (props: CategoryManagerProps): JSX.Element => {
  const { disabled, for: originalCategories } = props;

  const { t } = useTranslation();

  const { control, watch, setValue } = useFormContext<RubricHeaderFormData>();

  const { append } = useFieldArray({ control, name: 'categories' });

  const categories = watch('categories') ?? [];

  categories.flatMap((category) => category.criterions);

  const newCategoryCriterionObject = (
    id: number,
    initialGrade: number,
  ): RubricCategoryCriterionEntity => ({
    id,
    grade: initialGrade,
    explanation: '',
    draft: true,
  });

  const newCategoryObject = (id: number): RubricCategoryEntity => ({
    id,
    name: '',
    criterions: [newCategoryCriterionObject(0, 0)],
    isBonusCategory: false,
    draft: true,
  });

  const handleAddCategory = (): void => {
    append(newCategoryObject(generateNewElementId(categories)));
  };

  const handleAddCategoryCriterion = (categoryIndex: number): void => {
    if (!categories) return;

    const initialGrade =
      computeMaximumCategoryGrade(categories[categoryIndex]) + 1;

    const updatedCategories = produce(categories, (draft) => {
      draft[categoryIndex].criterions.push(
        newCategoryCriterionObject(
          generateNewElementId(categories[categoryIndex].criterions),
          initialGrade,
        ),
      );
    });

    setValue('categories', updatedCategories);
  };

  return (
    <Paper
      className="p-4 overflow-y-scroll h-[387px] space-y-4"
      variant="outlined"
    >
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
                <TextField
                  className="w-full"
                  disabled
                  label={t(translations.categoryMaximumGrade)}
                  type="number"
                  value={computeMaximumCategoryGrade(category)}
                  variant="filled"
                />
              </div>

              <div className="w-[5%] flex flex-col">
                <Tooltip title={t(translations.addNewGrade)}>
                  <IconButton
                    color="info"
                    disabled={disabled}
                    onClick={() => handleAddCategoryCriterion(categoryIndex)}
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              </div>
            </div>

            <Divider className="mb-3" />

            {category.criterions?.map((criterion, criterionIndex) => (
              <div
                key={criterion.id}
                className={`${criterionClassName(criterion)} w-full flex flex-row items-start space-x-2 pl-6 pr-2`}
              >
                <div className="w-4/5 pl-2">
                  <Controller
                    control={control}
                    name={`categories.${categoryIndex}.criterions.${criterionIndex}.explanation`}
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
                    name={`categories.${categoryIndex}.criterions.${criterionIndex}.grade`}
                    render={({ field, fieldState }): JSX.Element => (
                      <FormTextField
                        className="w-full"
                        disabled={disabled}
                        disableMargins
                        field={field}
                        fieldState={fieldState}
                        label={t(translations.categoryGrade)}
                        type="number"
                        variant="filled"
                      />
                    )}
                  />
                </div>

                <div className="w-[5%] flex flex-col">
                  <IconButton
                    color={criterion.toBeDeleted ? 'info' : 'error'}
                    disabled={disabled}
                    onClick={() => {
                      handleDeleteGrade(
                        categories,
                        categoryIndex,
                        criterionIndex,
                        setValue,
                      );
                    }}
                  >
                    {criterion.toBeDeleted ? <Undo /> : <Delete />}
                  </IconButton>
                </div>
              </div>
            ))}
          </Paper>
        );
      })}
    </Paper>
  );
};

export default CategoryManager;
