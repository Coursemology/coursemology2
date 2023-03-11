import ForumPostResponseAPI from './ForumPostResponse';
import McqMrqAPI from './McqMrq';
import ScribingQuestionAPI from './Scribing';
import VoiceResponseAPI from './VoiceResponse';

const QuestionAPI = {
  forumPostResponse: new ForumPostResponseAPI(),
  mcqMrq: new McqMrqAPI(),
  scribing: new ScribingQuestionAPI(),
  voiceResponse: new VoiceResponseAPI(),
};

Object.freeze(QuestionAPI);

export default QuestionAPI;
