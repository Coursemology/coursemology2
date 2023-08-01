import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Button } from '@mui/material';

import Link from 'lib/components/core/Link';
import { getEditAssessmentSubmissionURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

interface Props extends WrappedComponentProps {
  canGrade: boolean;
  assessmentId: number;
  submissionId: number;
}

const translations = defineMessages({
  viewButton: {
    id: 'course.assessment.submissions.SubmissionsTableButton.viewButton',
    defaultMessage: 'View',
  },
  gradeButton: {
    id: 'course.assessment.submissions.SubmissionsTableButton.gradeButton',
    defaultMessage: 'Grade',
  },
});

const SubmissionsTableButton: FC<Props> = (props) => {
  const { intl, canGrade, assessmentId, submissionId } = props;

  return (
    <Link
      to={getEditAssessmentSubmissionURL(
        getCourseId(),
        assessmentId,
        submissionId,
      )}
    >
      <Button
        color={canGrade ? 'primary' : 'info'}
        id={`submission-button-${submissionId}`}
        size="small"
        variant="contained"
      >
        {canGrade
          ? intl.formatMessage(translations.gradeButton)
          : intl.formatMessage(translations.viewButton)}
      </Button>
    </Link>
  );
};

export default injectIntl(SubmissionsTableButton);
