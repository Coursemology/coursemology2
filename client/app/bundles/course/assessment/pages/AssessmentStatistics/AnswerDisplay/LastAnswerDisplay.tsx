import { FC } from 'react';
import { defineMessages } from 'react-intl';
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import {
  Answer,
  CommentItem,
} from 'types/course/statistics/assessmentStatistics';

import {
  fetchAnswer,
  fetchSubmissionQuestionDetails,
} from 'course/assessment/operations/statistics';
import Accordion from 'lib/components/core/layouts/Accordion';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import AnswerDetails from '../AnswerDetails/AnswerDetails';
import { getClassNameForMarkCell } from '../classNameUtils';

import Comment from './Comment';
import { processLastAttempt } from './utils';

const translations = defineMessages({
  questionTitle: {
    id: 'course.assessment.statistics.questionTitle',
    defaultMessage: 'Question {index}',
  },
  gradeDisplay: {
    id: 'course.assessment.statistics.gradeDisplay',
    defaultMessage: 'Grade: {grade} / {maxGrade}',
  },
  submissionPage: {
    id: 'course.assessment.statistics.submissionPage',
    defaultMessage: 'Go to Answer Page',
  },
  submittedAt: {
    id: 'course.assessment.statistics.submittedAt',
    defaultMessage: 'Submitted At',
  },
});

interface Props {
  currAnswerId: number;
  index: number;
  questionId: number;
  submissionId: number;
}

const LastAnswerDisplay: FC<Props> = (props) => {
  const { currAnswerId, index, submissionId, questionId } = props;
  const { t } = useTranslation();

  const fetchAnswerDetailsAndComments = async (): Promise<{
    answer: Answer<keyof typeof QuestionType>;
    comments: CommentItem[];
  }> => {
    const [answer, submissionQuestion] = await Promise.all([
      fetchAnswer(currAnswerId),
      fetchSubmissionQuestionDetails(submissionId, questionId),
    ]);
    return { answer, comments: submissionQuestion.comments };
  };

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchAnswerDetailsAndComments}
    >
      {({ answer, comments }): JSX.Element => {
        const gradeCellColor = getClassNameForMarkCell(
          answer.grade,
          answer.question.maximumGrade,
        );

        const { allProcessedAnswers } = processLastAttempt(
          answer.question,
          answer,
        );

        return (
          <>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="w-1/4">
                    {t(translations.submittedAt)}
                  </TableCell>
                  <TableCell>
                    {formatLongDateTime(answer.submittedAt)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Accordion
              defaultExpanded={false}
              disableGutters
              title={t(translations.questionTitle, { index })}
            >
              <div className="ml-4 mt-4">
                <Typography variant="body1">{answer.question.title}</Typography>
                <Typography
                  dangerouslySetInnerHTML={{
                    __html: answer.question.description,
                  }}
                  variant="body2"
                />
              </div>
            </Accordion>
            <AnswerDetails
              answer={allProcessedAnswers}
              question={answer.question}
            />
            <Chip
              className={`w-100 mt-3 ${gradeCellColor}`}
              label={t(translations.gradeDisplay, {
                grade: answer.grade,
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

export default LastAnswerDisplay;
