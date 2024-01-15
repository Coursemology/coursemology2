import { Component } from 'react';

import ProgrammingImportHistoryView from '../../containers/ProgrammingImport/ProgrammingImportHistoryView';
import ReadOnlyEditor from '../../containers/ReadOnlyEditor';
import TestCaseView from '../../containers/TestCaseView';
import { answerShape, questionShape } from '../../propTypes';

export default class PastProgrammingAnswer extends Component {
  renderFileSubmissionPastAnswer() {
    const { answer } = this.props;

    return (
      <div>
        <ProgrammingImportHistoryView historyAnswer={answer} />
        <TestCaseView
          answerId={answer.id}
          isDraftAnswer={answer.isDraftAnswer}
          viewHistory
        />
      </div>
    );
  }

  render() {
    const { question, answer } = this.props;
    const file =
      answer.files_attributes.length > 0 ? answer.files_attributes[0] : null;

    if (question.fileSubmission) {
      return this.renderFileSubmissionPastAnswer();
    }

    return (
      <div>
        {file && <ReadOnlyEditor answerId={answer.id} file={file} />}
        <TestCaseView
          answerId={answer.id}
          isDraftAnswer={answer.isDraftAnswer}
          viewHistory
        />
      </div>
    );
  }
}

PastProgrammingAnswer.propTypes = {
  answer: answerShape,
  question: questionShape,
};
