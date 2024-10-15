import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { Question } from 'types/course/statistics/assessmentStatistics';

import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  memoryLimit: {
    id: 'course.assessment.statistics.ProgrammingQuestionDetails.memoryLimit',
    defaultMessage: '{memoryLimit}MB',
  },
  timeLimit: {
    id: 'course.assessment.statistics.ProgrammingQuestionDetails.timeLimit',
    defaultMessage: '{timeLimit}s',
  },
});

const CELL_WIDTH = '50%';

interface Props {
  question: Question<'Programming'>;
}

const ProgrammingQuestionDetails: FC<Props> = (props): JSX.Element => {
  const { question } = props;
  const { t } = useTranslation();

  return (
    <Table size="small">
      <TableBody>
        <TableRow>
          <TableCell width={CELL_WIDTH}>Language</TableCell>
          <TableCell>{question.language || '-'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell width={CELL_WIDTH}>Memory Limit</TableCell>
          <TableCell>
            {question.memoryLimit
              ? t(translations.memoryLimit, {
                  memoryLimit: question.memoryLimit,
                })
              : '-'}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell width={CELL_WIDTH}>Time Limit</TableCell>
          <TableCell>
            {question.timeLimit
              ? t(translations.timeLimit, { timeLimit: question.timeLimit })
              : '-'}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell width={CELL_WIDTH}>Attempt Limit</TableCell>
          <TableCell>{question.attemptLimit || '-'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell width={CELL_WIDTH}>Is Codaveri</TableCell>
          <TableCell>{question.isCodaveri ? '✅' : '❌'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell width={CELL_WIDTH}>Live Feedback Enabled</TableCell>
          <TableCell>{question.liveFeedbackEnabled ? '✅' : '❌'}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default ProgrammingQuestionDetails;
