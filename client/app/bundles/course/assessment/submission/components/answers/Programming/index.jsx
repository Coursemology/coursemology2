import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';

import { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import ProgrammingFile from './ProgrammingFile';
import ProgrammingImportEditor from '../../../containers/ProgrammingImportEditor';
import TestCaseView from '../../../containers/TestCaseView';
import { parseLanguages } from '../../../utils';
import { questionShape } from '../../../propTypes';

class Programming extends Component {
  static renderProgrammingFiles({ fields, readOnly, answerId, language }) {
    return (
      <>
        {fields.map((fieldName, index) => {
          const file = fields.get(index);
          return (
            <ProgrammingFile
              key={file.id}
              {...{ file, fieldName, readOnly, answerId, language }}
            />
          );
        })}
      </>
    );
  }

  render() {
    const { question, readOnly, answerId } = this.props;
    const fileSubmission = question.fileSubmission;
    return (
      <div>
        {fileSubmission ? (
          <ProgrammingImportEditor
            questionId={question.id}
            answerId={answerId}
            {...{ readOnly, question }}
          />
        ) : (
          <FieldArray
            name={`${answerId}[files_attributes]`}
            component={Programming.renderProgrammingFiles}
            {...{
              readOnly,
              answerId,
              language: parseLanguages(question.language),
            }}
          />
        )}
        <TestCaseView questionId={question.id} />
      </div>
    );
  }
}

Programming.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  answerId: PropTypes.number,
};

export default Programming;
