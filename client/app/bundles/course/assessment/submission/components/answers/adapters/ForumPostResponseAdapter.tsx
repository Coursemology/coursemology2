import ForumPostResponseAnswer from '../ForumPostResponse';
import type { ForumPostResponseAnswerProps } from '../types';

const ForumPostResponseAdapter = (
  props: ForumPostResponseAnswerProps,
): JSX.Element => {
  const { question, answerId, readOnly, saveAnswerAndUpdateClientVersion } =
    props;
  return (
    <ForumPostResponseAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
    />
  );
};

export default ForumPostResponseAdapter;
