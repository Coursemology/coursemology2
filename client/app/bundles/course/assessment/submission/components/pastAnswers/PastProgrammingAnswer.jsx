import React, { Component } from 'react';

import ProgrammingImportEditor from '../../containers/ProgrammingImportEditor';
import ReadOnlyEditor from '../../containers/ReadOnlyEditor';
import TestCaseView from '../../containers/TestCaseView';
import { answerShape, questionShape } from '../../propTypes';

export default class PastProgrammingAnswer extends Component {
  static propTypes = {
    answer: answerShape,
    question: questionShape,
  };

  renderFileSubmissionPastAnswer() {
    const { question, answer } = this.props;

    return (
      <div>
        <ProgrammingImportEditor
          questionId={answer.questionId}
          answerId={answer.id}
          viewHistory
          {...{
            question,
          }}
        />
        <TestCaseView answerId={answer.id} viewHistory />
      </div>
    );
  }

  render() {
    const { question, answer } = this.props;
    const file = answer.files_attributes.length > 0 ? answer.files_attributes[0] : null;
    const content = file ? file.highlighted_content.split('\n') : '';

    if (question.fileSubmission) {
      return this.renderFileSubmissionPastAnswer();
    }

    return (
      <div>
        <ReadOnlyEditor
          answerId={answer.id}
          fileId={file.id}
          content={content}
        />
        <TestCaseView answerId={answer.id} viewHistory />
      </div>
    );
  }
}
