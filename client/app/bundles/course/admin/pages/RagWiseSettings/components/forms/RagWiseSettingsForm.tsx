import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Chip, RadioGroup, Slider } from '@mui/material';
import { RagWiseSettings } from 'types/course/admin/ragWise';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { updateRagWiseSettings } from '../../operations';
import translations from '../../translations';

interface RagWiseSettingsFormProps {
  settings: RagWiseSettings; // Update type to match your settings structure
}

const RagWiseSettingsForm = ({
  settings,
}: RagWiseSettingsFormProps): JSX.Element => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormEmitter<RagWiseSettings>>();

  const handleSubmit = (data: RagWiseSettings): void => {
    setSubmitting(true);

    updateRagWiseSettings(data)
      .then((newData) => {
        if (!newData) return;
        form?.resetTo?.(newData);
        toast.success(t(formTranslations.changesSaved));
      })
      .catch(form?.receiveErrors)
      .finally(() => setSubmitting(false));
  };

  const trustDescription = (trust: string): string => {
    if (trust === 'no') {
      return '';
    }
    if (trust === '0') {
      return t(translations.responseWorkflowDraftDescription);
    }
    if (trust === '100') {
      return t(translations.responseWorkflowPublishDescription);
    }
    return t(translations.responseWorkflowTrustDescription, {
      trust,
    });
  };

  const trustLevels = [
    { value: 0, label: t(translations.responseWorkflowDraft) },
    { value: 30, label: t(translations.responseWorkflowLowTrust) },
    { value: 70, label: t(translations.responseWorkflowHighTrust) },
    { value: 100, label: t(translations.responseWorkflowPublish) },
  ];

  const defaultCharacters = [
    {
      label: t(translations.roleplayNormalLabel),
      prompt: '',
    },
    {
      label: t(translations.roleplayDeadpoolLabel),
      prompt: t(translations.roleplayDeadpool),
    },
    {
      label: t(translations.roleplayYodaLabel),
      prompt: t(translations.roleplayYoda),
    },
  ];

  return (
    <Form
      className="!pb-0"
      disabled={submitting}
      emitsVia={setForm}
      headsUp
      initialValues={settings}
      onSubmit={handleSubmit}
    >
      {(control): JSX.Element => (
        <>
          <Section
            contentClassName="flex flex-col space-y-3"
            sticksToNavbar
            subtitle={t(translations.ragWiseSettingsSubtitle)}
            title={t(translations.ragWiseSettings)}
          >
            <Subsection
              subtitle={t(translations.responseWorkflowDescription)}
              title={t(translations.responseWorkflowTitle)}
            >
              <Controller
                control={control}
                name="responseWorkflow"
                render={({ field }): JSX.Element => (
                  <>
                    <RadioGroup className="space-y-5" {...field}>
                      <RadioButton
                        className="my-0"
                        disabled={submitting}
                        label={t(translations.responseWorkflowNoAuto)}
                        value="no"
                      />
                      <RadioButton
                        className="my-0"
                        description={trustDescription(field.value)}
                        disabled={submitting}
                        label={t(translations.responseWorkflowAuto)}
                        value={field.value === 'no' ? '0' : field.value}
                      />
                    </RadioGroup>
                    {field.value !== 'no' && (
                      <Slider
                        className="w-[60rem] ml-20"
                        defaultValue={0}
                        marks={trustLevels}
                        onChange={(event, newValue) => {
                          field.onChange(String(newValue));
                        }}
                        step={1}
                        value={Number(field.value) || 0}
                        valueLabelDisplay="auto"
                      />
                    )}
                  </>
                )}
              />
            </Subsection>
          </Section>
          <Section
            contentClassName="flex flex-col space-y-3"
            sticksToNavbar
            subtitle={t(translations.roleplaySubtitle)}
            title={t(translations.roleplayTitle)}
          >
            <Subsection
              subtitle={t(translations.roleplayDescription)}
              title={t(translations.roleplayTitle)}
            >
              <Controller
                control={control}
                name="roleplay"
                render={({ field, fieldState }): JSX.Element => (
                  <>
                    <FormTextField
                      field={field}
                      fieldState={fieldState}
                      fullWidth
                      inputProps={{
                        maxLength: 200,
                      }}
                      label={t(translations.roleplayCharacterLabel)}
                      maxRows={4}
                      multiline
                      variant="filled"
                    />
                    <div className="flex flex-wrap gap-5">
                      {defaultCharacters.map((character) => (
                        <Chip
                          key={character.label}
                          color="primary"
                          label={character.label}
                          onClick={() => field.onChange(character.prompt)}
                          variant="outlined"
                        />
                      ))}
                    </div>
                  </>
                )}
              />
            </Subsection>
          </Section>
        </>
      )}
    </Form>
  );
};

export default RagWiseSettingsForm;
