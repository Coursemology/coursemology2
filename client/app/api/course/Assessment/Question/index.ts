import McqMrqAPI from './McqMrq';
import ScribingQuestionAPI from './Scribing';

const QuestionAPI = {
  mcqMrq: new McqMrqAPI(),
  scribing: new ScribingQuestionAPI(),
};

Object.freeze(QuestionAPI);

export default QuestionAPI;
