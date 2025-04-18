import MultipleChoiceAnswer from '../MultipleChoice';
import type { McqAnswerProps } from '../types';

const MultipleChoiceAdapter = (props: McqAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    readOnly,
    graderView,
    showMcqMrqSolution,
    saveAnswerAndUpdateClientVersion,
  } = props;
  return (
    <MultipleChoiceAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      graderView={graderView}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
      showMcqMrqSolution={showMcqMrqSolution}
    />
  );
};

export default MultipleChoiceAdapter;
