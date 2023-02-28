import { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Alert, Typography } from '@mui/material';
import {
  McqMrqData,
  McqMrqFormData,
} from 'types/course/assessment/multiple-responses';

import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import Link from 'lib/components/core/Link';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import ConvertMcqMrqButton from '../../../components/ConvertMcqMrqButton';
import translations from '../../../translations';
import SkillsAutocomplete from '../../components/SkillsAutocomplete';
import { McqMrqAdapter } from '../common/translationAdapter';
import { questionSchema, validateOptions } from '../common/validations';

import OptionsManager, { OptionsManagerRef } from './OptionsManager';

export interface AdaptedFormProps<T extends 'new' | 'edit'> {
  with: McqMrqFormData<T>;
  onSubmit: (data: McqMrqData) => Promise<void>;
  new?: boolean;
}

export interface McqMrqFormProps<T extends 'new' | 'edit'>
  extends AdaptedFormProps<T> {
  adapter: McqMrqAdapter;
}

const McqMrqForm = <T extends 'new' | 'edit'>(
  props: McqMrqFormProps<T>,
): JSX.Element => {
  const { adapter, with: data } = props;

  const { t } = useTranslation();

  const [submitting, setSubmitting] = useState(false);
  const [isOptionsDirty, setIsOptionsDirty] = useState(false);
  const [form, setForm] = useState<FormEmitter>();

  const optionsRef = useRef<OptionsManagerRef>(null);

  const prepareOptions = async (
    skipGrading: boolean,
  ): Promise<McqMrqData<T>['options'] | undefined> => {
    optionsRef.current?.resetErrors();
    const options = optionsRef.current?.getOptions() ?? [];
    const errors = await validateOptions(options, data.mcqMrqType, skipGrading);

    if (errors) {
      optionsRef.current?.setErrors(errors);
      return undefined;
    }

    return options;
  };

  const handleSubmit = async (
    question: McqMrqData['question'],
  ): Promise<void> => {
    const options = await prepareOptions(question.skipGrading);
    if (!options) return;

    const newData: McqMrqData = {
      gradingScheme: data.gradingScheme,
      question,
      options,
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
      dirty={isOptionsDirty}
      disabled={submitting}
      emitsVia={setForm}
      headsUp
      initialValues={data.question}
      onReset={optionsRef.current?.reset}
      onSubmit={handleSubmit}
      validates={questionSchema}
    >
      {(control, watch, { isDirty: isQuestionDirty }): JSX.Element => (
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

          <Section
            sticksToNavbar
            subtitle={adapter.optionsHint}
            title={adapter.options}
          >
            {data.allowRandomization && (
              <Controller
                control={control}
                name="randomizeOptions"
                render={({ field, fieldState }): JSX.Element => (
                  <FormCheckboxField
                    description={adapter.randomizeHint}
                    disabled={submitting}
                    field={field}
                    fieldState={fieldState}
                    label={adapter.randomize}
                  />
                )}
              />
            )}

            <Controller
              control={control}
              name="skipGrading"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  description={adapter.alwaysGradeAsCorrectHint}
                  disabled={submitting}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.alwaysGradeAsCorrect)}
                />
              )}
            />

            <OptionsManager
              ref={optionsRef}
              adapter={adapter}
              allowRandomization={
                data.allowRandomization && watch('randomizeOptions')
              }
              disabled={submitting}
              for={data.options ?? []}
              hideCorrect={watch('skipGrading')}
              onDirtyChange={setIsOptionsDirty}
            />
          </Section>

          <Section sticksToNavbar title={adapter.convert}>
            <Alert severity="info">{adapter.convertHint}</Alert>

            <adapter.convertIllustration className="!mb-8" />

            {(isQuestionDirty || isOptionsDirty) && (
              <Typography className="italic text-neutral-500" variant="body2">
                {t(translations.saveChangesFirstBeforeConvertingMcqMrq)}
              </Typography>
            )}

            <ConvertMcqMrqButton
              disabled={isQuestionDirty || isOptionsDirty}
              for={{
                mcqMrqType: data.mcqMrqType,
                convertUrl: data.convertUrl,
                hasAnswers: data.hasAnswers,
                unsubmitAndConvertUrl: data.unsubmitAndConvertUrl,
                type: data.type,
              }}
              new={props.new}
              onConvertComplete={(): void => window.location.reload()}
            />
          </Section>
        </>
      )}
    </Form>
  );
};

export default McqMrqForm;
