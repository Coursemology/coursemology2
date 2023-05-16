import { FC } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { VideoFormData } from 'types/course/videos';
import * as yup from 'yup';

import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import { useAppSelector } from 'lib/hooks/store';
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
  ) => Promise<void>;
  initialValues: VideoFormData;
  childrenExists?: boolean;
}

const translations = defineMessages({
  title: {
    id: 'course.video.VideoForm.title',
    defaultMessage: 'Title',
  },
  tab: {
    id: 'course.video.VideoForm.tab',
    defaultMessage: 'Tab',
  },
  description: {
    id: 'course.video.VideoForm.description',
    defaultMessage: 'Description',
  },
  url: {
    id: 'course.video.VideoForm.url',
    defaultMessage: 'URL',
  },
  startAt: {
    id: 'course.video.VideoForm.startAt',
    defaultMessage: 'Start at',
  },
  published: {
    id: 'course.video.VideoForm.published',
    defaultMessage: 'Published',
  },
  hasTodo: {
    id: 'course.video.VideoForm.hasTodo',
    defaultMessage: 'Has TODO',
  },
  hasTodoHint: {
    id: 'course.video.VideoForm.hasTodoHint',
    defaultMessage:
      'When enabled, students will see this video in their TODO list.',
  },
  hasPersonalTimes: {
    id: 'course.video.VideoForm.hasPersonalTimes',
    defaultMessage: 'Has personal times',
  },
  hasPersonalTimesHint: {
    id: 'course.video.VideoForm.hasPersonalTimesHint',
    defaultMessage:
      'Timings for this item will be automatically adjusted for users based on learning rate.',
  },
  urlPlaceholder: {
    id: 'course.video.VideoForm.urlPlaceholder',
    defaultMessage:
      'Please provide a valid youtube URL, eg. https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  urlChangeWarning: {
    id: 'course.video.VideoForm.urlChangeWarning',
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
  hasTodo: yup.bool(),
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
  const videoTabs = useAppSelector(getVideoTabs);
  const videoMetadata = useAppSelector(getVideoMetadata);

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
        <div className="space-y-5">
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
                shrink
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
            name="url"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth
                helperText={
                  childrenExists ? t(translations.urlChangeWarning) : null
                }
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(translations.url)}
                placeholder={t(translations.urlPlaceholder)}
                required
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
              <FormCheckboxField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                label={t(translations.published)}
              />
            )}
          />

          <Controller
            control={control}
            name="hasTodo"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={t(translations.hasTodoHint)}
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                label={t(translations.hasTodo)}
              />
            )}
          />

          {/* Videos cannot affect personal times because we have no clean measure of when they "complete" the video */}
          {videoMetadata.showPersonalizedTimelineFeatures && (
            <Controller
              control={control}
              name="hasPersonalTimes"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  description={t(translations.hasPersonalTimesHint)}
                  disabled={formState.isSubmitting}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.hasPersonalTimes)}
                />
              )}
            />
          )}
        </div>
      )}
    </FormDialog>
  );
};

export default VideoForm;
