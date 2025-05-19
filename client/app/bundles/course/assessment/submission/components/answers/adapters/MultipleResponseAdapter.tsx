import MultipleResponseAnswer from '../MultipleResponse';
import type { MrqAnswerProps } from '../types';

const MultipleResponseAdapter = (props: MrqAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    readOnly,
    graderView,
    showMcqMrqSolution,
    saveAnswerAndUpdateClientVersion,
  } = props;
  return (
    <MultipleResponseAnswer
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

export default MultipleResponseAdapter;
