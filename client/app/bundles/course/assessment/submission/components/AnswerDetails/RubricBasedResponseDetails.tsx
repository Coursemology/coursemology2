import { Typography } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';

import { AnswerDetailsProps } from '../../types';

import AttachmentDetails from './AttachmentDetails';

const RubricBasedResponseDetails = (
  props: AnswerDetailsProps<QuestionType.RubricBasedResponse>,
): JSX.Element => {
  const { question, answer } = props;

  return (
    <Typography
      dangerouslySetInnerHTML={{ __html: answer.fields.answer_text }}
      variant="body2"
    />
  );
};

export default RubricBasedResponseDetails;
