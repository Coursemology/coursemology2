import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Warning } from '@mui/icons-material';
import { Chip } from '@mui/material';
import palette from 'theme/palette';
import { WorkflowState } from 'types/course/assessment/submission/submission';

import useTranslation from 'lib/hooks/useTranslation';

import { workflowStates } from '../constants';
import translations from '../translations';

interface SubmissionWorkflowStateProps {
  className?: string;
  linkTo?: string;
  opensInNewTab?: boolean;
  // The "unstarted" workflow state represents a student who has not clicked "Attempt" to create a submission
  // (i.e. the submission for the assessment from them does not exist)
  workflowState: WorkflowState | typeof workflowStates.Unstarted;
}

const SubmissionWorkflowState: FC<SubmissionWorkflowStateProps> = (props) => {
  const { className, linkTo, opensInNewTab, workflowState } = props;
  const { t } = useTranslation();

  const renderUnpublishedWarning = (): JSX.Element | undefined => {
    if (workflowState === workflowStates.Graded) {
      return (
        <span style={{ display: 'inline-block', paddingLeft: 5 }}>
          <div data-tooltip-id="unpublished-grades" data-tooltip-offset={8}>
            <Warning fontSize="inherit" />
          </div>
        </span>
      );
    }
    return undefined;
  };

  if (workflowState === workflowStates.Unstarted || !linkTo) {
    return (
      <Chip
        className={`${palette.submissionStatusClassName[workflowState]} ${className}`}
        icon={renderUnpublishedWarning()}
        label={t(translations[workflowState])}
        variant="filled"
      />
    );
  }
  return (
    <Chip
      clickable
      {...(opensInNewTab && {
        target: '_blank',
        rel: 'noopener noreferrer',
      })}
      className={`text-blue-800 ${palette.submissionStatusClassName[workflowState]} ${className}`}
      component={Link}
      icon={renderUnpublishedWarning()}
      label={t(translations[workflowState])}
      to={linkTo}
      variant="filled"
    />
  );
};

export default SubmissionWorkflowState;
