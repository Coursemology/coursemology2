import ForumPostResponseAPI from './ForumPostResponse';
import McqMrqAPI from './McqMrq';
import MockAnswersAPI from './MockAnswers';
import ProgrammingAPI from './Programming';
import QuestionsAPI from './Questions';
import RubricBasedResponseAPI from './RubricBasedResponse';
import RubricsAPI from './Rubrics';
import ScribingQuestionAPI from './Scribing';
import TextResponseAPI from './TextResponse';
import VoiceResponseAPI from './VoiceResponse';

const QuestionAPI = {
  forumPostResponse: new ForumPostResponseAPI(),
  mcqMrq: new McqMrqAPI(),
  mockAnswers: new MockAnswersAPI(),
  programming: new ProgrammingAPI(),
  questions: new QuestionsAPI(),
  scribing: new ScribingQuestionAPI(),
  textResponse: new TextResponseAPI(),
  voiceResponse: new VoiceResponseAPI(),
  rubricBasedResponse: new RubricBasedResponseAPI(),
  rubrics: new RubricsAPI(),
};

Object.freeze(QuestionAPI);

export default QuestionAPI;
