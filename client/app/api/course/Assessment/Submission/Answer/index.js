import ForumPostResponseAPI from './ForumPostResponse';
import ProgrammingAPI from './Programming';
import ScribingsAPI from './Scribing';
import TextResponseAPI from './TextResponse';

const AnswerAPI = {
  scribing: new ScribingsAPI(),
  programming: new ProgrammingAPI(),
  textResponse: new TextResponseAPI(),
  forumPostResponse: new ForumPostResponseAPI(),
};

Object.freeze(AnswerAPI);

export default AnswerAPI;
