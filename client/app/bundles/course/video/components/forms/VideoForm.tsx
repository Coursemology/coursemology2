import { FC, useEffect } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@mui/material';
import ErrorText from 'lib/components/core/ErrorText';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import { VideoEditFormData, VideoFormData } from 'types/course/videos';
import { AppState } from 'types/store';
import { getVideoMetadata, getVideoTabs } from '../../selectors';

interface Props extends WrappedComponentProps {
  handleClose: (isDirty: boolean) => void;
  onSubmit: (
    data: VideoFormData | VideoEditFormData,
    setError: unknown,
  ) => void;
  setIsDirty?: (value: boolean) => void;
  initialValues: IFormInputs;
  childrenExists?: boolean;
}

interface IFormInputs {
  id?: number;
  title: string;
  tab: number;
  description: string;
  url: string;
  startAt: Date;
  published: boolean;
  hasPersonalTimes: boolean;
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
  update: {
    id: 'course.video.form.update',
    defaultMessage: 'Update',
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
    handleClose,
    initialValues,
    onSubmit,
    setIsDirty,
    intl,
    childrenExists,
  } = props;
  const videoTabs = useSelector((state: AppState) => getVideoTabs(state));
  const videoMetadata = useSelector((state: AppState) =>
    getVideoMetadata(state),
  );

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

  const actionButtons = initialValues.id ? (
    <div className="mt-2 flex justify-end">
      <Button
        variant="contained"
        color="primary"
        className="btn-submit"
        disabled={disabled || !isDirty}
        form="video-form"
        key="video-form-update-button"
        type="submit"
      >
        {intl.formatMessage(translations.update)}
      </Button>
    </div>
  ) : (
    <div className="mt-2 flex justify-end">
      <Button
        color="secondary"
        className="btn-cancel"
        disabled={disabled}
        key="video-form-cancel-button"
        onClick={(): void => handleClose(isDirty)}
      >
        {intl.formatMessage(formTranslations.cancel)}
      </Button>
      <Button
        color="primary"
        className="btn-submit"
        disabled={disabled || !isDirty}
        form="video-form"
        key="video-form-submit-button"
        type="submit"
      >
        {intl.formatMessage(formTranslations.submit)}
      </Button>
    </div>
  );
  return (
    <>
      <form
        encType="multipart/form-data"
        id="video-form"
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
              label={intl.formatMessage(translations.title)}
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
          name="tab"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormSelectField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(translations.tab)}
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
              disabled={disabled}
              label={intl.formatMessage(translations.description)}
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
              disabled={disabled}
              label={intl.formatMessage(translations.url)}
              // @ts-ignore: component is still written in JS
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              required
              variant="standard"
              placeholder={intl.formatMessage(translations.urlPlaceholder)}
              helperText={
                childrenExists
                  ? intl.formatMessage(translations.urlChangeWarning)
                  : null
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
              disabled={disabled}
              label={intl.formatMessage(translations.startAt)}
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
              label={intl.formatMessage(translations.published)}
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
                disabled={disabled}
                label={intl.formatMessage(translations.hasPersonalTimes)}
              />
            )}
          />
        )}
        {actionButtons}
      </form>
    </>
  );
};

export default injectIntl(VideoForm);
