import { FC, ReactElement } from 'react';
import { Link } from 'react-router-dom';
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
  icon?: ReactElement;
  // The "unstarted" workflow state represents a student who has not clicked "Attempt" to create a submission
  // (i.e. the submission for the assessment from them does not exist)
  workflowState: WorkflowState | typeof workflowStates.Unstarted;
}

const SubmissionWorkflowState: FC<SubmissionWorkflowStateProps> = (props) => {
  const { className, linkTo, opensInNewTab, workflowState } = props;
  const { t } = useTranslation();

  if (workflowState === workflowStates.Unstarted || !linkTo) {
    return (
      <Chip
        className={`w-fit py-1.5 h-auto ${palette.submissionStatusClassName[workflowState]} ${className}`}
        icon={props.icon}
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
      className={`text-blue-800 hover:underline w-fit py-1.5 h-auto ${palette.submissionStatusClassName[workflowState]} ${className}`}
      component={Link}
      icon={props.icon}
      label={t(translations[workflowState])}
      to={linkTo}
      variant="filled"
    />
  );
};

export default SubmissionWorkflowState;
