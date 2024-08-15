import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@mui/material';
import { AnswerData } from 'types/course/assessment/submission/answer';

import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import { finalise } from '../../actions';
import { formNames, workflowStates } from '../../constants';
import GradingPanel from '../../containers/GradingPanel';
import { getSubmission } from '../../selectors/submissions';

import SaveGradeButton from './components/button/SaveGradeButton';
import SubmitEmptyFormButton from './components/button/SubmitEmptyFormButton';
import UnsubmitButton from './components/button/UnsubmitButton';

const SubmissionEmptyForm: FC = () => {
  const { handleSubmit } = useForm();
  const dispatch = useAppDispatch();

  const submission = useAppSelector(getSubmission);

  const submissionId = getSubmissionId();

  const { canUpdate, graderView, workflowState } = submission;

  const attempting = workflowState === workflowStates.Attempting;
  const submitted = workflowState === workflowStates.Submitted;
  const published = workflowState === workflowStates.Published;

  const needShowSubmitButton = attempting && canUpdate;
  const needShowUnsubmitButton = graderView && (submitted || published);

  const onSubmit = (data: Record<number, AnswerData>): void => {
    dispatch(finalise(submissionId, data));
  };

  return (
    (needShowSubmitButton || needShowUnsubmitButton) && (
      <Card className="mt-5 p-10 w-full">
        <form id={formNames.SUBMISSION} onSubmit={handleSubmit(onSubmit)}>
          <GradingPanel />
          <SaveGradeButton />
          <SubmitEmptyFormButton />
          <UnsubmitButton />
        </form>
      </Card>
    )
  );
};

export default SubmissionEmptyForm;
