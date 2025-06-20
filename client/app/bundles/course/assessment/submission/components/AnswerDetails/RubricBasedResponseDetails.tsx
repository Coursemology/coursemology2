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
      <RubricPanel
        answerCategoryGrades={answer.categoryGrades}
        answerId={answer.id}
        question={question}
        readOnly
        setIsFirstRendering={() => {}} // Placeholder function since RubricPanel is not editable here
      />
    </>
  );
};

export default RubricBasedResponseDetails;
