import { Controller } from 'react-hook-form';
import { Emits } from 'react-emitter-factory';

import {
  AssessmentCategory,
  AssessmentSettingsData,
  AssessmentTab,
} from 'types/course/admin/assessments';
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
  onDeleteCategory?: (
    id: AssessmentCategory['id'],
    title: AssessmentCategory['title'],
  ) => void;
  onDeleteTabInCategory?: (
    id: AssessmentCategory['id'],
    tabId: AssessmentTab['id'],
    title: AssessmentTab['title'],
  ) => void;
  onCreateCategory?: (
    title: AssessmentCategory['title'],
    weight: AssessmentCategory['weight'],
  ) => void;
  onCreateTabInCategory?: (
    id: AssessmentCategory['id'],
    title: AssessmentTab['title'],
    weight: AssessmentTab['weight'],
  ) => void;
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
                  onDeleteCategory={props.onDeleteCategory}
                  onDeleteTabInCategory={props.onDeleteTabInCategory}
                  onCreateCategory={props.onCreateCategory}
                  onCreateTabInCategory={props.onCreateTabInCategory}
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
