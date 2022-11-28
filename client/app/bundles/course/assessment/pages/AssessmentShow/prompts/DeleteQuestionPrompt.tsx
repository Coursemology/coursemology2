import { useState } from 'react';
import { toast } from 'react-toastify';
import { QuestionData } from 'types/course/assessment/assessments';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import useTranslation from 'lib/hooks/useTranslation';

import { deleteQuestion } from '../../../actions';
import translations from '../../../translations';

interface DeleteQuestionPromptProps {
  for: QuestionData;
  onClose: () => void;
  onDelete: () => void;
  open: boolean;
}

const DeleteQuestionPrompt = (
  props: DeleteQuestionPromptProps,
): JSX.Element => {
  const { for: question } = props;
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (): void => {
    setDeleting(true);

    toast
      .promise(deleteQuestion(question.deleteUrl), {
        pending: t(translations.deletingQuestion),
        success: t(translations.questionDeleted),
        error: {
          render: ({ data }) => {
            // TODO: Remove when actions.js is written in TypeScript
            const error = (data as Error)?.message;
            return error || t(translations.errorDeletingQuestion);
          },
        },
      })
      .then(() => {
        props.onDelete();
        props.onClose();
      })
      .finally(() => setDeleting(false));
  };

  return (
    <Prompt
      contentClassName="space-y-4"
      disabled={deleting}
      onClickPrimary={handleDelete}
      onClose={props.onClose}
      open={props.open}
      primaryColor="error"
      primaryLabel={t(translations.deleteQuestion)}
      title={t(translations.sureDeletingQuestion)}
    >
      <PromptText>{t(translations.deletingThisQuestion)}</PromptText>

      <PromptText className="italic">{question.title}</PromptText>

      <PromptText>{t(translations.deleteQuestionWarning)}</PromptText>
    </Prompt>
  );
};

export default DeleteQuestionPrompt;
