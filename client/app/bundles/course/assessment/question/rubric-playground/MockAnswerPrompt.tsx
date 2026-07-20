import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormHelperText } from '@mui/material';
import { dispatch } from 'store';
import {
  RubricGradingContextData,
  RubricMockAnswerData,
} from 'types/course/rubrics';

import assessmentTranslations from 'course/assessment/translations';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { actions as questionRubricsActions } from '../reducers/rubrics';

import {
  createQuestionMockAnswer,
  initializeMockAnswerEvaluations,
  updateQuestionMockAnswer,
} from './operations/mockAnswers';
import translations from './translations';

interface MockAnswerFormData {
  name: string;
  answerText: string;
  // Author-supplied content per grading context, index-aligned with `gradingContexts`.
  mockAnswerContexts: { content: string }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  gradingContexts: RubricGradingContextData[];
  rubricId: number;
  // When set, the prompt edits this existing mock answer; otherwise it creates a new one.
  mockAnswerId?: number;
}

const contextInitialValues = (
  gradingContexts: RubricGradingContextData[],
  mockAnswer?: RubricMockAnswerData,
): { content: string }[] =>
  gradingContexts.map((context) => ({
    content:
      mockAnswer?.gradingContexts.find(
        (stored) => stored.gradingContextId === context.id,
      )?.content ?? '',
  }));

const MockAnswerPrompt: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { open, onClose, gradingContexts, rubricId, mockAnswerId } = props;

  const mockAnswer = useAppSelector((state) =>
    mockAnswerId !== undefined
      ? state.assessments.question.rubrics.mockAnswers[mockAnswerId]
      : undefined,
  );
  const isEditing = mockAnswer !== undefined;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<MockAnswerFormData>({
    defaultValues: {
      name: '',
      answerText: '',
      mockAnswerContexts: contextInitialValues(gradingContexts),
    },
  });

  // Re-seed the form whenever the prompt opens (or switches between create/edit targets).
  useEffect(() => {
    if (!open) return;
    reset({
      name: mockAnswer?.name ?? '',
      answerText: mockAnswer?.answerText ?? '',
      mockAnswerContexts: contextInitialValues(gradingContexts, mockAnswer),
    });
  }, [open, mockAnswerId]);

  const contextHeading = (context: RubricGradingContextData): string => {
    if (context.contextType === 'forum_thread') {
      return t(translations.mockContextHeadingForumThread, {
        identifier: context.identifier,
      });
    }
    if (context.contextType === 'sibling_question_answer') {
      return t(translations.mockContextHeadingSibling, {
        identifier: context.identifier,
        title: context.sourceTitle ?? '',
      });
    }
    return t(translations.mockContextHeading, {
      identifier: context.identifier,
    });
  };

  const handleSave = async (data: MockAnswerFormData): Promise<void> => {
    const gradingContextPayload = gradingContexts.map((context, index) => ({
      // Carry the persisted join-row id (if any) so an edit updates the context in place.
      id: mockAnswer?.gradingContexts.find(
        (stored) => stored.gradingContextId === context.id,
      )?.id,
      gradingContextId: context.id,
      content: data.mockAnswerContexts?.[index]?.content ?? '',
    }));

    if (isEditing && mockAnswerId !== undefined) {
      const updated = await updateQuestionMockAnswer(
        mockAnswerId,
        data.name,
        data.answerText,
        gradingContextPayload,
      );
      dispatch(
        questionRubricsActions.updateMockAnswer({
          mockAnswerId,
          name: updated.name,
          answerText: updated.answerText,
          // Server response carries the join-row ids, so subsequent edits round-trip them.
          gradingContexts: updated.gradingContexts,
        }),
      );
    } else {
      const created = await createQuestionMockAnswer(
        data.name,
        data.answerText,
        gradingContextPayload,
      );
      dispatch(
        questionRubricsActions.initializeMockAnswer({
          rubricId,
          mockAnswerId: created.id,
          name: created.name,
          answerText: created.answerText,
          gradingContexts: created.gradingContexts,
        }),
      );
      await initializeMockAnswerEvaluations(rubricId, [created.id]);
    }
  };

  return (
    <Prompt
      cancelLabel={t(formTranslations.close)}
      maxWidth="md"
      onClickPrimary={handleSubmit((data) => {
        handleSave(data).then(onClose);
      })}
      onClose={onClose}
      open={open}
      primaryDisabled={!isDirty}
      primaryLabel={t(formTranslations.save)}
      title={
        isEditing
          ? t(translations.editMockAnswer)
          : t(translations.addMockAnswer)
      }
    >
      <form className="space-y-6">
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              disabled={false}
              disableMargins
              field={field}
              fieldState={fieldState}
              fullWidth
              label={t(translations.mockAnswerName)}
              variant="filled"
            />
          )}
        />

        <Subsection title={t(translations.answer)}>
          <Controller
            control={control}
            name="answerText"
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                disabled={false}
                disableMargins
                field={field}
                fieldState={fieldState}
                fullWidth
                placeholder={t(translations.writeAnswerPlaceholder)}
                variant="outlined"
              />
            )}
          />
        </Subsection>

        {gradingContexts.length > 0 && (
          <Subsection title={t(assessmentTranslations.gradingContext)}>
            {gradingContexts.map((context, index) => (
              <div key={context.id} className="space-y-1">
                <FormHelperText className="font-medium">
                  {contextHeading(context)}
                </FormHelperText>
                <Controller
                  control={control}
                  name={`mockAnswerContexts.${index}.content`}
                  render={({ field }): JSX.Element => (
                    <textarea
                      className="w-full min-h-48 field-sizing-content resize-none rounded border border-solid border-neutral-400 p-2 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-600"
                      placeholder={t(translations.mockContextPlaceholder)}
                      rows={5}
                      {...field}
                      value={field.value ?? ''}
                    />
                  )}
                />
              </div>
            ))}
          </Subsection>
        )}
      </form>
    </Prompt>
  );
};

export default MockAnswerPrompt;
