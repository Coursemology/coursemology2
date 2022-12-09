import { useMemo, useState } from 'react';
import { Emits } from 'react-emitter-factory';
import { Controller } from 'react-hook-form';
import { Button, Grid, RadioGroup, Typography } from '@mui/material';
import { CourseInfo, TimeZones } from 'types/course/admin/course';

import AvatarSelector from 'lib/components/core/AvatarSelector';
import RadioButton from 'lib/components/core/buttons/RadioButton';
import InfoLabel from 'lib/components/core/InfoLabel';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import DeleteCoursePrompt from './DeleteCoursePrompt';
import translations from './translations';
import validationSchema from './validationSchema';

interface CourseSettingsFormProps extends Emits<FormEmitter> {
  data: CourseInfo;
  timeZones: TimeZones;
  onSubmit: (data: CourseInfo) => void;
  onDeleteCourse: () => void;
  onUploadCourseLogo: (image: File, onSuccess: () => void) => void;
  disabled: boolean;
}

const CourseSettingsForm = (props: CourseSettingsFormProps): JSX.Element => {
  const { t } = useTranslation();
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [stagedLogo, setStagedLogo] = useState<File>();

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
      dirty={Boolean(stagedLogo)}
      disabled={props.disabled}
      emitsVia={props.emitsVia}
      headsUp
      initialValues={props.data}
      onReset={(): void => setStagedLogo(undefined)}
      onSubmit={handleSubmit}
      validates={validationSchema}
    >
      {(control, watch): JSX.Element => (
        <>
          <Section sticksToNavbar title={t(translations.courseSettings)}>
            <Controller
              control={control}
              name="title"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={props.disabled}
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  label={t(translations.courseName)}
                  placeholder={t(translations.courseNamePlaceholder)}
                  variant="filled"
                />
              )}
            />

            <Subsection title={t(translations.courseDescription)}>
              <Controller
                control={control}
                name="description"
                render={({ field, fieldState }): JSX.Element => (
                  <FormRichTextField
                    disabled={props.disabled}
                    disableMargins
                    field={field}
                    fieldState={fieldState}
                    fullWidth
                    placeholder={t(translations.courseDescriptionPlaceholder)}
                  />
                )}
              />
            </Subsection>

            <AvatarSelector
              alt={props.data.title}
              defaultImageUrl={watch('logo')}
              disabled={props.disabled}
              onSelectImage={setStagedLogo}
              stagedImage={stagedLogo}
              title={t(translations.courseLogo)}
            />

            <InfoLabel label={t(translations.imageFormatsInfo)} />
          </Section>

          <Section sticksToNavbar title={t(translations.publicity)}>
            <Controller
              control={control}
              name="published"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  description={t(translations.publishedDescription)}
                  disabled={props.disabled}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.published)}
                />
              )}
            />

            <Controller
              control={control}
              name="enrollable"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  disabled={props.disabled}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.allowUsersToSendEnrolmentRequests)}
                />
              )}
            />
          </Section>

          <Section sticksToNavbar title={t(translations.timeSettings)}>
            <Grid columnSpacing={1} container direction="row">
              <Grid item xs>
                <Controller
                  control={control}
                  name="startAt"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormDateTimePickerField
                      disabled={props.disabled}
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
                  control={control}
                  name="endAt"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormDateTimePickerField
                      disabled={props.disabled}
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
              control={control}
              name="timeZone"
              render={({ field, fieldState }): JSX.Element => (
                <FormSelectField
                  disabled={props.disabled}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.timeZone)}
                  native
                  options={timeZonesOptions}
                  variant="filled"
                />
              )}
            />
          </Section>

          <Section sticksToNavbar title={t(translations.courseDelivery)}>
            <Controller
              control={control}
              name="gamified"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  description={t(translations.gamifiedDescription)}
                  disabled={props.disabled}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.gamified)}
                />
              )}
            />

            <Controller
              control={control}
              name="showPersonalizedTimelineFeatures"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  description={t(translations.personalisedTimelinesDescription)}
                  disabled={props.disabled}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.enablePersonalisedTimelines)}
                />
              )}
            />

            {watch('showPersonalizedTimelineFeatures') && (
              <Subsection
                className="!mt-12"
                title={t(translations.defaultTimelineAlgorithm)}
              >
                <Controller
                  control={control}
                  name="defaultTimelineAlgorithm"
                  render={({ field }): JSX.Element => (
                    <RadioGroup {...field} className="space-y-5">
                      <RadioButton
                        className="my-0"
                        description={t(translations.fixedDescription)}
                        disabled={props.disabled}
                        label={t(translations.fixed)}
                        value="fixed"
                      />

                      <RadioButton
                        className="my-0"
                        description={t(translations.fomoDescription)}
                        disabled={props.disabled}
                        label={t(translations.fomo)}
                        value="fomo"
                      />

                      <RadioButton
                        className="my-0"
                        description={t(translations.stragglersDescription)}
                        disabled={props.disabled}
                        label={t(translations.stragglers)}
                        value="stragglers"
                      />

                      <RadioButton
                        className="my-0"
                        description={t(translations.ototDescription)}
                        disabled={props.disabled}
                        label={t(translations.otot)}
                        value="otot"
                      />
                    </RadioGroup>
                  )}
                />
              </Subsection>
            )}

            <Subsection
              className="!mt-12"
              subtitle={t(translations.earlyPreviewDescription)}
              title={t(translations.earlyPreview)}
            >
              <Controller
                control={control}
                name="advanceStartAtDurationDays"
                render={({ field, fieldState }): JSX.Element => (
                  <FormTextField
                    disabled={props.disabled}
                    field={field}
                    fieldState={fieldState}
                    fullWidth
                    label={t(translations.daysInAdvance)}
                    type="number"
                    variant="filled"
                  />
                )}
              />
            </Subsection>
          </Section>

          <Section
            sticksToNavbar
            title={t(translations.deleteCourse)}
            titleColor="error"
          >
            <Typography variant="body2">
              {t(translations.deleteCourseWarning)}
            </Typography>

            <Button
              color="error"
              disabled={props.disabled}
              onClick={(): void => setDeletingCourse(true)}
              variant="outlined"
            >
              {t(translations.deleteThisCourse)}
            </Button>
          </Section>

          <DeleteCoursePrompt
            courseTitle={props.data.title}
            disabled={props.disabled}
            onClose={closeDeleteCoursePrompt}
            onConfirmDelete={props.onDeleteCourse}
            open={deletingCourse}
          />
        </>
      )}
    </Form>
  );
};

export default CourseSettingsForm;
