import ForumPostResponseAPI from './ForumPostResponse';
import ProgrammingAPI from './Programming';
import ScribingsAPI from './Scribing';

const AnswerAPI = {
  scribing: new ScribingsAPI(),
  programming: new ProgrammingAPI(),
  forumPostResponse: new ForumPostResponseAPI(),
};

Object.freeze(AnswerAPI);

export default AnswerAPI;
