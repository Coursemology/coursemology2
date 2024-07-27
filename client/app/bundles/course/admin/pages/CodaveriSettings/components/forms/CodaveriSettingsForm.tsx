import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { RadioGroup } from '@mui/material';
import { CodaveriSettingsEntity } from 'types/course/admin/codaveri';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { updateCodaveriSettings } from '../../operations';
import translations from '../../translations';

interface CodaveriSettingsFormProps {
  settings: CodaveriSettingsEntity;
}

const CodaveriSettingsForm = (
  props: CodaveriSettingsFormProps,
): JSX.Element => {
  const { settings } = props;
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormEmitter<CodaveriSettingsEntity>>();
  const disabled = submitting;

  const handleSubmit = (data: CodaveriSettingsEntity): void => {
    setSubmitting(true);

    updateCodaveriSettings(data)
      .then((newData) => {
        if (!newData) return;
        form?.resetTo?.(newData);
        toast.success(t(formTranslations.changesSaved));
      })
      .catch(form?.receiveErrors)
      .finally(() => setSubmitting(false));
  };

  return (
    <Form
      className="!pb-0"
      disabled={disabled}
      emitsVia={setForm}
      headsUp
      initialValues={settings}
      onSubmit={handleSubmit}
    >
      {(control): JSX.Element => (
        <Section
          contentClassName="flex flex-col space-y-3"
          sticksToNavbar
          subtitle={t(translations.codaveriSettingsSubtitle)}
          title={t(translations.codaveriSettings)}
        >
          <Controller
            control={control}
            name="liveFeedbackEnabled"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={
                  field.value
                    ? t(translations.liveFeedbackEnabledDescription)
                    : t(translations.liveFeedbackDisabledDescription)
                }
                field={field}
                fieldState={fieldState}
                label={t(translations.liveFeedbackEnabled)}
              />
            )}
          />
          <Subsection
            subtitle={t(translations.feedbackWorkflowDescription)}
            title={t(translations.feedbackWorkflow)}
          >
            <Controller
              control={control}
              name="feedbackWorkflow"
              render={({ field }): JSX.Element => (
                <RadioGroup className="space-y-5" {...field}>
                  <RadioButton
                    className="my-0"
                    disabled={disabled}
                    label={t(translations.feedbackWorkflowDraft)}
                    value="draft"
                  />

                  <RadioButton
                    className="my-0"
                    disabled={disabled}
                    label={t(translations.feedbackWorkflowPublish)}
                    value="publish"
                  />

                  <RadioButton
                    className="my-0"
                    disabled={disabled}
                    label={t(translations.feedbackWorkflowNone)}
                    value="none"
                  />
                </RadioGroup>
              )}
            />
          </Subsection>

          <Subsection
            subtitle={t(translations.codaveriEngineDescription)}
            title={t(translations.codaveriEngine)}
          >
            <Controller
              control={control}
              name="isOnlyITSP"
              render={({ field }): JSX.Element => (
                <RadioGroup className="space-y-5" {...field}>
                  <RadioButton
                    className="my-0"
                    description={t(translations.defaultEngineDescription)}
                    disabled={disabled}
                    label={t(translations.defaultEngine)}
                    value="default"
                  />

                  <RadioButton
                    className="my-0"
                    description={t(translations.itspEngineDescription)}
                    disabled={disabled}
                    label={t(translations.itspEngine)}
                    value="itsp"
                  />
                </RadioGroup>
              )}
            />
          </Subsection>
        </Section>
      )}
    </Form>
  );
};

export default CodaveriSettingsForm;
