import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { OpenInNew } from '@mui/icons-material';
import {
  Card,
  CardHeader,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { green } from '@mui/material/colors';
import { QuestionType } from 'types/course/assessment/question';
import { LatestAnswer } from 'types/course/statistics/assessmentStatistics';

import { fetchLatestAnswer } from 'course/assessment/operations/statistics';
import Accordion from 'lib/components/core/layouts/Accordion';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { getEditSubmissionQuestionURL } from 'lib/helpers/url-builders';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import AnswerDetails from '../AnswerDetails/AnswerDetails';
import { getClassNameForMarkCell } from '../classNameUtils';

import Comment from './Comment';

const translations = defineMessages({
  questionTitle: {
    id: 'course.assessment.statistics.questionTitle',
    defaultMessage: 'Question {index}',
  },
  gradeDisplay: {
    id: 'course.assessment.statistics.gradeDisplay',
    defaultMessage: 'Grade: {grade} / {maxGrade}',
  },
  morePastAnswers: {
    id: 'course.assessment.statistics.morePastAnswers',
    defaultMessage: 'View All Past Answers',
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
  name: string;
}

const LatestAnswerDisplay: FC<Props> = (props) => {
  const { currAnswerId, index, name } = props;
  const { courseId, assessmentId } = useParams();
  const { t } = useTranslation();

  const fetchLatestAnswerDetails = (): Promise<
    LatestAnswer<keyof typeof QuestionType>
  > => {
    return fetchLatestAnswer(currAnswerId);
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchLatestAnswerDetails}>
      {(data): JSX.Element => {
        const gradeCellColor = getClassNameForMarkCell(
          data.answer.grade,
          data.question.maximumGrade,
        );
        const submissionEditUrl = getEditSubmissionQuestionURL(
          courseId,
          assessmentId,
          data.submissionId,
          index,
        );
        return (
          <>
            <Card className="mb-4" variant="outlined">
              <CardHeader
                action={
                  <div className="space-x-2">
                    <Tooltip
                      placement="top"
                      title={t(translations.submissionPage)}
                    >
                      <IconButton
                        className="p-2"
                        component={Link}
                        rel="noopener noreferrer"
                        size="small"
                        target="_blank"
                        to={submissionEditUrl}
                      >
                        <OpenInNew />
                      </IconButton>
                    </Tooltip>
                  </div>
                }
                style={{ backgroundColor: green[100] }}
                title={<Typography variant="h6">{name}</Typography>}
              />

              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="w-1/4">
                      {t(translations.submittedAt)}
                    </TableCell>
                    <TableCell>
                      {formatLongDateTime(data.answer.submittedAt)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>

            <Accordion
              defaultExpanded={false}
              disableGutters
              title={t(translations.questionTitle, { index })}
            >
              <div className="ml-4 mt-4">
                <Typography variant="body1">{data.question.title}</Typography>
                <Typography
                  dangerouslySetInnerHTML={{
                    __html: data.question.description,
                  }}
                  variant="body2"
                />
              </div>
            </Accordion>
            <AnswerDetails answer={data.answer} question={data.question} />
            <Chip
              className={`w-100 mt-3 ${gradeCellColor}`}
              label={t(translations.gradeDisplay, {
                grade: data.answer.grade,
                maxGrade: data.question.maximumGrade,
              })}
              variant="filled"
            />
            {data.comments.length > 0 && <Comment comments={data.comments} />}
          </>
        );
      }}
    </Preload>
  );
};

export default LatestAnswerDisplay;
