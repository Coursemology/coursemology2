import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Chip, Typography } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import { CommentItem } from 'types/course/assessment/submission/submission-question';

import { fetchAnswer } from 'course/assessment/operations/history';
import { fetchSubmissionQuestionDetails } from 'course/assessment/operations/history';
import Comment from 'course/assessment/submission/components/AllAttempts/Comment';
import AnswerDetails from 'course/assessment/submission/components/AnswerDetails/AnswerDetails';
import { AnswerDataWithQuestion } from 'course/assessment/submission/types';
import Accordion from 'lib/components/core/layouts/Accordion';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import submissionTranslations from '../../../submission/translations';

import { getClassNameForMarkCell } from '../classNameUtils';

const translations = defineMessages({
  gradeDisplay: {
    id: 'course.assessment.statistics.gradeDisplay',
    defaultMessage: 'Grade: {grade} / {maxGrade}',
  },
  submissionPage: {
    id: 'course.assessment.statistics.submissionPage',
    defaultMessage: 'Go to Answer Page',
  },
});

interface Props {
  curAnswerId: number;
  questionId: number;
  submissionId: number;
}

interface LastAttemptData {
  answer: AnswerDataWithQuestion<keyof typeof QuestionType>;
  comments: CommentItem[];
}

const LastAttemptIndex: FC<Props> = (props) => {
  const { curAnswerId, submissionId, questionId } = props;
  const { t } = useTranslation();

  const fetchAnswerDetailsAndComments = async (): Promise<LastAttemptData> => {
    const [answer, submissionQuestion] = await Promise.all([
      fetchAnswer(submissionId, curAnswerId),
      fetchSubmissionQuestionDetails(submissionId, questionId),
    ]);
    return { answer, comments: submissionQuestion.comments };
  };

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchAnswerDetailsAndComments}
    >
      {({ answer, comments }: LastAttemptData): JSX.Element => {
        console.log({ answer });
        const gradeCellColor = getClassNameForMarkCell(
          answer.grading?.grade,
          answer.question.maximumGrade,
        );
        return (
          <>
            <Accordion
              defaultExpanded={false}
              title={t(submissionTranslations.historyQuestionTitle)}
            >
              <div className="ml-4 mt-4">
                <Typography variant="body1">
                  {answer.question.questionTitle}
                </Typography>
                <Typography
                  dangerouslySetInnerHTML={{
                    __html: answer.question.description,
                  }}
                  variant="body2"
                />
              </div>
            </Accordion>
            <AnswerDetails answer={answer} question={answer.question} />
            <Chip
              className={`w-100 mt-3 ${gradeCellColor}`}
              label={t(translations.gradeDisplay, {
                grade: answer.grading?.grade ?? '--',
                maxGrade: answer.question.maximumGrade,
              })}
              variant="filled"
            />
            {comments.length > 0 && <Comment comments={comments} />}
          </>
        );
      }}
    </Preload>
  );
};

export default LastAttemptIndex;
