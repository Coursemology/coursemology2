import { FC } from 'react';
import { Divider, Typography } from '@mui/material';
import { AnswerDetails } from 'types/course/statistics/assessmentStatistics';

import { fetchAnswerDetails } from 'course/assessment/operations/statistics';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

interface Props {
  curAnswerId: number;
}

const AnswerDisplay: FC<Props> = (props) => {
  const { curAnswerId } = props;

  const fetchCurrentAnswerDetails = (): Promise<AnswerDetails> => {
    return fetchAnswerDetails(curAnswerId);
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchCurrentAnswerDetails}>
      {(data): JSX.Element => (
        <div>
          <Typography variant="body1">{data.question.title}</Typography>
          <Typography
            dangerouslySetInnerHTML={{ __html: data.question.description }}
            variant="body2"
          />
          <Divider />
        </div>
      )}
    </Preload>
  );
};

export default AnswerDisplay;
