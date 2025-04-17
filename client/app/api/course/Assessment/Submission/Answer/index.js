import AnswersAPI from './Answer';
import ForumPostResponseAPI from './ForumPostResponse';
import ProgrammingAPI from './Programming';
import RubricBasedResponseAPI from './RubricBasedResponse';
import ScribingsAPI from './Scribing';
import TextResponseAPI from './TextResponse';

const AnswerAPI = {
  answer: new AnswersAPI(),
  scribing: new ScribingsAPI(),
  programming: new ProgrammingAPI(),
  textResponse: new TextResponseAPI(),
  forumPostResponse: new ForumPostResponseAPI(),
  rubricBasedResponse: new RubricBasedResponseAPI(),
};

Object.freeze(AnswerAPI);

export default AnswerAPI;
