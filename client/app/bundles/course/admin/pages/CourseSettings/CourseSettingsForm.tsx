import { Button, RadioGroup, Typography, Grid } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Emits } from 'react-emitter-factory';
import { useMemo, useState } from 'react';

import { CourseInfo, TimeZones } from 'types/course/admin/course';
import useTranslation from 'lib/hooks/useTranslation';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import InfoLabel from 'lib/components/core/InfoLabel';
import Form, { FormEmitter } from 'lib/components/form/Form';
import RadioButton from 'lib/components/core/buttons/RadioButton';
import AvatarSelector from 'lib/components/core/AvatarSelector';
import validationSchema from './validationSchema';
import translations from './translations';
import DeleteCoursePrompt from './DeleteCoursePrompt';

interface CourseSettingsFormProps extends Emits<FormEmitter> {
  data: CourseInfo;
  timeZones: TimeZones;
  onSubmit: (data: CourseInfo) => void;
  onDeleteCourse: () => void;
  onUploadCourseLogo: (image: Blob, onSuccess: () => void) => void;
  disabled: boolean;
}

const CourseSettingsForm = (props: CourseSettingsFormProps): JSX.Element => {
  const { t } = useTranslation();
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [stagedLogo, setStagedLogo] = useState<Blob>();

  const closeDeleteCoursePrompt = (): void => setDeletingCourse(false);

  const timeZonesOptions = useMemo(
    () =>
      props.timeZones.map((timeZone) => ({
        value: timeZone.name,
        label: timeZone.displayName,
      })),
    [],
  );

  const handleSubmit = (data: CourseInfo): void => {
    if (stagedLogo) {
      props.onUploadCourseLogo(stagedLogo, () => {
        setStagedLogo(undefined);
        props.onSubmit(data);
      });
    } else {
      props.onSubmit(data);
    }
  };

  return (
    <Form
      initialValues={props.data}
      onSubmit={handleSubmit}
      emitsVia={props.emitsVia}
      validates={validationSchema}
      headsUp
      disabled={props.disabled}
      dirty={Boolean(stagedLogo)}
      onReset={(): void => setStagedLogo(undefined)}
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
                  disabled={props.disabled}
                  placeholder={t(translations.courseNamePlaceholder)}
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
                    disabled={props.disabled}
                    placeholder={t(translations.courseDescriptionPlaceholder)}
                  />
                )}
              />
            </Subsection>

            <AvatarSelector
              title={t(translations.courseLogo)}
              defaultImageUrl={watch('logo')}
              stagedImage={stagedLogo}
              onSelectImage={setStagedLogo}
              disabled={props.disabled}
            />

            <InfoLabel label={t(translations.imageFormatsInfo)} />
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
                  disabled={props.disabled}
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
                  disabled={props.disabled}
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
                      disabled={props.disabled}
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
                      disabled={props.disabled}
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
                  disabled={props.disabled}
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
                  disabled={props.disabled}
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
                  disabled={props.disabled}
                />
              )}
            />

            {watch('showPersonalizedTimelineFeatures') && (
              <Subsection
                title={t(translations.defaultTimelineAlgorithm)}
                className="!mt-12"
              >
                <Controller
                  name="defaultTimelineAlgorithm"
                  control={control}
                  render={({ field }): JSX.Element => (
                    <RadioGroup {...field} className="space-y-5">
                      <RadioButton
                        value="fixed"
                        label={t(translations.fixed)}
                        description={t(translations.fixedDescription)}
                        className="my-0"
                        disabled={props.disabled}
                      />

                      <RadioButton
                        value="fomo"
                        label={t(translations.fomo)}
                        description={t(translations.fomoDescription)}
                        className="my-0"
                        disabled={props.disabled}
                      />

                      <RadioButton
                        value="stragglers"
                        label={t(translations.stragglers)}
                        description={t(translations.stragglersDescription)}
                        className="my-0"
                        disabled={props.disabled}
                      />

                      <RadioButton
                        value="otot"
                        label={t(translations.otot)}
                        description={t(translations.ototDescription)}
                        className="my-0"
                        disabled={props.disabled}
                      />
                    </RadioGroup>
                  )}
                />
              </Subsection>
            )}

            <Subsection
              title={t(translations.earlyPreview)}
              subtitle={t(translations.earlyPreviewDescription)}
              className="!mt-12"
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
                    disabled={props.disabled}
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
              disabled={props.disabled}
            >
              {t(translations.deleteThisCourse)}
            </Button>
          </Section>

          <DeleteCoursePrompt
            open={deletingCourse}
            onClose={closeDeleteCoursePrompt}
            courseTitle={props.data.title}
            onConfirmDelete={props.onDeleteCourse}
            disabled={props.disabled}
          />
        </>
      )}
    </Form>
  );
};

export default CourseSettingsForm;
