import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCourseContext } from 'course/container/CourseLoader';
import { setNotification } from 'lib/actions';
import { useAppDispatch } from 'lib/hooks/store';

import { createAttempt } from './operations';
import translations from './translations';

interface StartPreviewAttempt {
  starting: boolean;
  start: (listingId: number) => Promise<void>;
}

/**
 * Shared entrance into a marketplace preview attempt: create the attempt, then navigate
 * to the reused submission editor (carrying `fromListing` so the preview banner's Exit can
 * link back to the listing). On a 409 conflict (the previewer already has a real submission
 * for the assessment) it notifies and stays put. Used by both the listing preview page and
 * the marketplace index row action.
 */
const useStartPreviewAttempt = (): StartPreviewAttempt => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { courseUrl } = useCourseContext();
  const [starting, setStarting] = useState(false);

  const start = async (listingId: number): Promise<void> => {
    setStarting(true);
    try {
      const { id } = await createAttempt(listingId);
      navigate(
        `${courseUrl}/marketplace/attempt/${id}/edit?fromListing=${listingId}`,
      );
    } catch {
      dispatch(setNotification(translations.attemptFailed));
      setStarting(false);
    }
  };

  return { starting, start };
};

export default useStartPreviewAttempt;
