import { useState } from 'react';
import { RestartAlt } from '@mui/icons-material';
import { Button } from '@mui/material';

import { fetchSubmission } from 'course/assessment/submission/actions';
import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { resetPreviewSubmission } from '../operations';
import translations from '../translations';

interface ResetSubmissionButtonProps {
  assessmentId: string;
  submissionId: string;
}

// Rendered inside PreviewCourseBanner, which only mounts on a submission page inside the marketplace
// preview sandbox course and reads both ids off the URL there — so there is always something to
// reset by the time this renders.
const ResetSubmissionButton = (
  props: ResetSubmissionButtonProps,
): JSX.Element => {
  const { assessmentId, submissionId } = props;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const confirm = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await resetPreviewSubmission(Number(assessmentId));
      toast.success(t(translations.resetSubmissionSuccess));
      setOpen(false);

      // The reset submission keeps its id and is cleared back to blank server-side; stay on this
      // page and show that blank state in place rather than navigating away. Re-dispatch the same
      // fetch the submission edit page's `componentDidMount` uses
      // (`course/assessment/submission/actions#fetchSubmission`) to re-hydrate it. This button is
      // mounted in the persistent course banner, outside the submission edit page's component
      // tree (siblings under `CourseContainer`, see `client/app/bundles/course/container/
      // CourseContainer.tsx`) — but the whole app shares a single Redux store (see
      // `lib/components/wrappers/StoreProvider`), so dispatching here still reaches the exact
      // `assessments.submission` slice the submission edit page reads via `connect`, and it
      // re-renders with the fresh, blank data.
      dispatch(fetchSubmission(submissionId));
    } catch {
      toast.error(t(translations.resetSubmissionFailed));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        className="whitespace-nowrap"
        color="primary"
        onClick={(): void => setOpen(true)}
        size="small"
        startIcon={<RestartAlt />}
        variant="contained"
      >
        {t(translations.resetSubmission)}
      </Button>
      <Prompt
        disabled={submitting}
        onClickPrimary={confirm}
        onClose={(): void => setOpen(false)}
        open={open}
        primaryColor="error"
        primaryLabel={t(translations.resetSubmission)}
        title={t(translations.resetSubmissionConfirmTitle)}
      >
        <PromptText>{t(translations.resetSubmissionConfirmBody)}</PromptText>
      </Prompt>
    </>
  );
};

export default ResetSubmissionButton;
