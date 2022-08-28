import { FC, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Typography } from '@mui/material';
import ConditionList from 'lib/components/course/ConditionList';
import ErrorText from 'lib/components/ErrorText';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSingleFileInput, {
  BadgePreview,
} from 'lib/components/form/fields/SingleFileInput';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import {
  AchievementEditFormData,
  AchievementFormData,
} from 'types/course/achievements';
import { ConditionData, Conditions } from 'types/course/conditions';

interface Props {
  editing: boolean; // If the Form is in editing mode, `Add Conditions` button will be displayed.
  handleClose: (isDirty: boolean) => void;
  onSubmit: (
    data: AchievementFormData | AchievementEditFormData,
    setError: unknown,
  ) => void;
  setIsDirty?: (value: boolean) => void;
  conditionAttributes?: {
    enabledConditions: Conditions[];
    conditions: ConditionData[];
  };
  initialValues?: Object;
}

interface IFormInputs {
  title: string;
  description: string;
  badge: { name: string; url: string };
  published: boolean;
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
    conditionAttributes,
    editing,
    handleClose,
    initialValues,
    onSubmit,
    setIsDirty,
  } = props;
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<IFormInputs>({
    defaultValues: initialValues,
    resolver: yupResolver<yup.AnyObjectSchema>(validationSchema),
  });

  useEffect(() => {
    if (setIsDirty) {
      if (isDirty) {
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    }
  }, [isDirty]);

  const disabled = isSubmitting;

  const actionButtons = editing ? (
    <div style={{ marginTop: 16, marginLeft: 16 }}>
      <Button
        variant="contained"
        color="primary"
        className="btn-submit"
        disabled={disabled || !isDirty}
        form="achievement-form"
        key="achievement-form-update-button"
        type="submit"
      >
        <FormattedMessage {...translations.update} />
      </Button>
    </div>
  ) : (
    <div
      style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}
    >
      <Button
        color="primary"
        className="btn-cancel"
        disabled={disabled}
        key="achievement-form-cancel-button"
        onClick={(): void => handleClose(isDirty)}
      >
        <FormattedMessage {...formTranslations.cancel} />
      </Button>
      <Button
        color="primary"
        className="btn-submit"
        disabled={disabled || !isDirty}
        form="achievement-form"
        key="achievement-form-submit-button"
        type="submit"
      >
        <FormattedMessage {...formTranslations.submit} />
      </Button>
    </div>
  );
  return (
    <>
      <form
        encType="multipart/form-data"
        id="achievement-form"
        noValidate
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
      >
        <ErrorText errors={errors} />
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.title} />}
              // @ts-ignore: component is still written in JS
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
              disabled={disabled}
              label={<FormattedMessage {...translations.description} />}
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
              accept="image/*"
              disabled={disabled}
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
              disabled={disabled}
              label={<FormattedMessage {...translations.published} />}
            />
          )}
        />
        {editing && conditionAttributes && (
          <>
            <Typography variant="body1" sx={{ paddingTop: 2 }}>
              <FormattedMessage {...translations.unlockConditions} />
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ paddingBottom: 2 }}
            >
              <FormattedMessage {...translations.unlockConditionsHint} />
            </Typography>

            <ConditionList
              newConditionUrls={conditionAttributes.enabledConditions}
              conditions={conditionAttributes.conditions}
            />
          </>
        )}
        {actionButtons}
      </form>
    </>
  );
};

export default AchievementForm;
