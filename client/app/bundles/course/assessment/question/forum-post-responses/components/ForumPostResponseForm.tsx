import { useEffect, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  ForumPostResponseData,
  ForumPostResponseFormData,
} from 'types/course/assessment/question/forum-post-responses';
import { CategoryEntity } from 'types/course/assessment/question/rubric-based-responses';

import Section from 'lib/components/core/layouts/Section';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormRef } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import CommonQuestionFields from '../../components/CommonQuestionFields';
import AIGradingFields from '../../rubric-based-responses/components/AIGradingFields';
import CategoryManager from '../../rubric-based-responses/components/CategoryManager';
import questionSchema from '../commons/validations';

export interface ForumPostResponseFormProps<T extends 'new' | 'edit'> {
  with: ForumPostResponseFormData<T>;
  onSubmit: (data: ForumPostResponseData) => Promise<void>;
}

// The maximum grade of a rubric-graded question is the sum of each category's top criterion grade (mirrors
// the RBR page); deleted grades/categories drop out.
const computeMaximumGrade = (
  categories: CategoryEntity[] | null | undefined,
): number =>
  (categories ?? []).reduce((total, category) => {
    const categoryMax = Math.max(
      0,
      ...category.grades
        .filter((grade) => !grade.toBeDeleted)
        .map((grade) => Number(grade.grade) || 0),
    );
    return total + categoryMax;
  }, 0);

// The question fields plus the rubric editor + AI grading, kept as an inner component so it can read the live
// grading-mode / category values from the surrounding form context.
const ForumPostResponseFields = (props: {
  data: ForumPostResponseFormData<'new' | 'edit'>;
  submitting: boolean;
  onCategoriesDirtyChange: (isDirty: boolean) => void;
}): JSX.Element => {
  const { data, submitting, onCategoriesDirtyChange } = props;
  const { t } = useTranslation();
  const { control, watch, setValue, getValues } = useFormContext();

  const isRubric = watch('gradingMode') === 'rubric';
  const categories = watch('categories') as CategoryEntity[] | undefined;

  // Remembers the manually-entered maximum grade (seeded from the loaded value) so switching rubric ->
  // default restores it -- rubric mode disables the field and overwrites it with the rubric total.
  const manualMaxGradeRef = useRef(getValues('maximumGrade'));
  const wasRubricRef = useRef(isRubric);

  // While rubric-graded, the maximum grade is derived from the rubric and the field is disabled; keep it in
  // sync as categories/criterions change. On entering rubric mode stash the manual value; on leaving, restore.
  useEffect(() => {
    const wasRubric = wasRubricRef.current;
    wasRubricRef.current = isRubric;

    if (isRubric) {
      if (!wasRubric) manualMaxGradeRef.current = getValues('maximumGrade');
      setValue('maximumGrade', `${computeMaximumGrade(categories)}`);
    } else if (wasRubric) {
      setValue('maximumGrade', manualMaxGradeRef.current);
    }
  }, [isRubric, categories, getValues, setValue]);

  return (
    <>
      <CommonQuestionFields
        availableSkills={data.availableSkills}
        control={control}
        disabled={submitting}
        disableSettingMaxGrade={isRubric}
        skillsUrl={data.skillsUrl}
        supportedGradingModes={data.supportedGradingModes}
      />

      <Section
        sticksToNavbar
        subtitle={t(translations.forumPostsRequirements)}
        title={t(translations.forumPosts)}
      >
        <Controller
          control={control}
          name="maxPosts"
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              disabled={submitting}
              field={field}
              fieldState={fieldState}
              fullWidth
              label={t(translations.maxPosts)}
              required
              variant="filled"
            />
          )}
        />

        <Controller
          control={control}
          name="hasTextResponse"
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              disabled={submitting}
              field={field}
              fieldState={fieldState}
              label={t(translations.enableTextResponse)}
            />
          )}
        />
      </Section>

      {isRubric && (
        <>
          <Section
            sticksToNavbar
            subtitle={t(translations.rubricHint)}
            title={t(translations.rubric)}
          >
            <CategoryManager
              disabled={submitting}
              for={data.categories ?? []}
              onDirtyChange={onCategoriesDirtyChange}
            />
          </Section>
          <AIGradingFields
            availableGradingContextTypes={data.availableGradingContextTypes}
            contextSourceOptions={data.contextSourceOptions}
            disabled={submitting}
            questionId={data.parentQuestionId}
          />
        </>
      )}
    </>
  );
};

const ForumPostResponseForm = <T extends 'new' | 'edit'>(
  props: ForumPostResponseFormProps<T>,
): JSX.Element => {
  const { with: data } = props;

  const [submitting, setSubmitting] = useState(false);
  const [isCategoriesDirty, setIsCategoriesDirty] = useState(false);
  const formRef = useRef<FormRef>(null);

  // Flatten the grading config alongside the question fields so the reused rubric/AI sections (which read
  // from the form context by field name) line up.
  const initialValues = {
    ...data.question!,
    gradingMode: data.gradingMode ?? 'default',
    categories: data.categories ?? [],
    aiGradingEnabled: data.aiGradingEnabled ?? true,
    aiGradingCustomPrompt: data.aiGradingCustomPrompt ?? '',
    aiGradingModelAnswer: data.aiGradingModelAnswer ?? '',
  };

  const handleSubmit = async (rawData: typeof initialValues): Promise<void> => {
    const {
      gradingMode,
      categories,
      aiGradingEnabled,
      aiGradingCustomPrompt,
      aiGradingModelAnswer,
      ...question
    } = rawData;

    const newData: ForumPostResponseData = {
      question,
      gradingMode,
      supportedGradingModes: data.supportedGradingModes,
      categories,
      aiGradingEnabled,
      aiGradingCustomPrompt,
      aiGradingModelAnswer,
    };

    setSubmitting(true);

    props.onSubmit(newData).catch((errors) => {
      setSubmitting(false);
      formRef.current?.receiveErrors?.(errors);
    });
  };

  return (
    <Form
      ref={formRef}
      contextual
      dirty={isCategoriesDirty}
      disabled={submitting}
      headsUp
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validates={questionSchema}
    >
      {(): JSX.Element => (
        <ForumPostResponseFields
          data={data}
          onCategoriesDirtyChange={setIsCategoriesDirty}
          submitting={submitting}
        />
      )}
    </Form>
  );
};

export default ForumPostResponseForm;
