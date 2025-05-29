import { Typography } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';

import RubricPanel from '../../containers/RubricPanel';
import { AnswerDetailsProps } from '../../types';

const RubricBasedResponseDetails = (
  props: AnswerDetailsProps<QuestionType.RubricBasedResponse>,
): JSX.Element => {
  const { question, answer } = props;

  return (
    <>
      <Typography
        dangerouslySetInnerHTML={{ __html: answer.fields.answer_text }}
        variant="body2"
      />
      <RubricPanel questionId={question.id} setIsFirstRendering={() => {}} />
    </>
  );
};

export default RubricBasedResponseDetails;
