import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';

import { Component } from 'react';
import ScribingView from '../containers/ScribingView';
import VoiceResponseAnswer from '../containers/VoiceResponseAnswer';
import MultipleChoiceAnswer from './answers/MultipleChoice';
import MultipleResponseAnswer from './answers/MultipleResponse';
import TextResponseAnswer from './answers/TextResponse';
import FileUploadAnswer from './answers/FileUpload';
import ProgrammingAnswer from './answers/Programming';
import ForumPostResponseAnswer from './answers/ForumPostResponse';

export default class Answers extends Component {
  static renderFileUpload({ question, readOnly, answerId }) {
    return (
      <FileUploadAnswer
        key={`question_${question.id}`}
        {...{ question, readOnly, answerId }}
      />
    );
  }

  static renderForumPostResponse({ question, readOnly, answerId }) {
    return (
      <ForumPostResponseAnswer
        key={`question_${question.id}`}
        question={question}
        readOnly={readOnly}
        answerId={answerId}
      />
    );
  }

  static renderMultipleChoice({
    question,
    readOnly,
    answerId,
    graderView,
    showMcqMrqSolution,
  }) {
    return (
      <MultipleChoiceAnswer
        key={`question_${question.id}`}
        {...{ question, readOnly, answerId, graderView, showMcqMrqSolution }}
      />
    );
  }

  static renderMultipleResponse({
    question,
    readOnly,
    answerId,
    graderView,
    showMcqMrqSolution,
  }) {
    return (
      <MultipleResponseAnswer
        key={`question_${question.id}`}
        {...{ question, readOnly, answerId, graderView, showMcqMrqSolution }}
      />
    );
  }

  static renderProgramming({ question, readOnly, answerId }) {
    return (
      <ProgrammingAnswer
        key={`question_${question.id}`}
        {...{ question, readOnly, answerId }}
      />
    );
  }

  static renderScribing({ question, readOnly, answerId }) {
    return (
      <ScribingView
        key={`question_${question.id}`}
        scribing={question}
        readOnly={readOnly}
        answerId={answerId}
      />
    );
  }

  static renderTextResponse({ question, readOnly, answerId, graderView }) {
    return (
      <TextResponseAnswer
        key={`question_${question.id}`}
        {...{ question, readOnly, answerId, graderView }}
      />
    );
  }

  static renderVoiceResponse({ question, readOnly, answerId }) {
    return (
      <VoiceResponseAnswer
        key={`question_${question.id}`}
        question={question}
        readOnly={readOnly}
        answerId={answerId}
      />
    );
  }
}
