import McqMrqAPI from './McqMrq';
import ScribingQuestionAPI from './Scribing';
import VoiceResponseAPI from './VoiceResponse';

const QuestionAPI = {
  mcqMrq: new McqMrqAPI(),
  scribing: new ScribingQuestionAPI(),
  voice: new VoiceResponseAPI(),
};

Object.freeze(QuestionAPI);

export default QuestionAPI;
