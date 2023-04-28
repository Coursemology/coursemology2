import ForumPostResponseAPI from './ForumPostResponse';
import McqMrqAPI from './McqMrq';
import ProgrammingAPI from './Programming';
import ScribingQuestionAPI from './Scribing';
import TextResponseAPI from './TextResponse';
import VoiceResponseAPI from './VoiceResponse';

const QuestionAPI = {
  forumPostResponse: new ForumPostResponseAPI(),
  mcqMrq: new McqMrqAPI(),
  programming: new ProgrammingAPI(),
  scribing: new ScribingQuestionAPI(),
  textResponse: new TextResponseAPI(),
  voiceResponse: new VoiceResponseAPI(),
};

Object.freeze(QuestionAPI);

export default QuestionAPI;
