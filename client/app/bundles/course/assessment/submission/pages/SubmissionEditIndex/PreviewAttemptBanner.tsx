import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RestartAlt, Visibility } from '@mui/icons-material';
import { Alert, Button } from '@mui/material';

import CourseAPI from 'api/course';
import { useCourseContext } from 'course/container/CourseLoader';
import { setNotification } from 'lib/actions';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { fetchSubmission } from '../../actions';
import translations from '../../translations';

import PreviewAttemptContext from './PreviewAttemptContext';

const PreviewAttemptBanner = (): JSX.Element | null => {
  const { isPreview, attemptId, listingId } = useContext(PreviewAttemptContext);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { courseUrl } = useCourseContext();
  const { t } = useTranslation();

  if (!isPreview || attemptId === undefined) return null;

  const backTo = listingId
    ? `${courseUrl}/marketplace/listings/${listingId}`
    : `${courseUrl}/marketplace`;

  const handleReset = async (): Promise<void> => {
    await CourseAPI.assessment.submissions.reset(attemptId);
    dispatch(setNotification(translations.resetPreviewSuccess));
    dispatch(fetchSubmission(attemptId));
  };

  return (
    <Alert
      action={
        <div className="flex items-center gap-2">
          <Button
            color="inherit"
            onClick={handleReset}
            size="small"
            startIcon={<RestartAlt />}
          >
            {t(translations.resetPreview)}
          </Button>
          <Button
            color="inherit"
            onClick={(): void => navigate(backTo)}
            size="small"
          >
            {t(translations.exitPreview)}
          </Button>
        </div>
      }
      icon={<Visibility />}
      severity="info"
    >
      {t(translations.previewBanner)}
    </Alert>
  );
};

export default PreviewAttemptBanner;
