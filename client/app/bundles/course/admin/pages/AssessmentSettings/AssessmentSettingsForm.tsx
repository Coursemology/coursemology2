import { Controller } from 'react-hook-form';
import { Emits } from 'react-emitter-factory';

import { AssessmentSettingsData } from 'types/course/admin/assessments';
import useTranslation from 'lib/hooks/useTranslation';
import Section from 'lib/components/layouts/Section';
import Subsection from 'lib/components/layouts/Subsection';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import Form, { FormEmitter } from 'lib/components/form/Form';
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
      onSubmit={props.onSubmit}
      initialValues={props.data}
      headsUp
      emitsVia={props.emitsVia}
      disabled={props.disabled}
    >
      {(control): JSX.Element => (
        <>
          <Section title={t(translations.assessmentSettings)} sticksToNavbar>
            <Subsection title={t(translations.allowStudentsToView)} spaced>
              <Controller
                name="showPublicTestCasesOutput"
                control={control}
                render={({ field, fieldState }): JSX.Element => (
                  <FormCheckboxField
                    field={field}
                    fieldState={fieldState}
                    label={t(translations.outputsOfPublicTestCases)}
                    disabled={props.disabled}
                  />
                )}
              />

              <Controller
                name="showStdoutAndStderr"
                control={control}
                render={({ field, fieldState }): JSX.Element => (
                  <FormCheckboxField
                    field={field}
                    fieldState={fieldState}
                    label={t(translations.standardOutputsAndStandardErrors)}
                    disabled={props.disabled}
                  />
                )}
              />
            </Subsection>

            <Subsection
              title={t(translations.randomisation)}
              className="!mt-8"
              spaced
            >
              <Controller
                name="allowRandomization"
                control={control}
                render={({ field, fieldState }): JSX.Element => (
                  <FormCheckboxField
                    field={field}
                    fieldState={fieldState}
                    label={t(translations.enableRandomisedAssessments)}
                    disabled={props.disabled}
                  />
                )}
              />

              <Controller
                name="allowMrqOptionsRandomization"
                control={control}
                render={({ field, fieldState }): JSX.Element => (
                  <FormCheckboxField
                    field={field}
                    fieldState={fieldState}
                    label={t(translations.enableMcqChoicesRandomisations)}
                    disabled={props.disabled}
                  />
                )}
              />
            </Subsection>
          </Section>

          <Section
            title={t(translations.categoriesAndTabs)}
            subtitle={t(translations.categoriesAndTabsSubtitle)}
            sticksToNavbar
          >
            <Controller
              name="categories"
              control={control}
              render={({ field }): JSX.Element => (
                <AssessmentCategoriesManager
                  categories={field.value}
                  onUpdate={field.onChange}
                  disabled={props.disabled}
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
