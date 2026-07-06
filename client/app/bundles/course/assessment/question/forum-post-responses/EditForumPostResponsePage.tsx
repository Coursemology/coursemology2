import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  ForumPostResponseData,
  ForumPostResponseFormData,
} from 'types/course/assessment/question/forum-post-responses';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import ForumPostResponseForm from './components/ForumPostResponseForm';
import {
  fetchEditForumPostResponse,
  RubricAdvanceConfirmationError,
  updateForumPostResponse,
} from './operation';

const translations = defineMessages({
  confirmAdvanceTitle: {
    id: 'course.assessment.question.forumPostResponse.confirmAdvanceTitle',
    defaultMessage: 'Warning: Saving Incompatible Rubric',
  },
  confirmAdvanceText: {
    id: 'course.assessment.question.forumPostResponse.confirmAdvanceText',
    defaultMessage:
      'Your changes make the rubric structurally incompatible with existing grades. We will carry forward grading data, but we strongly recommend double-checking answer grades as some data may be lost. Are you sure you wish to proceed?',
  },
  confirmAdvancePrimary: {
    id: 'course.assessment.question.forumPostResponse.confirmAdvancePrimary',
    defaultMessage: 'Save',
  },
  confirmAdvanceCancel: {
    id: 'course.assessment.question.forumPostResponse.confirmAdvanceCancel',
    defaultMessage: 'Cancel',
  },
});

const EditForumPostResponsePage = (): JSX.Element => {
  const { t } = useTranslation();

  const params = useParams();
  const id = parseInt(params?.questionId ?? '', 10) || undefined;
  if (!id)
    throw new Error(`EditForumPostResponseForm was loaded with ID: ${id}.`);

  // The form data awaiting confirmation of an incompatible (re-grading) rubric change; the original update
  // was rolled back, so re-submitting with confirmRubricAdvance is what actually saves.
  const [pendingData, setPendingData] = useState<ForumPostResponseData | null>(
    null,
  );

  const fetchData = (): Promise<ForumPostResponseFormData<'edit'>> =>
    fetchEditForumPostResponse(id);

  const submit = (
    data: ForumPostResponseData,
    confirmRubricAdvance: boolean,
  ): Promise<void> =>
    updateForumPostResponse(id, data, confirmRubricAdvance).then(
      ({ redirectUrl }) => {
        toast.success(t(formTranslations.changesSaved));
        window.location.href = redirectUrl;
      },
    );

  const handleSubmit = (data: ForumPostResponseData): Promise<void> =>
    submit(data, false).catch((error) => {
      if (error instanceof RubricAdvanceConfirmationError) {
        setPendingData(data);
        return;
      }
      throw error;
    });

  const handleConfirmAdvance = (): Promise<void> => {
    if (!pendingData) return Promise.resolve();
    return submit(pendingData, true).catch(() => setPendingData(null));
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => (
        <>
          <ForumPostResponseForm onSubmit={handleSubmit} with={data} />
          <Prompt
            cancelLabel={t(translations.confirmAdvanceCancel)}
            onClickPrimary={handleConfirmAdvance}
            onClose={() => setPendingData(null)}
            open={pendingData !== null}
            primaryColor="info"
            primaryLabel={t(translations.confirmAdvancePrimary)}
            title={t(translations.confirmAdvanceTitle)}
          >
            <PromptText>{t(translations.confirmAdvanceText)}</PromptText>
          </Prompt>
        </>
      )}
    </Preload>
  );
};

export default EditForumPostResponsePage;
