import RubricBasedResponseAnswer from '../RubricBasedResponse';
import type { RubricBasedResponseAnswerProps } from '../types';

const RubricBasedResponseAdapter = (
  props: RubricBasedResponseAnswerProps,
): JSX.Element => {
  const { question, answerId, readOnly, saveAnswerAndUpdateClientVersion } =
    props;
  return (
    <RubricBasedResponseAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
    />
  );
};

export default RubricBasedResponseAdapter;
