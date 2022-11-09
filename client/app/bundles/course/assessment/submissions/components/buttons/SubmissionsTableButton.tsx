import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Button } from '@mui/material';

import { getEditAssessmentSubmissionURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

interface Props extends WrappedComponentProps {
  canGrade: boolean;
  assessmentId: number;
  submissionId: number;
}

const translations = defineMessages({
  viewButton: {
    id: 'course.assessments.submissions.viewButton',
    defaultMessage: 'View',
  },
  gradeButton: {
    id: 'course.assessments.submissions.gradeButton',
    defaultMessage: 'Grade',
  },
});

const SubmissionsTableButton: FC<Props> = (props) => {
  const { intl, canGrade, assessmentId, submissionId } = props;

  return (
    <Button
      color={canGrade ? 'primary' : 'info'}
      href={getEditAssessmentSubmissionURL(
        getCourseId(),
        assessmentId,
        submissionId,
      )}
      id={`submission-button-${submissionId}`}
      size="small"
      variant="contained"
    >
      {canGrade
        ? intl.formatMessage(translations.gradeButton)
        : intl.formatMessage(translations.viewButton)}
    </Button>
  );
};

export default injectIntl(SubmissionsTableButton);
