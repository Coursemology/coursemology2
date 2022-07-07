import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';

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
      id={`submission-button-${submissionId}`}
      href={getEditAssessmentSubmissionURL(
        getCourseId(),
        assessmentId,
        submissionId,
      )}
      variant="contained"
      size="small"
      color={canGrade ? 'primary' : 'info'}
    >
      {canGrade
        ? intl.formatMessage(translations.gradeButton)
        : intl.formatMessage(translations.viewButton)}
    </Button>
  );
};

export default injectIntl(SubmissionsTableButton);
