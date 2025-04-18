import TextResponseAnswer from '../TextResponse';
import type { TextResponseAnswerProps } from '../types';

const TextResponseAdapter = (props: TextResponseAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    readOnly,
    graderView,
    saveAnswerAndUpdateClientVersion,
    handleUploadTextResponseFiles,
  } = props;
  return (
    <TextResponseAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      graderView={graderView}
      handleUploadTextResponseFiles={handleUploadTextResponseFiles}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
    />
  );
};

export default TextResponseAdapter;
