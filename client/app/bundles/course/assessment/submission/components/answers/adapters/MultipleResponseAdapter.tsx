import MultipleResponseAnswer from '../MultipleResponse';
import type { MrqAnswerProps } from '../types';

const MultipleResponseAdapter = (props: MrqAnswerProps): JSX.Element => {
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
    <MultipleResponseAnswer
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

export default MultipleResponseAdapter;
