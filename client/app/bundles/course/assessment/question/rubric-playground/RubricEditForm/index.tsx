import { FC, useEffect } from 'react';
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form';
import { Paper, Typography } from '@mui/material';

import FormRichTextField from 'lib/components/form/fields/RichTextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';
import { RubricEditFormData } from '../types';

import PlaygroundCategoryManager from './PlaygroundCategoryManager';

interface RubricEditFormProps {
  form: UseFormReturn<RubricEditFormData>;
  initialValues: RubricEditFormData;
  // A read-only preview of a saved revision disables every input; the unsaved draft is editable.
  disabled: boolean;
  // Re-seeds the form whenever the previewed/edited revision changes (saved revision id or the draft).
  formKey: number;
}

const RubricEditForm: FC<RubricEditFormProps> = (props) => {
  const { t } = useTranslation();
  const { form, initialValues, disabled, formKey } = props;

  useEffect(() => {
    form.reset(initialValues);
  }, [formKey]);

  return (
    <form
      className="flex flex-row space-x-4 pt-4"
      id="rubric-playground-edit-form"
    >
      <div className="w-1/2">
        <Paper className="p-3 space-y-4" variant="outlined">
          <Typography
            className={`${disabled ? 'text-neutral-500' : ''}`}
            variant="subtitle2"
          >
            {t(translations.gradingPrompt)}
          </Typography>
          <Typography
            className={`${disabled ? 'text-neutral-500' : ''}`}
            variant="caption"
          >
            {t(translations.gradingPromptDescription)}
          </Typography>
          <Controller
            control={form.control}
            name="gradingPrompt"
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                fullWidth
              />
            )}
          />

          <Typography
            className={`${disabled ? 'text-neutral-500' : ''}`}
            variant="subtitle2"
          >
            {t(translations.modelAnswer)}
          </Typography>
          <Typography
            className={`${disabled ? 'text-neutral-500' : ''}`}
            variant="caption"
          >
            {t(translations.modelAnswerDescription)}
          </Typography>
          <Controller
            control={form.control}
            name="modelAnswer"
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                disabled={disabled}
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
          <PlaygroundCategoryManager disabled={disabled} />
        </FormProvider>
      </div>
    </form>
  );
};

export default RubricEditForm;
