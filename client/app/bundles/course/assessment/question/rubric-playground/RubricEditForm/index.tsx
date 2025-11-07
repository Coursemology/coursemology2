import { FC, useEffect } from 'react';
import {
  Controller,
  FormProvider,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form';
import { Paper, Typography } from '@mui/material';

import FormRichTextField from 'lib/components/form/fields/RichTextField';
import useTranslation from 'lib/hooks/useTranslation';

import { RubricState } from '../../reducers/rubrics';
import translations from '../translations';
import { RubricEditFormData } from '../types';

import PlaygroundCategoryManager from './PlaygroundCategoryManager';

interface RubricEditFormProps {
  form: UseFormReturn<RubricEditFormData>;
  selectedRubric: RubricState;
  onSubmit: SubmitHandler<RubricEditFormData>;
}

const RubricEditForm: FC<RubricEditFormProps> = (props) => {
  const { t } = useTranslation();
  const { form, selectedRubric, onSubmit } = props;

  useEffect(() => {
    form.reset({
      categories: (selectedRubric?.categories ?? []).map((category) => ({
        ...category,
        criterions: category.criterions.map((criterion) => ({
          ...criterion,
          draft: false,
          toBeDeleted: false,
        })),
        toBeDeleted: false,
      })),
      gradingPrompt: selectedRubric?.gradingPrompt ?? '',
      modelAnswer: selectedRubric?.modelAnswer ?? '',
    });
  }, [selectedRubric.id]);

  return (
    <form
      className="flex flex-row space-x-4 pt-4"
      id="rubric-playground-edit-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="w-1/2">
        <Paper className="p-3 space-y-4" variant="outlined">
          <Typography variant="subtitle2">
            {t(translations.gradingPrompt)}
          </Typography>
          <Typography variant="caption">
            {t(translations.gradingPromptDescription)}
          </Typography>
          <Controller
            control={form.control}
            name="gradingPrompt"
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                disabled={false}
                field={field}
                fieldState={fieldState}
                fullWidth
              />
            )}
          />

          <Typography variant="subtitle2">
            {t(translations.modelAnswer)}
          </Typography>
          <Typography variant="caption">
            {t(translations.modelAnswerDescription)}
          </Typography>
          <Controller
            control={form.control}
            name="modelAnswer"
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                disabled={false}
                field={field}
                fieldState={fieldState}
                fullWidth
              />
            )}
          />
        </Paper>
      </div>

      <div className="w-1/2">
        <FormProvider {...form}>
          <PlaygroundCategoryManager disabled={false} />
        </FormProvider>
      </div>
    </form>
  );
};

export default RubricEditForm;
