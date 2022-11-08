import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Controller, UseFormSetError } from 'react-hook-form';
import * as yup from 'yup';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSingleFileInput, {
  BadgePreview,
} from 'lib/components/form/fields/SingleFileInput';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import { AchievementFormData } from 'types/course/achievements';
import { ConditionsData } from 'types/course/conditions';
import ConditionsManager from 'lib/components/extensions/conditions/ConditionsManager';
import FormDialog from 'lib/components/form/dialog/FormDialog';
import useTranslation from 'lib/hooks/useTranslation';

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
      open={open}
      editing={editing}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      formName="achievement-form"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(control, formState): JSX.Element => (
        <>
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={t(translations.title)}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                required
                variant="standard"
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={t(translations.description)}
                // @ts-ignore: component is still written in JS
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                variant="standard"
              />
            )}
          />
          <Controller
            name="badge"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormSingleFileInput
                field={field}
                fieldState={fieldState}
                accept={{ 'image/jpg': [], 'image/png': [], 'image/gif': [] }}
                disabled={formState.isSubmitting}
                previewComponent={BadgePreview}
              />
            )}
          />
          <Controller
            name="published"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormToggleField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={t(translations.published)}
              />
            )}
          />
          {editing && conditionAttributes && (
            <ConditionsManager
              title={t(translations.unlockConditions)}
              description={t(translations.unlockConditionsHint)}
              conditionsData={conditionAttributes}
            />
          )}
        </>
      )}
    </FormDialog>
  );
};

export default AchievementForm;
