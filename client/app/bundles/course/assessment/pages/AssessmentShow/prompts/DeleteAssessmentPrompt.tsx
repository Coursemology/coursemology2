import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  AssessmentData,
  AssessmentDeleteResult,
} from 'types/course/assessment/assessments';

import { deleteAssessment } from 'bundles/course/assessment/actions';
import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

interface DeleteAssessmentPromptProps {
  for: AssessmentData;
  onClose: () => void;
  open: boolean;
}

const DeleteAssessmentPrompt = (
  props: DeleteAssessmentPromptProps,
): JSX.Element => {
  const { for: assessment } = props;
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (): void => {
    const deleteUrl = assessment.deleteUrl;
    if (!deleteUrl)
      throw new Error(
        `Delete URL for assessment '${assessment.title}' is ${deleteUrl}.`,
      );

    setDeleting(true);

    toast
      .promise(deleteAssessment(deleteUrl), {
        pending: t(translations.deletingAssessment),
        success: t(translations.assessmentDeletedRedirecting),
        error: {
          render: ({ data }) => {
            const error = (data as Error)?.message;
            return error || t(translations.errorDeletingAssessment);
          },
        },
      })
      .then((data: AssessmentDeleteResult) => {
        // TODO: Change to `navigate(data.redirect)` with `useNavigate` when SPA
        window.location.replace(data.redirect);
      })
      .catch(() => setDeleting(false));
  };

  return (
    <Prompt
      contentClassName="space-y-4"
      disabled={deleting}
      onClickPrimary={handleDelete}
      onClose={props.onClose}
      open={props.open}
      primaryColor="error"
      primaryLabel={t(translations.deleteAssessment)}
      title={t(translations.sureDeletingAssessment)}
    >
      <PromptText>{t(translations.deletingThisAssessment)}</PromptText>

      <PromptText className="italic">{assessment.title}</PromptText>

      <PromptText>{t(translations.deleteAssessmentWarning)}</PromptText>
    </Prompt>
  );
};

export default DeleteAssessmentPrompt;
