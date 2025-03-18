import { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Alert, Typography } from '@mui/material';
import {
  McqMrqData,
  McqMrqFormData,
} from 'types/course/assessment/question/multiple-responses';

import Section from 'lib/components/core/layouts/Section';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import Form, { FormRef } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import ConvertMcqMrqButton from '../../../components/ConvertMcqMrqButton';
import translations from '../../../translations';
import CommonQuestionFields from '../../components/CommonQuestionFields';
import { McqMrqAdapter } from '../commons/translationAdapter';
import { questionSchema, validateOptions } from '../commons/validations';

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

  const formRef = useRef<FormRef>(null);
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
      formRef.current?.receiveErrors?.(errors);
    });
  };

  const availableSkills = data.availableSkills;

  return (
    <Form
      ref={formRef}
      dirty={isOptionsDirty}
      disabled={submitting}
      headsUp
      initialValues={data.question!}
      onReset={optionsRef.current?.reset}
      onSubmit={handleSubmit}
      validates={questionSchema}
    >
      {(control, watch, { isDirty: isQuestionDirty }): JSX.Element => (
        <>
          <CommonQuestionFields
            availableSkills={availableSkills}
            control={control}
            disabled={submitting}
            skillsUrl={data.skillsUrl}
          />

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
