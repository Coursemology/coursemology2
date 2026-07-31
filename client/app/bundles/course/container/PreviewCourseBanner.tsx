import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Alert, Typography } from '@mui/material';

import ResetSubmissionButton from 'course/marketplace/components/ResetSubmissionButton';
import { getAssessmentId, getSubmissionId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  header: {
    id: 'course.courses.PreviewCourseBanner.header',
    defaultMessage:
      'You are in the Assessment Marketplace preview sandbox. Answers, submissions and grades stay here and never reach a real course.',
  },
});

// Mounted by CourseContainer on every page of the marketplace preview sandbox course, but only
// speaks on a submission page. The promise it makes is about work a previewer produces, so it is
// only worth making where they are producing some; elsewhere in the sandbox there is nothing to
// reassure anyone about, and the Reset submission action it hosts has nothing to act on. A
// restricted previewer never sees the difference: PreviewLaunchService lands them straight on the
// submission, and the de-linked breadcrumbs and sidebar keep them there. A system administrator
// does — they curate the container from inside it (version snapshots, the authoring copies
// RestoreAuthoringJob rebuilds), and a sandbox notice on every page of that is pure nag.
//
// Read straight off the URL (mirroring `BaseCourseAPI#courseId`) rather than route params: this
// banner is mounted alongside `<Outlet/>`, not inside it, and preview pages are ordinary
// assessment/submission routes with no preview-only param to key off. CourseContainer subscribes to
// `useLocation`, so it re-renders this on every in-app navigation.
const PreviewCourseBanner: FC = () => {
  const { t } = useTranslation();

  const assessmentId = getAssessmentId();
  const submissionId = getSubmissionId();

  if (!assessmentId || !submissionId) return null;

  return (
    <Alert
      action={
        <ResetSubmissionButton
          assessmentId={assessmentId}
          submissionId={submissionId}
        />
      }
      severity="info"
      sx={{ alignItems: 'center' }}
    >
      <Typography variant="body2">{t(translations.header)}</Typography>
    </Alert>
  );
};

export default PreviewCourseBanner;
