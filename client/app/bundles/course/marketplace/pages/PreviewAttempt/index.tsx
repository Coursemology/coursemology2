import { useState } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';

// The platform's real submission page: the attempt for the previewer, the grading UI once they
// finalise. Reused verbatim — the masking is what lets it run here, so none of it is reimplemented.
import SubmissionEditIndex from 'course/assessment/submission/pages/SubmissionEditIndex';
import { useCourseContext } from 'course/container/CourseLoader';

import DuplicateConfirmation from '../../components/DuplicateConfirmation';
import { PreviewAttemptData } from '../../types';

import PreviewBanner from './PreviewBanner';

export { previewAttemptLoader } from './loader';

const courseIdFromPath = (path: string): number | null => {
  const match = path.match(/^\/courses\/(\d+)/);
  return match ? Number(match[1]) : null;
};

const PreviewAttempt = (): JSX.Element => {
  const { listingTitle, previewGradingInert } =
    useLoaderData() as PreviewAttemptData;
  const { listingId } = useParams();
  const { courseTitle, courseUrl } = useCourseContext();
  const [duplicating, setDuplicating] = useState(false);
  const visibleCourseId = courseIdFromPath(courseUrl);

  // We deliberately do NOT clear the preview identity on unmount. The loader resets it (clears then
  // sets) on every entry to a preview, and off the attempt route it is inert by design (see
  // previewIdentity's PREVIEW_PATH invariant). Clearing on unmount instead tore the identity out
  // from under the still-mounted page during React StrictMode's dev mount/unmount/remount, so the
  // reused submission page then resolved a null course/submission from the URL.

  return (
    <>
      <PreviewBanner
        listingTitle={listingTitle}
        onDuplicate={(): void => setDuplicating(true)}
        previewGradingInert={previewGradingInert}
      />

      <SubmissionEditIndex />

      <DuplicateConfirmation
        courseId={visibleCourseId}
        destinationCategory={null}
        destinationCourse={{ title: courseTitle, url: courseUrl }}
        destinationTab={null}
        destinationTabId={null}
        listings={[{ id: Number(listingId), title: listingTitle }]}
        onClose={(): void => setDuplicating(false)}
        open={duplicating}
      />
    </>
  );
};

export default PreviewAttempt;
