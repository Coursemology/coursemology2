import { FC } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { AchievementFormData } from 'types/course/achievements';
import { ConditionsData } from 'types/course/conditions';
import * as yup from 'yup';

import ConditionsManager from 'lib/components/extensions/conditions/ConditionsManager';
import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSingleFileInput, {
  BadgePreview,
} from 'lib/components/form/fields/SingleFileInput';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

interface Props {
  open: boolean;
  title: string;
  editing: boolean; // If the Form is in editing mode, `Add Conditions` button will be displayed.
  onClose: () => void;
  onSubmit: (
    data: AchievementFormData,
    setError: UseFormSetError<AchievementFormData>,
  ) => void;
  conditionAttributes?: ConditionsData;
  initialValues: AchievementFormData;
}

const translations = defineMessages({
  title: {
    id: 'course.achievement.form.title',
    defaultMessage: 'Title',
  },
  description: {
    id: 'course.achievement.form.description',
    defaultMessage: 'Description',
  },
  published: {
    id: 'course.achievement.form.published',
    defaultMessage: 'Published',
  },
  badge: {
    id: 'course.achievement.form.badge',
    defaultMessage: 'Badge',
  },
  update: {
    id: 'course.achievement.form.update',
    defaultMessage: 'Update',
  },
  unlockConditions: {
    id: 'course.achievement.form.unlockConditions',
    defaultMessage: 'Unlock conditions',
  },
  unlockConditionsHint: {
    id: 'course.achievement.form.unlockConditionsHint',
    defaultMessage:
      'This achievement will be unlocked if a student meets the following conditions.',
  },
});

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  description: yup.string().nullable(),
  published: yup.bool(),
});

const AchievementForm: FC<Props> = (props) => {
  const {
    open,
    title,
    conditionAttributes,
    editing,
    onClose,
    initialValues,
    onSubmit,
  } = props;
  const { t } = useTranslation();

  return (
    <FormDialog
      editing={editing}
      formName="achievement-form"
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
      open={open}
      title={title}
      validationSchema={validationSchema}
    >
      {(control, formState): JSX.Element => (
        <>
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(translations.title)}
                required
                variant="standard"
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(translations.description)}
                variant="standard"
              />
            )}
          />
          <Controller
            control={control}
            name="badge"
            render={({ field, fieldState }): JSX.Element => (
              <FormSingleFileInput
                accept={{ 'image/jpg': [], 'image/png': [], 'image/gif': [] }}
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                previewComponent={BadgePreview}
              />
            )}
          />
          <Controller
            control={control}
            name="published"
            render={({ field, fieldState }): JSX.Element => (
              <FormToggleField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                label={t(translations.published)}
              />
            )}
          />
          {editing && conditionAttributes && (
            <ConditionsManager
              conditionsData={conditionAttributes}
              description={t(translations.unlockConditionsHint)}
              title={t(translations.unlockConditions)}
            />
          )}
        </>
      )}
    </FormDialog>
  );
};

export default AchievementForm;
