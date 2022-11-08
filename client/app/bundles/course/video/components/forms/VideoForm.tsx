import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Controller, UseFormSetError } from 'react-hook-form';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import formTranslations from 'lib/translations/form';
import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import useTranslation from 'lib/hooks/useTranslation';
import { VideoFormData } from 'types/course/videos';
import { AppState } from 'types/store';
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
      open={open}
      editing={editing}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      formName="video-form"
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
            name="tab"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormSelectField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={t(translations.tab)}
                options={videoTabs.map((tab) => ({
                  value: tab.id,
                  label: tab.title,
                }))}
                margin="0"
                shrink
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
            control={control}
            name="url"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={t(translations.url)}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                required
                variant="standard"
                placeholder={t(translations.urlPlaceholder)}
                helperText={
                  childrenExists ? t(translations.urlChangeWarning) : null
                }
              />
            )}
          />

          <Controller
            name="startAt"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormDateTimePickerField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={t(translations.startAt)}
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

          {/* Videos cannot affect personal times because we have no clean measure of when they "complete" the video */}
          {videoMetadata.showPersonalizedTimelineFeatures && (
            <Controller
              name="hasPersonalTimes"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormToggleField
                  field={field}
                  fieldState={fieldState}
                  disabled={formState.isSubmitting}
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
