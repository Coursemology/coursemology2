import { useEffect, useState } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';

// The platform's real submission page: the attempt for the previewer, the grading UI once they
// finalise. Reused verbatim — the masking is what lets it run here, so none of it is reimplemented.
import SubmissionEditIndex from 'course/assessment/submission/pages/SubmissionEditIndex';
import { useCourseContext } from 'course/container/CourseLoader';
import { clearPreviewIdentity } from 'lib/helpers/previewIdentity';

import DuplicateConfirmation from '../../components/DuplicateConfirmation';
import { PreviewAttemptData } from '../../types';

import PreviewBanner from './PreviewBanner';

export { previewAttemptLoader } from './loader';

const courseIdFromPath = (path: string): number | null => {
  const match = path.match(/^\/courses\/(\d+)/);
  return match ? Number(match[1]) : null;
};

const PreviewAttempt = (): JSX.Element => {
  const { listingTitle } = useLoaderData() as PreviewAttemptData;
  const { listingId } = useParams();
  const { courseTitle, courseUrl } = useCourseContext();
  const [duplicating, setDuplicating] = useState(false);
  const visibleCourseId = courseIdFromPath(courseUrl);

  // Leaving the preview must restore ordinary URL-based identity resolution immediately.
  useEffect(() => clearPreviewIdentity, []);

  return (
    <>
      <PreviewBanner
        listingTitle={listingTitle}
        onDuplicate={(): void => setDuplicating(true)}
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
