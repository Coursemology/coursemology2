import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  RubricBasedResponseData,
  RubricBasedResponseFormData,
} from 'types/course/assessment/question/rubric-based-responses';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import useRubricAdvanceConfirmation from '../commons/useRubricAdvanceConfirmation';

import RubricBasedResponseForm from './components/RubricBasedResponseForm';
import {
  fetchEditRubricBasedResponse,
  RubricAdvanceConfirmationError,
  update,
} from './operations';

const translations = defineMessages({
  confirmAdvanceTitle: {
    id: 'course.assessment.question.rubricBasedResponse.confirmAdvanceTitle',
    defaultMessage: 'Warning: Saving Incompatible Rubric',
  },
  confirmAdvanceText: {
    id: 'course.assessment.question.rubricBasedResponse.confirmAdvanceText',
    defaultMessage:
      'Your changes make the rubric structurally incompatible with existing grades. We will carry forward grading data, but we strongly recommend double-checking answer grades as some data may be lost. Are you sure you wish to proceed?',
  },
  confirmAdvancePrimary: {
    id: 'course.assessment.question.rubricBasedResponse.confirmAdvancePrimary',
    defaultMessage: 'Save',
  },
  confirmAdvanceCancel: {
    id: 'course.assessment.question.rubricBasedResponse.confirmAdvanceCancel',
    defaultMessage: 'Cancel',
  },
});

const EditRubricBasedResponsePage = (): JSX.Element => {
  const { t } = useTranslation();

  const params = useParams();
  const id = parseInt(params?.questionId ?? '', 10) || undefined;

  if (!id)
    throw new Error(`EditRubricBasedResponsePage was loaded with ID: ${id}.`);

  const fetchData = (): Promise<RubricBasedResponseFormData> =>
    fetchEditRubricBasedResponse(id);

  const submit = (
    data: RubricBasedResponseData,
    confirmRubricAdvance: boolean,
  ): Promise<void> =>
    update(id, data, confirmRubricAdvance).then(({ redirectUrl }) => {
      toast.success(t(formTranslations.changesSaved));
      window.location.href = redirectUrl;
    });

  // An incompatible rubric change is rolled back until the user confirms it (see useRubricAdvanceConfirmation).
  const { handleSubmit, isConfirming, confirm, cancel } =
    useRubricAdvanceConfirmation(
      submit,
      (error) => error instanceof RubricAdvanceConfirmationError,
    );

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => (
        <>
          <RubricBasedResponseForm onSubmit={handleSubmit} with={data} />
          <Prompt
            cancelLabel={t(translations.confirmAdvanceCancel)}
            onClickPrimary={confirm}
            onClose={cancel}
            open={isConfirming}
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

export default EditRubricBasedResponsePage;
