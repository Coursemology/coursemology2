import { Emits } from 'react-emitter-factory';
import { Controller } from 'react-hook-form';
import { AssessmentSettingsData } from 'types/course/admin/assessments';

import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import AssessmentCategoriesManager from './AssessmentCategoriesManager';
import translations from './translations';

interface AssessmentsSettingsFormProps extends Emits<FormEmitter> {
  data: AssessmentSettingsData;
  onSubmit?: (data: AssessmentSettingsData) => void;
  disabled?: boolean;
}

const AssessmentsSettingsForm = (
  props: AssessmentsSettingsFormProps,
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Form
      disabled={props.disabled}
      emitsVia={props.emitsVia}
      headsUp
      initialValues={props.data}
      onSubmit={props.onSubmit}
    >
      {(control): JSX.Element => (
        <>
          <Section sticksToNavbar title={t(translations.assessmentSettings)}>
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

            <Subsection
              className="!mt-8"
              spaced
              title={t(translations.randomisation)}
            >
              <Controller
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
              />

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
            </Subsection>
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
};

export default AssessmentsSettingsForm;
