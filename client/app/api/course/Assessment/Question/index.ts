import McqMrqAPI from './McqMrq';
import ScribingQuestionAPI from './Scribing';
import VoiceAPI from './Voice';

const QuestionAPI = {
  mcqMrq: new McqMrqAPI(),
  scribing: new ScribingQuestionAPI(),
  voice: new VoiceAPI(),
};

Object.freeze(QuestionAPI);

export default QuestionAPI;
