import ScribingsAPI from './Scribing';
import ProgrammingAPI from './Programming';
import ForumPostResponseAPI from './ForumPostResponse';

const AnswerAPI = {
  scribing: new ScribingsAPI(),
  programming: new ProgrammingAPI(),
  forumPostResponse: new ForumPostResponseAPI(),
};

Object.freeze(AnswerAPI);

export default AnswerAPI;
