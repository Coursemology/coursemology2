import { FC } from 'react';
import { Typography } from '@mui/material';

import Accordion from 'lib/components/core/layouts/Accordion';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getSubmissionQuestionHistory } from '../../selectors/history';
import translations from '../../translations';

interface Props {
  questionId: number;
  submissionId: number;
}

const AllAttemptsQuestion: FC<Props> = (props) => {
  const { submissionId, questionId } = props;

  const { t } = useTranslation();

  const { question } = useAppSelector(
    getSubmissionQuestionHistory(submissionId, questionId),
  );

  return (
    <Accordion
      defaultExpanded={false}
      disabled={false}
      title={t(translations.historyQuestionTitle)}
    >
      <div className="ml-4 mt-4">
        {question !== null && question !== undefined && (
          <>
            <Typography variant="body1">{question.questionTitle}</Typography>
            <Typography
              dangerouslySetInnerHTML={{
                __html: question.description,
              }}
              variant="body2"
            />
          </>
        )}
      </div>
    </Accordion>
  );
};

export default AllAttemptsQuestion;
