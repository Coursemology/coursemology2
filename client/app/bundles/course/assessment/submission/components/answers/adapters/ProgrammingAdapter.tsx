import ProgrammingAnswer from '../Programming';
import type { ProgrammingAnswerProps } from '../types';

const ProgrammingAdapter = (props: ProgrammingAnswerProps): JSX.Element => {
  const { question, answerId, readOnly, saveAnswerAndUpdateClientVersion } =
    props;
  return (
    <ProgrammingAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
    />
  );
};

export default ProgrammingAdapter;
