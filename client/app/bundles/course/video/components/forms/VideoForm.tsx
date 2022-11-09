import { FC } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { useSelector } from 'react-redux';
import { VideoFormData } from 'types/course/videos';
import { AppState } from 'types/store';
import * as yup from 'yup';

import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { getVideoMetadata, getVideoTabs } from '../../selectors';

interface Props {
  open: boolean;
  editing: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (
    data: VideoFormData,
    setError: UseFormSetError<VideoFormData>,
  ) => void;
  initialValues: VideoFormData;
  childrenExists?: boolean;
}

const translations = defineMessages({
  title: {
    id: 'course.video.form.title',
    defaultMessage: 'Title',
  },
  tab: {
    id: 'course.video.form.tab',
    defaultMessage: 'Tab',
  },
  description: {
    id: 'course.video.form.description',
    defaultMessage: 'Description',
  },
  url: {
    id: 'course.video.form.url',
    defaultMessage: 'URL',
  },
  startAt: {
    id: 'course.video.form.startAt',
    defaultMessage: 'Start at',
  },
  published: {
    id: 'course.video.form.published',
    defaultMessage: 'Published',
  },
  hasPersonalTimes: {
    id: 'course.video.form.hasPersonalTimes',
    defaultMessage: 'Has personal times',
  },
  urlPlaceholder: {
    id: 'course.video.form.urlPlaceholder',
    defaultMessage:
      'Please provide a valid youtube URL, eg. https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  urlChangeWarning: {
    id: 'course.video.form.urlChangeWarning',
    defaultMessage:
      ' Warning: Changing url for this video would cause all its submissions and sessions data to be destroyed.',
  },
});

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  description: yup.string().nullable(),
  url: yup.string().required(formTranslations.required),
  startAt: yup.date().nullable().typeError(formTranslations.invalidDate),
  published: yup.bool(),
  hasPersonalTimes: yup.bool(),
});

const VideoForm: FC<Props> = (props) => {
  const {
    open,
    editing,
    title,
    onClose,
    initialValues,
    onSubmit,
    childrenExists,
  } = props;
  const { t } = useTranslation();
  const videoTabs = useSelector((state: AppState) => getVideoTabs(state));
  const videoMetadata = useSelector((state: AppState) =>
    getVideoMetadata(state),
  );

  return (
    <FormDialog
      editing={editing}
      formName="video-form"
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
                fullWidth={true}
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(translations.title)}
                required={true}
                variant="standard"
              />
            )}
          />

          <Controller
            control={control}
            name="tab"
            render={({ field, fieldState }): JSX.Element => (
              <FormSelectField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                label={t(translations.tab)}
                margin="0"
                options={videoTabs.map((tab) => ({
                  value: tab.id,
                  label: tab.title,
                }))}
                shrink={true}
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
                fullWidth={true}
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
            name="url"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth={true}
                helperText={
                  childrenExists ? t(translations.urlChangeWarning) : null
                }
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(translations.url)}
                placeholder={t(translations.urlPlaceholder)}
                required={true}
                variant="standard"
              />
            )}
          />

          <Controller
            control={control}
            name="startAt"
            render={({ field, fieldState }): JSX.Element => (
              <FormDateTimePickerField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                label={t(translations.startAt)}
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

          {/* Videos cannot affect personal times because we have no clean measure of when they "complete" the video */}
          {videoMetadata.showPersonalizedTimelineFeatures && (
            <Controller
              control={control}
              name="hasPersonalTimes"
              render={({ field, fieldState }): JSX.Element => (
                <FormToggleField
                  disabled={formState.isSubmitting}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.hasPersonalTimes)}
                />
              )}
            />
          )}
        </>
      )}
    </FormDialog>
  );
};

export default VideoForm;
