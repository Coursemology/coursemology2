import { FC, useState } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { RadioGroup } from '@mui/material';
import { AnnouncementFormData } from 'types/course/announcements';
import * as yup from 'yup';

import IconRadio from 'lib/components/core/buttons/IconRadio';
import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

export type PublishMode = 'now' | 'later';

interface Props {
  open: boolean;
  editing: boolean;
  title: string;
  initialValues: AnnouncementFormData;
  onClose: () => void;
  onSubmit: (
    data: AnnouncementFormData,
    setError: UseFormSetError<AnnouncementFormData>,
    whenToPublish: PublishMode,
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

const validationSchema = (whenToPublish: PublishMode): yup.AnyObjectSchema =>
  yup.object({
    title: yup.string().required(formTranslations.required),
    content: yup.string().nullable(),
    sticky: yup.bool(),
    startAt: yup.date().nullable().typeError(formTranslations.invalidDate),
    endAt: yup
      .date()
      .nullable()
      .typeError(formTranslations.invalidDate)
      .min(
        yup.ref('startAt'),
        whenToPublish === 'now'
          ? formTranslations.earlierThanCurrentTimeError
          : formTranslations.earlierThanStartTimeError,
      ),
  });

const AnnouncementForm: FC<Props> = (props) => {
  const { open, editing, title, onClose, initialValues, onSubmit, canSticky } =
    props;
  const { t } = useTranslation();
  const [whenToPublish, setWhenToPublish] = useState<PublishMode>('now');

  return (
    <FormDialog
      editing={editing}
      formName="announcement-form"
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={(
        data: AnnouncementFormData,
        setError: UseFormSetError<AnnouncementFormData>,
      ): Promise<void> => onSubmit(data, setError, whenToPublish)}
      open={open}
      title={title}
      validationSchema={validationSchema(whenToPublish)}
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
                label={t(translations.content)}
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
                  label={t(translations.sticky)}
                />
              )}
            />
          )}

          {!editing && (
            <RadioGroup
              onChange={(_, mode): void =>
                setWhenToPublish(mode as PublishMode)
              }
              value={whenToPublish}
            >
              <div className="mb-2 flex space-x-5">
                <div>
                  <IconRadio label={t(translations.publishNow)} value="now" />
                </div>

                <div className="flex space-x-3">
                  <IconRadio
                    label={t(translations.publishAtSetDate)}
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
                          formState.isSubmitting || whenToPublish === 'now'
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

          <div className="flex w-full space-x-10 space-y-1">
            {editing && (
              <div className="flex w-1/3 flex-col">
                {t(translations.startAt)}
                <Controller
                  control={control}
                  name="startAt"
                  render={({ field: innerField, fieldState }): JSX.Element => (
                    <FormDateTimePickerField
                      disabled={
                        formState.isSubmitting || whenToPublish === 'later'
                      }
                      field={innerField}
                      fieldState={fieldState}
                      style={{ flex: 1, alignItems: 'center' }}
                    />
                  )}
                />
              </div>
            )}
            <div className="flex w-1/3 flex-col">
              {t(translations.endAt)}
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
          </div>
        </>
      )}
    </FormDialog>
  );
};

export default AnnouncementForm;
