import {
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Grid,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { Emits } from 'react-emitter-factory';
import { ChangeEventHandler, useMemo, useState } from 'react';

import { CourseInfo, TimeZones } from 'types/course/admin/course';
import useTranslation from 'lib/hooks/useTranslation';
import Section from 'lib/components/layouts/Section';
import Subsection from 'lib/components/layouts/Subsection';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import InfoLabel from 'lib/components/InfoLabel';
import Form, { FormEmitter } from 'lib/components/form/Form';
import Prompt from 'lib/components/Prompt';
import validationSchema from './validationSchema';
import translations from './translations';

interface CourseSettingsFormProps extends Emits<FormEmitter> {
  data: CourseInfo;
  timeZones: TimeZones;
  onSubmit: (data: CourseInfo) => void;
  onDeleteCourse: () => void;
  onUploadCourseLogo: (files: File[]) => void;
}

const CourseSettingsForm = (props: CourseSettingsFormProps): JSX.Element => {
  const { t } = useTranslation();
  const [deletingCourse, setDeletingCourse] = useState(false);

  const closeDeleteCoursePrompt = (): void => setDeletingCourse(false);

  const timeZonesOptions = useMemo(
    () =>
      props.timeZones.map((timeZone) => ({
        value: timeZone.name,
        label: timeZone.displayName,
      })),
    [],
  );

  const uploadCourseLogo: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();

    const input = e.target;
    const files = input.files;
    if (!files) return;

    props.onUploadCourseLogo?.(Array.from(files));

    input.value = '';
  };

  return (
    <Form
      initialValues={props.data}
      onSubmit={props.onSubmit}
      emitsVia={props.emitsVia}
      validates={validationSchema}
      headsUp
    >
      {(control, watch): JSX.Element => (
        <>
          <Section title={t(translations.courseSettings)} sticksToNavbar>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.courseName)}
                  variant="filled"
                  fullWidth
                />
              )}
            />

            <Subsection title={t(translations.courseDescription)}>
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }): JSX.Element => (
                  <FormRichTextField
                    field={field}
                    fieldState={fieldState}
                    fullWidth
                    disableMargins
                  />
                )}
              />
            </Subsection>

            <Subsection
              title={t(translations.courseLogo)}
              contentClassName="flex flex-col items-start"
            >
              <img
                src={watch('logo')}
                className="mb-8 h-48 w-48"
                alt={t(translations.courseLogo)}
              />

              <Button variant="outlined" component="label" className="mb-4">
                {t(translations.uploadANewImage)}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadCourseLogo}
                />
              </Button>

              <InfoLabel label={t(translations.imageFormatsInfo)} />
            </Subsection>
          </Section>

          <Section title={t(translations.publicity)} sticksToNavbar>
            <Controller
              name="published"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.published)}
                  description={t(translations.publishedDescription)}
                />
              )}
            />

            <Controller
              name="enrollable"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.allowUsersToSendEnrolmentRequests)}
                />
              )}
            />
          </Section>

          <Section title={t(translations.timeSettings)} sticksToNavbar>
            <Grid container columnSpacing={1} direction="row">
              <Grid item xs>
                <Controller
                  name="startAt"
                  control={control}
                  render={({ field, fieldState }): JSX.Element => (
                    <FormDateTimePickerField
                      field={field}
                      fieldState={fieldState}
                      label={t(translations.startsAt)}
                      variant="filled"
                    />
                  )}
                />
              </Grid>

              <Grid item xs>
                <Controller
                  name="endAt"
                  control={control}
                  render={({ field, fieldState }): JSX.Element => (
                    <FormDateTimePickerField
                      field={field}
                      fieldState={fieldState}
                      label={t(translations.endsAt)}
                      variant="filled"
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              name="timeZone"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormSelectField
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.timeZone)}
                  variant="filled"
                  options={timeZonesOptions}
                  native
                />
              )}
            />
          </Section>

          <Section title={t(translations.courseDelivery)} sticksToNavbar>
            <Controller
              name="gamified"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.gamified)}
                  description={t(translations.gamifiedDescription)}
                />
              )}
            />

            <Controller
              name="showPersonalizedTimelineFeatures"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.enablePersonalisedTimelines)}
                  description={t(translations.personalisedTimelinesDescription)}
                />
              )}
            />

            {watch('showPersonalizedTimelineFeatures') && (
              <Subsection title={t(translations.defaultTimelineAlgorithm)}>
                <Controller
                  name="defaultTimelineAlgorithm"
                  control={control}
                  render={({ field }): JSX.Element => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        control={<Radio />}
                        value="fixed"
                        label={t(translations.fixed)}
                        className="my-0"
                      />

                      <FormControlLabel
                        control={<Radio />}
                        value="fomo"
                        label={t(translations.fomo)}
                        className="my-0"
                      />

                      <FormControlLabel
                        control={<Radio />}
                        value="stragglers"
                        label={t(translations.stragglers)}
                        className="my-0"
                      />

                      <FormControlLabel
                        control={<Radio />}
                        value="otot"
                        label={t(translations.otot)}
                        className="my-0"
                      />
                    </RadioGroup>
                  )}
                />
              </Subsection>
            )}

            <Subsection
              title={t(translations.earlyPreview)}
              subtitle={t(translations.earlyPreviewDescription)}
            >
              <Controller
                name="advanceStartAtDurationDays"
                control={control}
                render={({ field, fieldState }): JSX.Element => (
                  <FormTextField
                    field={field}
                    fieldState={fieldState}
                    label={t(translations.daysInAdvance)}
                    variant="filled"
                    fullWidth
                    type="number"
                  />
                )}
              />
            </Subsection>
          </Section>

          <Section
            title={t(translations.deleteCourse)}
            sticksToNavbar
            titleColor="error"
          >
            <Typography variant="body2">
              {t(translations.deleteCourseWarning)}
            </Typography>

            <Button
              variant="outlined"
              color="error"
              onClick={(): void => setDeletingCourse(true)}
            >
              {t(translations.deleteThisCourse)}
            </Button>
          </Section>

          <Prompt
            open={deletingCourse}
            title={t(translations.deleteCoursePromptTitle, {
              title: props.data.title,
            })}
            content={t(translations.deleteCourseWarning)}
            primaryAction={t(translations.deleteCourse)}
            primaryActionColor="error"
            onPrimaryAction={props.onDeleteCourse}
            onCancel={closeDeleteCoursePrompt}
          />
        </>
      )}
    </Form>
  );
};

export default CourseSettingsForm;
