import { useRef, useState } from 'react';
import { Control, Controller, UseFormWatch } from 'react-hook-form';
import { RadioGroup, Typography } from '@mui/material';
import { CodaveriSettingsEntity } from 'types/course/admin/codaveri';
import { object, string } from 'yup';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormRef } from 'lib/components/form/Form';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { updateCodaveriSettings } from '../../operations';
import translations from '../../translations';

interface CodaveriSettingsFormProps {
  settings: CodaveriSettingsEntity;
  availableModels: string[];
}

const validationSchema = object({
  adminSettings: object({
    systemPrompt: string().test({
      name: 'custom-system-prompt-nonempty',
      message: translations.codaveriEmptySystemPrompt,
      test: (value, testContext) => {
        return (
          testContext.parent.useSystemPrompt !== 'override' ||
          Boolean(value?.trim()?.length)
        );
      },
    }),
  }),
});

interface FormFieldProps {
  control: Control<CodaveriSettingsEntity>;
  disabled: boolean;
}

const FeedbackWorkflowField = (props: FormFieldProps): JSX.Element => {
  const { control, disabled } = props;
  const { t } = useTranslation();
  return (
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
  );
};

const ModelField = (
  props: FormFieldProps & { availableModels: string[] },
): JSX.Element => {
  const { availableModels, control, disabled } = props;
  const { t } = useTranslation();
  return (
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
  );
};

const SystemPromptField = (props: FormFieldProps): JSX.Element => {
  const { control, disabled } = props;
  const { t } = useTranslation();

  return (
    <>
      <Typography className={disabled ? 'opacity-50' : ''} variant="body2">
        {t(translations.codaveriOverrideSystemPromptDescription)}
        <ul>
          <li>
            {t(translations.codaveriSystemPromptProblemDescriptionLine, {
              problemDescriptionVar: (
                <code>&#123;problemDescription&#125;</code>
              ),
            })}
          </li>
          <li>
            {t(translations.codaveriSystemPromptStudentFilePathsLine, {
              studentFilePathsVar: <code>&#123;studentFilePaths&#125;</code>,
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
    </>
  );
};

const OverrideSystemPromptField = (
  props: FormFieldProps & { watch: UseFormWatch<CodaveriSettingsEntity> },
): JSX.Element => {
  const { control, watch, disabled } = props;
  const { t } = useTranslation();

  return (
    <Subsection
      subtitle={t(translations.codaveriSystemPromptDescription)}
      title={t(translations.codaveriSystemPrompt)}
    >
      <Controller
        control={control}
        name="adminSettings.useSystemPrompt"
        render={({ field }): JSX.Element => (
          <RadioGroup className="space-y-5" {...field}>
            <RadioButton
              className="my-0"
              disabled={disabled}
              label={t(translations.codaveriUseDefaultSystemPrompt)}
              value="default"
            />

            <RadioButton
              className="my-0 items-start"
              disabled={disabled}
              label={
                <>
                  <Typography variant="body1">
                    {t(translations.codaveriOverrideSystemPrompt)}
                  </Typography>

                  <SystemPromptField
                    control={control}
                    disabled={
                      disabled ||
                      watch('adminSettings.useSystemPrompt') !== 'override'
                    }
                  />
                </>
              }
              value="override"
            />
          </RadioGroup>
        )}
      />
    </Subsection>
  );
};

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
      validates={settings.adminSettings ? validationSchema : undefined}
    >
      {(control, watch): JSX.Element => {
        return (
          <Section
            contentClassName="flex flex-col space-y-8"
            sticksToNavbar
            subtitle={t(translations.codaveriSettingsSubtitle)}
            title={t(translations.codaveriSettings)}
          >
            <FeedbackWorkflowField control={control} disabled={disabled} />
            {settings.adminSettings && (
              <ModelField
                availableModels={availableModels}
                control={control}
                disabled={disabled}
              />
            )}

            {settings.adminSettings && (
              <OverrideSystemPromptField
                control={control}
                disabled={disabled}
                watch={watch}
              />
            )}
          </Section>
        );
      }}
    </Form>
  );
};

export default CodaveriSettingsForm;
