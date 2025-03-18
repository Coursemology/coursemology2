import { forwardRef } from 'react';
import { Controller } from 'react-hook-form';
import { InputAdornment, Typography } from '@mui/material';
import { AssessmentSettingsData } from 'types/course/admin/assessments';
import * as yup from 'yup';

import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormRef } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import AssessmentCategoriesManager from './AssessmentCategoriesManager';
import translations from './translations';

interface AssessmentsSettingsFormProps {
  data: AssessmentSettingsData;
  onSubmit?: (data: AssessmentSettingsData) => void;
  disabled?: boolean;
}

const AssessmentsSettingsForm = forwardRef<
  FormRef<AssessmentSettingsData>,
  AssessmentsSettingsFormProps
>((props, ref): JSX.Element => {
  const { t } = useTranslation();
  const validationSchema = yup.object({
    maxProgrammingTimeLimit: yup
      .number()
      .nullable()
      .typeError(t(translations.maxTimeLimitRequired))
      .min(1, t(translations.positiveMaxTimeLimitRequired)),
  });

  return (
    <Form
      ref={ref}
      disabled={props.disabled}
      headsUp
      initialValues={props.data}
      onSubmit={props.onSubmit}
      validates={validationSchema}
    >
      {(control): JSX.Element => (
        <>
          <Section sticksToNavbar title={t(translations.assessmentSettings)}>
            {/* Randomized Assessment is temporarily hidden (PR#5406) */}
            {/* <Controller
                control={control}
                name="allowRandomization"
                render={({ field, fieldState }): JSX.Element => (
                  <FormCheckboxField
                    disabled={props.disabled}
                    field={field}
                    fieldState={fieldState}
                    label={t(translations.enableRandomisedAssessments)}
                  />
                )}
              /> */}

            <Controller
              control={control}
              name="allowMrqOptionsRandomization"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  disabled={props.disabled}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.enableMcqChoicesRandomisations)}
                />
              )}
            />
          </Section>

          <Section
            sticksToNavbar
            title={t(translations.programmingQuestionSettings)}
          >
            <Subsection spaced title={t(translations.allowStudentsToView)}>
              <Controller
                control={control}
                name="showPublicTestCasesOutput"
                render={({ field, fieldState }): JSX.Element => (
                  <FormCheckboxField
                    disabled={props.disabled}
                    field={field}
                    fieldState={fieldState}
                    label={t(translations.outputsOfPublicTestCases)}
                  />
                )}
              />

              <Controller
                control={control}
                name="showStdoutAndStderr"
                render={({ field, fieldState }): JSX.Element => (
                  <FormCheckboxField
                    disabled={props.disabled}
                    field={field}
                    fieldState={fieldState}
                    label={t(translations.standardOutputsAndStandardErrors)}
                  />
                )}
              />
            </Subsection>

            {props.data.maxProgrammingTimeLimit && (
              <div>
                <Controller
                  control={control}
                  name="maxProgrammingTimeLimit"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormTextField
                      disabled={props.disabled}
                      field={field}
                      fieldState={fieldState}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {t(translations.seconds)}
                          </InputAdornment>
                        ),
                      }}
                      label={t(translations.maxProgrammingTimeLimit)}
                      type="number"
                      variant="filled"
                    />
                  )}
                />

                <Typography color="text.secondary" variant="body2">
                  {t(translations.maxProgrammingTimeLimitHint)}
                </Typography>
              </div>
            )}
          </Section>

          <Section
            sticksToNavbar
            subtitle={t(translations.categoriesAndTabsSubtitle)}
            title={t(translations.categoriesAndTabs)}
          >
            <Controller
              control={control}
              name="categories"
              render={({ field }): JSX.Element => (
                <AssessmentCategoriesManager
                  categories={field.value}
                  disabled={props.disabled}
                  onUpdate={field.onChange}
                />
              )}
            />
          </Section>
        </>
      )}
    </Form>
  );
});

AssessmentsSettingsForm.displayName = 'AssessmentsSettingsForm';

export default AssessmentsSettingsForm;
