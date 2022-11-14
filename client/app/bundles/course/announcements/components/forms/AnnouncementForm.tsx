import { FC } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import { AnnouncementFormData } from 'types/course/announcements';
import * as yup from 'yup';

import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import formTranslations from 'lib/translations/form';

interface Props {
  open: boolean;
  editing: boolean;
  title: string;
  initialValues: AnnouncementFormData;
  onClose: () => void;
  onSubmit: (
    data: AnnouncementFormData,
    setError: UseFormSetError<AnnouncementFormData>,
  ) => void;
  canSticky: boolean;
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
  startAt: yup.date().nullable().typeError(formTranslations.invalidDate),
  endAt: yup.date().nullable().typeError(formTranslations.invalidDate),
});

const AnnouncementForm: FC<Props> = (props) => {
  const { open, editing, title, onClose, initialValues, onSubmit, canSticky } =
    props;

  return (
    <FormDialog
      editing={editing}
      formName="announcement-form"
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
                label={<FormattedMessage {...translations.title} />}
                required
                variant="standard"
              />
            )}
          />

          <Controller
            control={control}
            name="content"
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={<FormattedMessage {...translations.content} />}
                variant="standard"
              />
            )}
          />
          {canSticky && (
            <Controller
              control={control}
              name="sticky"
              render={({ field, fieldState }): JSX.Element => (
                <FormToggleField
                  disabled={formState.isSubmitting}
                  field={field}
                  fieldState={fieldState}
                  label={<FormattedMessage {...translations.sticky} />}
                />
              )}
            />
          )}
          <div style={{ marginBottom: 12 }} />

          <div style={{ display: 'flex' }}>
            <Controller
              control={control}
              name="startAt"
              render={({ field, fieldState }): JSX.Element => (
                <FormDateTimePickerField
                  disabled={formState.isSubmitting}
                  field={field}
                  fieldState={fieldState}
                  label={<FormattedMessage {...translations.startAt} />}
                  style={{ flex: 1 }}
                />
              )}
            />
            <Controller
              control={control}
              name="endAt"
              render={({ field, fieldState }): JSX.Element => (
                <FormDateTimePickerField
                  disabled={formState.isSubmitting}
                  field={field}
                  fieldState={fieldState}
                  label={<FormattedMessage {...translations.endAt} />}
                  style={{ flex: 1 }}
                />
              )}
            />
          </div>
        </>
      )}
    </FormDialog>
  );
};

export default AnnouncementForm;
