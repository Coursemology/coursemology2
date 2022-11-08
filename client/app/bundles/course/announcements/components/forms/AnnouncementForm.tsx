import { FC } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Controller, UseFormSetError } from 'react-hook-form';
import * as yup from 'yup';

import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';

import { AnnouncementFormData } from 'types/course/announcements';
import FormDialog from 'lib/components/form/dialog/FormDialog';

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
      open={open}
      editing={editing}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      formName="announcement-form"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(control, formState): JSX.Element => (
        <>
          <div id="announcement-title">
            <Controller
              control={control}
              name="title"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  field={field}
                  fieldState={fieldState}
                  disabled={formState.isSubmitting}
                  label={<FormattedMessage {...translations.title} />}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                  variant="standard"
                />
              )}
            />
          </div>

          <Controller
            name="content"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={<FormattedMessage {...translations.content} />}
                // @ts-ignore: component is still written in JS
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                variant="standard"
              />
            )}
          />
          {canSticky && (
            <Controller
              name="sticky"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormToggleField
                  field={field}
                  fieldState={fieldState}
                  disabled={formState.isSubmitting}
                  label={<FormattedMessage {...translations.sticky} />}
                />
              )}
            />
          )}
          <div style={{ marginBottom: 12 }} />

          <div style={{ display: 'flex' }}>
            <Controller
              name="startAt"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormDateTimePickerField
                  field={field}
                  fieldState={fieldState}
                  disabled={formState.isSubmitting}
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
                  disabled={formState.isSubmitting}
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
