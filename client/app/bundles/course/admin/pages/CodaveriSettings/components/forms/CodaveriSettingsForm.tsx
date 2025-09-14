import { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { RadioGroup, Typography } from '@mui/material';
import { CodaveriSettingsEntity } from 'types/course/admin/codaveri';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormRef } from 'lib/components/form/Form';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';
import messageTranslations from 'lib/translations/messages';

import { updateCodaveriSettings } from '../../operations';
import translations from '../../translations';

interface CodaveriSettingsFormProps {
  settings: CodaveriSettingsEntity;
  availableModels: string[];
}

const CodaveriSettingsForm = (
  props: CodaveriSettingsFormProps,
): JSX.Element => {
  const { settings, availableModels } = props;
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<FormRef<CodaveriSettingsEntity>>(null);
  const disabled = submitting;

  const handleSubmit = (data: CodaveriSettingsEntity): void => {
    setSubmitting(true);

    updateCodaveriSettings(data)
      .then((newData) => {
        if (!newData) return;
        formRef.current?.resetTo?.(newData);
        toast.success(t(formTranslations.changesSaved));
      })
      .catch(formRef.current?.receiveErrors)
      .finally(() => setSubmitting(false));
  };

  return (
    <Form
      ref={formRef}
      className="!pb-0"
      disabled={disabled}
      headsUp
      initialValues={settings}
      onSubmit={handleSubmit}
    >
      {(control): JSX.Element => (
        <Section
          contentClassName="flex flex-col space-y-8"
          sticksToNavbar
          subtitle={t(translations.codaveriSettingsSubtitle)}
          title={t(translations.codaveriSettings)}
        >
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
                    description={
                      <>
                        {t(translations.itspEngineDescription)} <br />
                        <Typography color="error" variant="caption">
                          {t(messageTranslations.featureUnavailable)}
                        </Typography>
                      </>
                    }
                    disabled
                    label={t(translations.itspEngine)}
                    value="itsp"
                  />
                </RadioGroup>
              )}
            />
          </Subsection>

          {settings.adminSettings && (
            <Subsection
              subtitle={t(translations.codaveriModelDescription)}
              title={t(translations.codaveriModel)}
            >
              <Controller
                control={control}
                name="adminSettings.model"
                render={({ field, fieldState }): JSX.Element => (
                  <FormSelectField
                    disabled={disabled}
                    field={field}
                    fieldState={fieldState}
                    native
                    options={availableModels.map((model) => ({
                      label: model,
                      value: model,
                    }))}
                    variant="outlined"
                  />
                )}
              />
            </Subsection>
          )}

          {settings.adminSettings && (
            <Subsection title={t(translations.codaveriSystemPrompt)}>
              <Typography color="text.secondary" variant="body2">
                {t(translations.codaveriSystemPromptDescription, {
                  br: <br />,
                })}
                <ul>
                  <li>
                    {t(
                      translations.codaveriSystemPromptProblemDescriptionLine,
                      {
                        problemDescriptionVar: (
                          <code>&#123;problemDescription&#125;</code>
                        ),
                      },
                    )}
                  </li>
                  <li>
                    {t(translations.codaveriSystemPromptStudentFilePathsLine, {
                      studentFilePathsVar: (
                        <code>&#123;studentFilePaths&#125;</code>
                      ),
                    })}
                  </li>
                </ul>
              </Typography>
              <Controller
                control={control}
                name="adminSettings.systemPrompt"
                render={({ field, fieldState }): JSX.Element => (
                  <FormTextField
                    disabled={disabled}
                    field={field}
                    fieldState={fieldState}
                    fullWidth
                    inputProps={{
                      maxLength: 500,
                    }}
                    multiline
                    rows={8}
                    variant="outlined"
                  />
                )}
              />
            </Subsection>
          )}
        </Section>
      )}
    </Form>
  );
};

export default CodaveriSettingsForm;
