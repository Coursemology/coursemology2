import MultipleChoiceAnswer from '../MultipleChoice';
import type { McqAnswerProps } from '../types';

const MultipleChoiceAdapter = (props: McqAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    readOnly,
    graderView,
    published,
    showMcqMrqSolution,
    saveAnswerAndUpdateClientVersion,
  } = props;
  return (
    <MultipleChoiceAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      graderView={graderView}
      published={published}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
      showMcqMrqSolution={showMcqMrqSolution}
    />
  );
};

export default MultipleChoiceAdapter;
