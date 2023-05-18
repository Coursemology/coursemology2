import { useState } from 'react';
import { toast } from 'react-toastify';
import { QuestionData } from 'types/course/assessment/questions';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import { PromptText } from 'lib/components/core/dialogs/Prompt';
import useTranslation from 'lib/hooks/useTranslation';

import { deleteQuestion } from '../../../operations';
import translations from '../../../translations';

interface DeleteQuestionButtonPromptProps {
  for: QuestionData;
  onDelete: () => void;
  disabled?: boolean;
}

const DeleteQuestionButtonPrompt = (
  props: DeleteQuestionButtonPromptProps,
): JSX.Element => {
  const { for: question } = props;
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (): Promise<void> => {
    if (!question.deleteUrl) return Promise.reject();

    setDeleting(true);

    return toast
      .promise(deleteQuestion(question.deleteUrl), {
        pending: t(translations.deletingQuestion),
        success: t(translations.questionDeleted),
        error: {
          render: ({ data }) => {
            const error = (data as Error)?.message;
            return error || t(translations.errorDeletingQuestion);
          },
        },
      })
      .then(props.onDelete)
      .finally(() => setDeleting(false));
  };

  return (
    <DeleteButton
      aria-label={t(translations.delete)}
      confirmLabel={t(translations.deleteQuestion)}
      disabled={deleting || Boolean(props.disabled)}
      edge="end"
      onClick={handleDelete}
      title={t(translations.sureDeletingQuestion)}
      tooltip={t(translations.delete)}
    >
      <PromptText>{t(translations.deletingThisQuestion)}</PromptText>
      <PromptText className="italic">{question.title}</PromptText>
      <PromptText>{t(translations.deleteQuestionWarning)}</PromptText>
    </DeleteButton>
  );
};

export default DeleteQuestionButtonPrompt;
