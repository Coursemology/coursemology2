import { QuestionType } from 'types/course/assessment/question';

import UserHTMLText from 'lib/components/core/UserHTMLText';

import RubricPanel from '../../containers/RubricPanel';
import { AnswerDetailsProps } from '../../types';

const RubricBasedResponseDetails = (
  props: AnswerDetailsProps<QuestionType.RubricBasedResponse>,
): JSX.Element => {
  const { question, answer } = props;
  return (
    <>
      <UserHTMLText html={answer.fields.answer_text} />
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
