import { FC, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { Typography } from '@mui/material';

import SubmissionEditIndex from 'course/assessment/submission/pages/SubmissionEditIndex';
import {
  PreviewProvider,
  setActivePreview,
} from 'course/marketplace/contexts/PreviewContext';
import Page from 'lib/components/core/layouts/Page';
import useTranslation from 'lib/hooks/useTranslation';

import PreviewBanner from './PreviewBanner';

interface PreviewAttemptPageProps {
  courseId: number;
  assessmentId: number;
  submissionId: number;
  listingId: number;
}

// Belt-and-suspenders invariant: PreviewContext's active scope is set from three sites (this
// page's own mount effect below; `PreviewProvider`'s internal effect, T10; and
// `previewAttemptLoader`'s eager seed, loader.ts) and cleared from two (this page's cleanup
// below, and `PreviewAttemptErrorElement` below). Each covers a window the others don't:
// - the loader's eager seed closes the layout-vs-passive-effect race (loader.ts has the detail);
// - this page's own effect re-seeds when the ids change on an already-mounted page (and doubles
//   as PreviewProvider's own seeding, which the class-based Submissions API alone would rely on);
// - the error element closes the one window nothing else covers: a throw during initial render,
//   before any cleanup effect had a chance to register.
const PreviewAttemptPage: FC<PreviewAttemptPageProps> = ({
  courseId,
  assessmentId,
  submissionId,
  listingId,
}) => {
  useEffect(() => {
    setActivePreview({ courseId, assessmentId, submissionId, isPreview: true });
    return () => setActivePreview(null);
  }, [courseId, assessmentId, submissionId]);

  return (
    <PreviewProvider
      assessmentId={assessmentId}
      courseId={courseId}
      submissionId={submissionId}
    >
      <PreviewBanner attemptId={submissionId} listingId={listingId} />
      <SubmissionEditIndex />
    </PreviewProvider>
  );
};

export default PreviewAttemptPage;

// Route-level adapter (wired as the `attempt` route's `Component` in routers/course/marketplace).
// `previewAttemptLoader` (loader.ts) resolves the ids *before* this renders — and already seeds
// PreviewContext eagerly, see that file's comment for why that matters beyond this page's own
// effect above. `useLoaderData()` hands the ids to `PreviewAttemptPage` as props, since
// react-router route `Component`s are rendered with no props of their own.
export const PreviewAttemptRoute: FC = () => {
  const { courseId, assessmentId, submissionId, listingId } =
    useLoaderData() as PreviewAttemptPageProps;

  return (
    <PreviewAttemptPage
      assessmentId={assessmentId}
      courseId={courseId}
      listingId={listingId}
      submissionId={submissionId}
    />
  );
};

// Wired as this route's `errorElement`. If `PreviewAttemptPage`/`PreviewProvider` throws during
// initial render — i.e. before either's mount effect has had a chance to register its own
// cleanup — the loader's eager seed (loader.ts) is left set with nothing left to clear it. This
// closes that window; see the "belt-and-suspenders invariant" note above for the full set of
// set/clear sites this belongs to.
export const PreviewAttemptErrorElement: FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    setActivePreview(null);
  }, []);

  return (
    <Page className="m-auto flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
      <Typography variant="h5">
        {t({
          defaultMessage: 'Something went wrong loading this preview attempt.',
        })}
      </Typography>
      <Typography color="text.secondary">
        {t({
          defaultMessage: 'Please try again, or go back to the listing.',
        })}
      </Typography>
    </Page>
  );
};
