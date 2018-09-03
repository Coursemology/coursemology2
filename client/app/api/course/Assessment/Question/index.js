import ProgrammingQuestionAPI from './Programming';
import ScribingQuestionAPI from './Scribing';

const QuestionAPI = {
  programming: new ProgrammingQuestionAPI(),
  scribing: new ScribingQuestionAPI(),
};

Object.freeze(QuestionAPI);

export default QuestionAPI;
