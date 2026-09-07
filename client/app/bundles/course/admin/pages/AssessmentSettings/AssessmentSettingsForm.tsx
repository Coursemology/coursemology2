import { forwardRef } from 'react';
import { Controller } from 'react-hook-form';
import { InputAdornment, Typography } from '@mui/material';
import { AssessmentSettingsData } from 'types/course/admin/assessments';
import * as yup from 'yup';

import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormSelectField from 'lib/components/form/fields/SelectField';
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
    rubricGradingPrompt: yup.string().when('rubricGradingPromptEnabled', {
      is: true,
      then: yup
        .string()
        .trim()
        .required(t(translations.rubricGradingPromptRequired)),
    }),
    // Mirrors the server-side check: the options must parse to a JSON object when they are in use. Which
    // keys a model accepts is the provider's business, so only shape is validated.
    rubricGradingModelOptions: yup
      .string()
      .nullable()
      .when('rubricGradingModelOptionsEnabled', {
        is: true,
        then: yup
          .string()
          .trim()
          .required(t(translations.modelOptionsRequired))
          .test(
            'is-json-object',
            t(translations.modelOptionsMustBeJsonObject),
            (value) => {
              try {
                const parsed = JSON.parse(value ?? '');
                return (
                  typeof parsed === 'object' &&
                  parsed !== null &&
                  !Array.isArray(parsed)
                );
              } catch {
                return false;
              }
            },
          ),
      }),
    rubricGradingSystemPrompt: yup
      .string()
      .nullable()
      .when('rubricGradingSystemPromptEnabled', {
        is: true,
        then: yup
          .string()
          .trim()
          .required(t(translations.systemPromptRequired)),
      }),
  });

  // The server resolves an unconfigured course to the default model, so there is no "use default" entry --
  // the picker always shows the model that grading will actually run on.
  const gradingModels = (props.data.availableGradingModels ?? []).map(
    (model) => ({ label: model, value: model }),
  );

  return (
    <Form
      ref={ref}
      disabled={props.disabled}
      headsUp
      initialValues={props.data}
      onSubmit={props.onSubmit}
      validates={validationSchema}
    >
      {(control, watch): JSX.Element => (
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

          <Section sticksToNavbar title={t(translations.rubricGrading)}>
            {props.data.canManageAiGradingSettings && (
              <>
                <Subsection title={t(translations.gradingModel)}>
                  <Controller
                    control={control}
                    name="rubricGradingModel"
                    render={({ field, fieldState }): JSX.Element => (
                      <FormSelectField
                        disabled={props.disabled}
                        field={field}
                        fieldState={fieldState}
                        margin="0px"
                        native
                        options={gradingModels}
                        variant="outlined"
                      />
                    )}
                  />
                </Subsection>

                <Controller
                  control={control}
                  name="rubricGradingModelOptionsEnabled"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormCheckboxField
                      disabled={props.disabled}
                      field={field}
                      fieldState={fieldState}
                      label={t(translations.useModelOptions)}
                    />
                  )}
                />

                <Typography
                  className={
                    watch('rubricGradingModelOptionsEnabled')
                      ? ''
                      : 'opacity-50'
                  }
                  color="text.secondary"
                  variant="body2"
                >
                  {t(translations.modelOptionsHint, {
                    example: '{"reasoning": {"effort": "high"}}',
                  })}
                </Typography>

                <Controller
                  control={control}
                  name="rubricGradingModelOptions"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormTextField
                      disabled={
                        props.disabled ||
                        !watch('rubricGradingModelOptionsEnabled')
                      }
                      field={field}
                      fieldState={fieldState}
                      fullWidth
                      InputProps={{
                        className: 'font-mono text-[1.3rem]',
                        // The browser's resize grabber on the raw textarea escapes the field's outline.
                        sx: { '& textarea': { resize: 'none' } },
                      }}
                      multiline
                      rows={4}
                      spellCheck={false}
                      variant="outlined"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="rubricGradingSystemPromptEnabled"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormCheckboxField
                      disabled={props.disabled}
                      field={field}
                      fieldState={fieldState}
                      label={t(translations.useSystemPrompt)}
                    />
                  )}
                />

                <div
                  className={
                    watch('rubricGradingSystemPromptEnabled')
                      ? 'space-y-3'
                      : 'space-y-3 opacity-50'
                  }
                >
                  <Typography color="text.secondary" variant="body2">
                    {t(translations.systemPromptOverrideHint)}
                  </Typography>

                  <Typography color="text.secondary" variant="body2">
                    {t(translations.systemPromptVariablesHint, {
                      variables: (props.data.gradingSystemPromptVariables ?? [])
                        .map((variable) => `{${variable}}`)
                        .join(', '),
                    })}
                  </Typography>
                </div>

                <Controller
                  control={control}
                  name="rubricGradingSystemPrompt"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormTextField
                      disabled={
                        props.disabled ||
                        !watch('rubricGradingSystemPromptEnabled')
                      }
                      field={field}
                      fieldState={fieldState}
                      fullWidth
                      InputProps={{
                        className: 'font-mono text-[1.3rem]',
                        // The browser's resize grabber on the raw textarea escapes the field's outline.
                        sx: { '& textarea': { resize: 'none' } },
                      }}
                      multiline
                      placeholder={props.data.defaultGradingSystemPrompt}
                      rows={6}
                      variant="outlined"
                    />
                  )}
                />
              </>
            )}

            <Controller
              control={control}
              name="rubricGradingPromptEnabled"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  disabled={props.disabled}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.useRubricGradingPrompt)}
                />
              )}
            />

            <Typography
              className={
                watch('rubricGradingPromptEnabled') ? '' : 'opacity-50'
              }
              color="text.secondary"
              variant="body2"
            >
              {t(translations.rubricGradingPromptHint)}
            </Typography>

            <Controller
              control={control}
              name="rubricGradingPrompt"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={
                    props.disabled || !watch('rubricGradingPromptEnabled')
                  }
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  multiline
                  rows={6}
                  variant="outlined"
                />
              )}
            />
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
