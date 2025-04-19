import VoiceResponseAnswer from '../../../containers/VoiceResponseAnswer';
import type { VoiceResponseAnswerProps } from '../types';

const VoiceResponseAdapter = (props: VoiceResponseAnswerProps): JSX.Element => {
  const { question, answerId, readOnly, saveAnswerAndUpdateClientVersion } =
    props;
  return (
    <VoiceResponseAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
    />
  );
};

export default VoiceResponseAdapter;
