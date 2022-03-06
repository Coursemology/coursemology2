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
    return <FileUploadAnswer {...{ question, readOnly, answerId }} />;
  }

  static renderForumPostResponse({ question, readOnly, answerId }) {
    return (
      <ForumPostResponseAnswer
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
        {...{ question, readOnly, answerId, graderView, showMcqMrqSolution }}
      />
    );
  }

  static renderProgramming({ question, readOnly, answerId }) {
    return <ProgrammingAnswer {...{ question, readOnly, answerId }} />;
  }

  static renderScribing({ question, readOnly, answerId }) {
    return (
      <ScribingView
        scribing={question}
        readOnly={readOnly}
        answerId={answerId}
      />
    );
  }

  static renderTextResponse({ question, readOnly, answerId, graderView }) {
    return (
      <TextResponseAnswer {...{ question, readOnly, answerId, graderView }} />
    );
  }

  static renderVoiceResponse({ question, readOnly, answerId }) {
    return (
      <VoiceResponseAnswer
        question={question}
        readOnly={readOnly}
        answerId={answerId}
      />
    );
  }
}
