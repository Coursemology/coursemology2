import ScribingsAPI from './Scribing';
import ProgrammingAPI from './Programming';

const AnswerAPI = {
  scribing: new ScribingsAPI(),
  programming: new ProgrammingAPI(),
};

Object.freeze(AnswerAPI);

export default AnswerAPI;
