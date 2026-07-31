import { FC, useEffect } from 'react';
import { Alert, Typography } from '@mui/material';

import { fetchSubmission } from 'course/assessment/submission/actions';
import {
  previewAutogradingFailed,
  previewAutogradingSandboxGone,
  previewAutogradingSettled,
} from 'course/assessment/submission/reducers/previewAutograding';
import { getPreviewAutograding } from 'course/assessment/submission/selectors/previewAutograding';
import translations from 'course/assessment/submission/translations';
import { useCourseContext } from 'course/container/CourseLoader';
import { setNotification } from 'lib/actions';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { pollJobRequest } from 'lib/helpers/jobHelpers';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60000;

/**
 * Marketplace preview sandbox only. A previewer finalises their own attempt with no grader
 * colleague to refresh the page for them, so this banner polls the auto-grading job that
 * `finalise` handed back and refetches the submission in place once it lands.
 *
 * The interval is owned by this component's own effect rather than the page's, both because
 * SubmissionEditIndex is a class component and because unmounting the banner then guarantees the
 * teardown — `pollJob`'s fire-and-forget default export orphans pollers across navigation.
 */
const PreviewAutogradingBanner: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  // Read defensively (optional chaining) — this page also mounts in test trees that may not sit
  // under CourseContainer's outlet.
  const isPreview = useCourseContext()?.isPreview;
  const { jobUrl, status } = useAppSelector(getPreviewAutograding);
  const submissionId = getSubmissionId();

  useEffect(() => {
    if (!isPreview || status !== 'polling' || !jobUrl) return undefined;

    const startedAt = Date.now();
    let cancelled = false;
    let inFlight = false;

    // A purge can destroy this attempt's assessment and cascade its submission mid-session. The
    // `jobs` row survives that, so the poll still succeeds — the absence only shows up as a 404 on
    // the refetch. A 403 is something else entirely (cross-previewer denial) and must not land here.
    const refetchAndDetectPurge = async (): Promise<boolean> => {
      let purged = false;

      await dispatch(
        fetchSubmission(
          submissionId,
          undefined,
          (error?: { response?: { status?: number } }) => {
            if (error?.response?.status === 404) purged = true;
          },
        ),
      );

      return purged;
    };

    const poller = setInterval(async () => {
      // The deadline is checked BEFORE the `inFlight` guard, and that order is load-bearing: the jobs
      // endpoint sets no axios timeout, so a hung request would otherwise pin `inFlight` true forever
      // and every later tick would short-circuit before ever reaching this check — the 60s ceiling
      // would never fire and the banner would spin indefinitely.
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        clearInterval(poller);
        dispatch(previewAutogradingFailed());
        // Safe even with a request still in flight: `previewAutogradingFailed` flips `status` off
        // 'polling', and `status` is in this effect's dependency array, so React runs the cleanup
        // below (setting `cancelled = true`) on this very closure before the hung request's
        // completion callback can be serviced. That is what stops a late resolution from dispatching
        // a stray `previewAutogradingSettled` or success toast. If you ever remove `status` from the
        // dependency array, that guarantee disappears.
        return;
      }

      // Deliberately does NOT check `cancelled` here. Stopping future ticks is `clearInterval`'s job
      // in the cleanup below; duplicating it here would make the two redundant, and would silently
      // render the `stops polling once the page unmounts` test unable to observe a leaked timer.
      // `cancelled` is load-bearing further down, after the `await` and in the `catch`, where its
      // real job is to stop an already-in-flight poll from dispatching into an unmounted tree.
      // Do not "helpfully" add `cancelled ||` back.
      if (inFlight) return;

      inFlight = true;

      try {
        const response = await pollJobRequest(jobUrl);
        if (cancelled) return;

        if (response.status === 'completed') {
          clearInterval(poller);
          // Decide what to say only AFTER the refetch resolves. Announcing success up front made a
          // purged sandbox flash "evaluated" and then contradict itself with "no longer available".
          const purged = await refetchAndDetectPurge();
          if (cancelled) return;

          if (purged) {
            dispatch(previewAutogradingSandboxGone());
          } else {
            dispatch(previewAutogradingSettled());
            dispatch(setNotification(translations.autogradeSubmissionSuccess));
          }
        } else if (response.status === 'errored') {
          clearInterval(poller);
          // The likeliest purge path: the assessment was destroyed before the job ran, so the job
          // died on ActiveJob deserialization instead of completing. The refetch both surfaces any
          // partial grading and tells us whether the sandbox is gone.
          const purged = await refetchAndDetectPurge();
          if (cancelled) return;

          dispatch(
            purged
              ? previewAutogradingSandboxGone()
              : previewAutogradingFailed(),
          );
        }
      } catch {
        if (!cancelled) {
          clearInterval(poller);
          dispatch(previewAutogradingFailed());
        }
      } finally {
        inFlight = false;
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(poller);
    };
  }, [isPreview, status, jobUrl, submissionId, dispatch]);

  if (!isPreview || status === 'idle') return null;

  const polling = status === 'polling';

  let message = translations.previewAutogradingStalled;
  if (polling) message = translations.previewAutogradingInProgress;
  if (status === 'gone') message = translations.previewAutogradingSandboxGone;

  return (
    <Alert
      icon={polling ? <LoadingIndicator bare size={20} /> : undefined}
      severity={polling ? 'info' : 'warning'}
    >
      <Typography variant="body2">{t(message)}</Typography>
    </Alert>
  );
};

export default PreviewAutogradingBanner;
