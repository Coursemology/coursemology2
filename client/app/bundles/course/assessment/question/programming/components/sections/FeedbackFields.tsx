import { Controller, useFormContext } from 'react-hook-form';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import ExperimentalChip from 'lib/components/core/ExperimentalChip';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

interface FeedbackFieldsProps {
  disabled?: boolean;
}

export const FEEDBACK_SECTION_ID = 'feedback-fields' as const;

const FeedbackFields = (props: FeedbackFieldsProps): JSX.Element | null => {
  const { t } = useTranslation();

  const { control, watch } = useFormContext<ProgrammingFormData>();

  // TODO: remove this check, once live feedback generation for non-codaveri questions is supported.
  const isCodaveri = watch('question.isCodaveri');
  if (!isCodaveri) return null;

  const liveFeedbackEnabled = watch('question.liveFeedbackEnabled');

  return (
    <Section
      id={FEEDBACK_SECTION_ID}
      sticksToNavbar
      title={
        <>
          {t(translations.automatedFeedback)}
          <ExperimentalChip disabled={props.disabled} />
        </>
      }
    >
      <Controller
        control={control}
        name="question.liveFeedbackEnabled"
        render={({ field, fieldState }): JSX.Element => (
          <FormCheckboxField
            description={t(translations.enableLiveFeedbackDescription)}
            disabled={props.disabled}
            field={field}
            fieldState={fieldState}
            label={t(translations.enableLiveFeedback)}
          />
        )}
      />

      <Subsection
        subtitle={t(translations.liveFeedbackCustomPromptDescription)}
        title={t(translations.liveFeedbackCustomPrompt)}
      >
        <Controller
          control={control}
          name="question.liveFeedbackCustomPrompt"
          render={({ field, fieldState }): JSX.Element => (
            <FormRichTextField
              disabled={props.disabled || !liveFeedbackEnabled}
              field={field}
              fieldState={fieldState}
              fullWidth
            />
          )}
        />
      </Subsection>
    </Section>
  );
};

export default FeedbackFields;
