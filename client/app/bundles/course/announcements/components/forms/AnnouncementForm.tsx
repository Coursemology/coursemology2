import { FC, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button } from '@mui/material';

import ErrorText from 'lib/components/ErrorText';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';

import { ConditionData, Conditions } from 'types/course/conditions';
import {
  AnnouncementEditFormData,
  AnnouncementFormData,
} from 'types/course/announcements';

interface Props {
  editing: boolean; // If the Form is in editing mode, `Add Conditions` button will be displayed.
  handleClose: (isDirty: boolean) => void;
  onSubmit: (
    data: AnnouncementFormData | AnnouncementEditFormData,
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
  content: string;
  sticky: boolean;
  startAt: string;
  endAt: string;
}

const translations = defineMessages({
  title: {
    id: 'course.announcement.form.title',
    defaultMessage: 'Title',
  },
  content: {
    id: 'course.announcement.form.content',
    defaultMessage: 'Content',
  },
  sticky: {
    id: 'course.announcement.form.sticky',
    defaultMessage: 'Sticky',
  },
  startAt: {
    id: 'course.announcement.form.startAt',
    defaultMessage: 'Start At',
  },
  endAt: {
    id: 'course.announcement.form.endAt',
    defaultMessage: 'End At',
  },
  endTimeError: {
    id: 'course.announcement.form.endTimeError',
    defaultMessage: 'End time cannot be earlier than start time',
  },
});

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  content: yup.string().nullable(),
  sticky: yup.bool(),
  startAt: yup.date().nullable(),
  endAt: yup.date().nullable(),
});

const AnnouncementForm: FC<Props> = (props) => {
  const { editing, handleClose, initialValues, onSubmit, setIsDirty } = props;

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

  const actionButtons = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: '20px',
      }}
    >
      <Button
        color="primary"
        className="btn-cancel"
        disabled={disabled}
        key="announcement-form-cancel-button"
        onClick={(): void => handleClose(isDirty)}
      >
        <FormattedMessage {...formTranslations.cancel} />
      </Button>
      {editing ? (
        <Button
          variant="contained"
          color="primary"
          className="btn-submit"
          disabled={disabled || !isDirty}
          form="announcement-form"
          key="announcement-form-update-button"
          type="submit"
        >
          <FormattedMessage {...formTranslations.update} />
        </Button>
      ) : (
        <Button
          color="primary"
          className="btn-submit"
          disabled={disabled || !isDirty}
          form="announcement-form"
          key="announcement-form-submit-button"
          type="submit"
        >
          <FormattedMessage {...formTranslations.submit} />
        </Button>
      )}
    </div>
  );

  return (
    <>
      <form
        encType="multipart/form-data"
        id="announcement-form"
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
          name="content"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormRichTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.content} />}
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
          name="sticky"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormToggleField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.sticky} />}
            />
          )}
        />
        <div style={{ marginBottom: 12 }} />

        <div style={{ display: 'flex' }}>
          <Controller
            name="startAt"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormDateTimePickerField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={<FormattedMessage {...translations.startAt} />}
                style={{ flex: 1 }}
              />
            )}
          />
          <Controller
            name="endAt"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormDateTimePickerField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={<FormattedMessage {...translations.endAt} />}
                style={{ flex: 1 }}
              />
            )}
          />
        </div>

        {actionButtons}
      </form>
    </>
  );
};

export default AnnouncementForm;
