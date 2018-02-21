import 'brace/mode/python';
import 'brace/theme/github';

import React, { Component } from 'react';
import ScribingView from '../containers/ScribingView';
import VoiceResponseAnswer from '../containers/VoiceResponseAnswer';
import MultipleChoiceAnswer from './answers/MultipleChoice';
import MultipleResponseAnswer from './answers/MultipleResponse';
import TextResponseAnswer from './answers/TextResponse';
import FileUploadAnswer from './answers/FileUpload';
import ProgrammingAnswer from './answers/Programming';

export default class Answers extends Component {
  static renderMultipleChoice(question, readOnly, answerId) {
    return <MultipleChoiceAnswer {...{ question, readOnly, answerId }} />;
  }

  static renderMultipleResponse(question, readOnly, answerId) {
    return <MultipleResponseAnswer {...{ question, readOnly, answerId }} />;
  }

  static renderTextResponse(question, readOnly, answerId, graderView) {
    return <TextResponseAnswer {...{ question, readOnly, answerId, graderView }} />;
  }

  static renderFileUpload(question, readOnly, answerId) {
    return <FileUploadAnswer {...{ question, readOnly, answerId }} />;
  }

  static renderVoiceResponse(question, readOnly, answerId) {
    return <VoiceResponseAnswer question={question} readOnly={readOnly} answerId={answerId} />;
  }

  static renderScribing(scribing, readOnly, answerId) {
    return <ScribingView scribing={scribing} readOnly={readOnly} answerId={answerId} />;
  }

  static renderProgramming(question, readOnly, answerId) {
    return <ProgrammingAnswer {...{ question, readOnly, answerId }} />;
  }
}
