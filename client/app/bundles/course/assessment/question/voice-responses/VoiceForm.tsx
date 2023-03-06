import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Alert } from '@mui/material';
import {
  VoiceData,
  VoiceFormData,
} from 'types/course/assessment/question/voice-responses';

import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import Link from 'lib/components/core/Link';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';
import SkillsAutocomplete from '../components/SkillsAutocomplete';

import questionSchema from './validation';

export interface VoiceFormProps<T extends 'new' | 'edit'> {
  with: VoiceFormData<T>;
  onSubmit: (data: VoiceData) => Promise<void>;
}

const VoiceForm = <T extends 'new' | 'edit'>(
  props: VoiceFormProps<T>,
): JSX.Element => {
  const { with: data } = props;
  const { t } = useTranslation();

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormEmitter>();

  const handleSubmit = async (
    question: VoiceData['question'],
  ): Promise<void> => {
    const newData: VoiceData = {
      question,
    };

    setSubmitting(true);

    props.onSubmit(newData).catch((errors) => {
      setSubmitting(false);
      form?.receiveErrors?.(errors);
    });
  };

  const availableSkills = data.availableSkills;

  return (
    <Form
      disabled={submitting}
      emitsVia={setForm}
      headsUp
      initialValues={data.question}
      onSubmit={handleSubmit}
      validates={questionSchema}
    >
      {(control): JSX.Element => (
        <>
          <Section sticksToNavbar title={t(translations.questionDetails)}>
            <Controller
              control={control}
              name="title"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={submitting}
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  label={t(translations.title)}
                  variant="filled"
                />
              )}
            />

            <Subsection title={t(translations.description)}>
              <Controller
                control={control}
                name="description"
                render={({ field, fieldState }): JSX.Element => (
                  <FormRichTextField
                    disabled={submitting}
                    field={field}
                    fieldState={fieldState}
                  />
                )}
              />
            </Subsection>

            <Subsection
              subtitle={t(translations.staffOnlyCommentsHint)}
              title={t(translations.staffOnlyComments)}
            >
              <Controller
                control={control}
                name="staffOnlyComments"
                render={({ field, fieldState }): JSX.Element => (
                  <FormRichTextField
                    disabled={submitting}
                    field={field}
                    fieldState={fieldState}
                  />
                )}
              />
            </Subsection>
          </Section>

          <Section sticksToNavbar title={t(translations.grading)}>
            <Controller
              control={control}
              name="maximumGrade"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={submitting}
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  label={t(translations.maximumGrade)}
                  required
                  variant="filled"
                />
              )}
            />
          </Section>

          <Section
            sticksToNavbar
            subtitle={t(translations.skillsHint)}
            title={t(translations.skills)}
          >
            {availableSkills && (
              <Controller
                control={control}
                name="skillIds"
                render={({ field, fieldState: { error } }): JSX.Element => (
                  <SkillsAutocomplete
                    availableSkills={availableSkills}
                    error={error}
                    field={field}
                  />
                )}
              />
            )}

            <Alert severity="info">
              {t(
                availableSkills
                  ? translations.canConfigureSkills
                  : translations.noSkillsCanCreateSkills,
                {
                  url: (chunks) => (
                    <Link href={data.skillsUrl} opensInNewTab>
                      {chunks}
                    </Link>
                  ),
                },
              )}
            </Alert>
          </Section>
        </>
      )}
    </Form>
  );
};

export default VoiceForm;
