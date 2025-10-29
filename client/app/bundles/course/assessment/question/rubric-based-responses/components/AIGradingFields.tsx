import { Controller, useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { RubricBasedResponseFormData } from 'types/course/assessment/question/rubric-based-responses';

import ExperimentalChip from 'lib/components/core/ExperimentalChip';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import AIGradingPlaygroundAlert from '../../components/AIGradingPlaygroundAlert';

interface AIGradingFieldsProps {
  disabled?: boolean;
  questionId?: number;
}

export const AI_GRADING_SECTION_ID = 'ai-grading-fields' as const;

const AIGradingFields = (props: AIGradingFieldsProps): JSX.Element | null => {
  const { disabled, questionId } = props;
  const { courseId, assessmentId } = useParams();
  const { t } = useTranslation();
  const { control, watch } = useFormContext<RubricBasedResponseFormData>();
  const aiGradingEnabled = watch('aiGradingEnabled');

  return (
    <Section
      id={AI_GRADING_SECTION_ID}
      sticksToNavbar
      title={
        <>
          {t(translations.aiGrading)}
          <ExperimentalChip className="ml-2" disabled={disabled} />
        </>
      }
    >
      <Controller
        control={control}
        name="aiGradingEnabled"
        render={({ field, fieldState }): JSX.Element => (
          <FormCheckboxField
            description={t(translations.enableAiGradingDescription)}
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            label={t(translations.enableAiGrading)}
          />
        )}
      />

      <Subsection
        subtitle={t(translations.aiGradingCustomPromptDescription)}
        title={t(translations.aiGradingCustomPrompt)}
      >
        <Controller
          control={control}
          name="aiGradingCustomPrompt"
          render={({ field, fieldState }): JSX.Element => (
            <FormRichTextField
              disabled={disabled || !aiGradingEnabled}
              field={field}
              fieldState={fieldState}
              fullWidth
            />
          )}
        />
      </Subsection>

      <Subsection
        subtitle={t(translations.aiGradingModelAnswerDescription)}
        title={t(translations.aiGradingModelAnswer)}
      >
        <Controller
          control={control}
          name="aiGradingModelAnswer"
          render={({ field, fieldState }): JSX.Element => (
            <FormRichTextField
              disabled={disabled || !aiGradingEnabled}
              field={field}
              fieldState={fieldState}
              fullWidth
            />
          )}
        />

        {courseId && assessmentId && questionId && (
          <AIGradingPlaygroundAlert
            assessmentId={assessmentId}
            courseId={courseId}
            questionId={questionId}
          />
        )}
      </Subsection>
    </Section>
  );
};

export default AIGradingFields;
