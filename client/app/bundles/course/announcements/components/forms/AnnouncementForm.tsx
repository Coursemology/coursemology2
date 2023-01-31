import { FC } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
// import AccessTimeIcon from '@mui/icons-material/AccessTime';
// import SendIcon from '@mui/icons-material/Send';
import { RadioGroup } from '@mui/material';
import { AnnouncementFormData } from 'types/course/announcements';
import * as yup from 'yup';

import IconRadio from 'lib/components/core/buttons/IconRadio';
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
  ) => Promise<void>;
  canSticky: boolean;
}

const translations = defineMessages({
  title: {
    id: 'course.announcements.AnnouncementForm.title',
    defaultMessage: 'Title',
  },
  content: {
    id: 'course.announcements.AnnouncementForm.content',
    defaultMessage: 'Content',
  },
  sticky: {
    id: 'course.announcements.AnnouncementForm.sticky',
    defaultMessage: 'Sticky',
  },
  startAt: {
    id: 'course.announcements.AnnouncementForm.startAt',
    defaultMessage: 'Start At',
  },
  endAt: {
    id: 'course.announcements.AnnouncementForm.endAt',
    defaultMessage: 'End At',
  },
  endTimeError: {
    id: 'course.announcements.AnnouncementForm.endTimeError',
    defaultMessage: 'End time cannot be earlier than start time',
  },
  publishNow: {
    id: 'course.announcements.AnnouncementForm.publishNow',
    defaultMessage: 'Publish Now',
  },
  publishAtSetDate: {
    id: 'course.announcements.AnnouncementForm.publishAtSetDate',
    defaultMessage: 'Publish At:',
  },
});

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  content: yup.string().nullable(),
  sticky: yup.bool(),
  whenToPublish: yup.string().oneOf(['now', 'later']),
  startAt: yup
    .date()
    .nullable()
    .typeError(formTranslations.invalidDate)
    .min(
      new Date(new Date().setSeconds(0, 0)),
      formTranslations.startDateValidationError,
    ),
  endAt: yup.date().nullable().typeError(formTranslations.invalidDate),
});

const AnnouncementForm: FC<Props> = (props) => {
  const { open, editing, title, onClose, initialValues, onSubmit, canSticky } =
    props;

  const intl = useIntl();

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
      {(control, formState, watch): JSX.Element => (
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

          {!editing && (
            <Controller
              control={control}
              name="whenToPublish"
              render={({ field }): JSX.Element => (
                <RadioGroup {...field}>
                  <div className="mb-2 flex space-x-5">
                    <div>
                      <IconRadio
                        label={intl.formatMessage(translations.publishNow)}
                        value="now"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <IconRadio
                        label={intl.formatMessage(
                          translations.publishAtSetDate,
                        )}
                        value="later"
                      />
                      <Controller
                        control={control}
                        name="startAt"
                        render={({
                          field: innerField,
                          fieldState,
                        }): JSX.Element => (
                          <FormDateTimePickerField
                            disabled={
                              formState.isSubmitting ||
                              watch('whenToPublish') === 'now'
                            }
                            field={innerField}
                            fieldState={fieldState}
                            style={{ flex: 1, alignItems: 'center' }}
                          />
                        )}
                      />
                    </div>
                  </div>
                </RadioGroup>
              )}
            />
          )}

          <div className="flex w-1/3 flex-col space-y-1">
            <FormattedMessage {...translations.endAt} />
            <Controller
              control={control}
              name="endAt"
              render={({ field, fieldState }): JSX.Element => (
                <div>
                  <FormDateTimePickerField
                    disabled={formState.isSubmitting}
                    field={field}
                    fieldState={fieldState}
                    style={{ flex: 1 }}
                  />
                </div>
              )}
            />
          </div>
        </>
      )}
    </FormDialog>
  );
};

export default AnnouncementForm;
