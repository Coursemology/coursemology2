import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Chip, Typography } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import { QuestionAnswerDetails } from 'types/course/statistics/assessmentStatistics';

import { fetchQuestionAnswerDetails } from 'course/assessment/operations/statistics';
import Accordion from 'lib/components/core/layouts/Accordion';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import AnswerDetails from '../AnswerDetails/AnswerDetails';
import { getClassNameForMarkCell } from '../classNameUtils';

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
});

interface Props {
  curAnswerId: number;
  index: number;
}

const LastAttemptIndex: FC<Props> = (props) => {
  const { curAnswerId, index } = props;
  const { t } = useTranslation();

  const fetchQuestionAndCurrentAnswerDetails = (): Promise<
    QuestionAnswerDetails<keyof typeof QuestionType>
  > => {
    return fetchQuestionAnswerDetails(curAnswerId);
  };

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchQuestionAndCurrentAnswerDetails}
    >
      {(data): JSX.Element => {
        const gradeCellColor = getClassNameForMarkCell(
          data.answer.grade,
          data.question.maximumGrade,
        );
        return (
          <>
            <Accordion
              defaultExpanded={false}
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
          </>
        );
      }}
    </Preload>
  );
};

export default LastAttemptIndex;
