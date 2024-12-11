import { FC, RefObject } from 'react';
import { Divider, Paper } from '@mui/material';

import Header from 'course/assessment/submission/pages/SubmissionEditIndex/components/GetHelp/Header';
import InputArea from 'course/assessment/submission/pages/SubmissionEditIndex/components/GetHelp/InputArea';
import MessageList from 'course/assessment/submission/pages/SubmissionEditIndex/components/GetHelp/MessageList';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getFeedbackByQuestionId } from 'course/assessment/submission/selectors/liveFeedbacks';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { EditorRef } from 'course/assessment/submission/types';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppSelector } from 'lib/hooks/store';

interface GetHelpPageProps {
  stepIndex: number;
  editorRef: RefObject<EditorRef>;
}

const GetHelpPage: FC<GetHelpPageProps> = ({ stepIndex, editorRef }) => {
  const assessment = useAppSelector(getAssessment);
  const questions = useAppSelector(getQuestions);
  const submissionId = getSubmissionId();
  const { questionIds } = assessment;
  const questionId = questionIds[stepIndex];
  const question = questions[questionId];
  const { answerId } = question;
  const liveFeedback = useAppSelector((state) =>
    getFeedbackByQuestionId(state, questionId),
  );
  const isRequestingLiveFeedback = !!liveFeedback?.isRequestingLiveFeedback;
  const conversation = liveFeedback?.conversation ?? [];
  const suggestedReplies = liveFeedback?.suggestedReplies ?? [];
  const focusedMessageIndex = liveFeedback?.focusedMessageIndex;

  const questionIndex = questionIds.findIndex((id) => id === questionId) + 1;

  return (
    <div className="absolute top-[-3.3%] right-0 z-[1000] w-2/5 h-[113%] flex flex-col p-0">
      <Paper className="absolute right-0 z-[1000] w-full h-full flex flex-col p-0">
        <Header questionId={questionId} />
        <Divider className="m-0" />
        <MessageList
          editorRef={editorRef}
          focusedMessageIndex={focusedMessageIndex}
          loading={isRequestingLiveFeedback}
          messages={conversation}
        />
        <InputArea
          answerId={answerId}
          loading={isRequestingLiveFeedback}
          questionId={questionId}
          questionIndex={questionIndex}
          submissionId={submissionId}
          suggestions={suggestedReplies}
        />
      </Paper>
    </div>
  );
};

export default GetHelpPage;
