import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import OnlineEditorPythonView from './Python/OnlineEditorPythonView';
import OnlineEditorCppView from './Cpp/OnlineEditorCppView';
import OnlineEditorJavaView from './Java/OnlineEditorJavaView';
import { validation as editorValidation } from './OnlineEditorBase';
import { programmingLanguages, aceEditorModes } from '../../constants';
import translations from './OnlineEditorView.intl';
import EditorCard from './EditorCard';

const propTypes = {
  data: PropTypes.object,
  actions: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  autograded: PropTypes.bool.isRequired,
  autogradedAssessment: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  hasSubmissions: PropTypes.bool.isRequired,
};

export function validation(data, pathOfKeysToData, intl) {
  const mode = data.getIn(pathOfKeysToData).get('mode');
  const errors = [];

  switch (mode) {
    case 'python':
    case 'c_cpp':
    case 'java':
      return errors.concat(
        editorValidation(data, pathOfKeysToData.concat([mode]), intl)
      );
    default:
      return errors;
  }
}

const OnlineEditor = (props) => {
  const { data, intl, isLoading, autograded, autogradedAssessment, hasSubmissions,
    languageId, dataFiles } = props;

  let editorMode = '';
  switch (languageId) {
    case programmingLanguages.PYTHON_2_7:
    case programmingLanguages.PYTHON_3_4:
    case programmingLanguages.PYTHON_3_5:
    case programmingLanguages.PYTHON_3_6:
      editorMode = aceEditorModes.PYTHON;
      break;
    case programmingLanguages.C_CPP:
      editorMode = aceEditorModes.C_CPP;
      break;
    case programmingLanguages.JAVA:
      editorMode = aceEditorModes.JAVA;
      break;
    default:
      editorMode = '';
  }

  if (!autograded) {
    return (
      <EditorCard
        header={intl.formatMessage(translations.submissionTitle)}
        field="question_programming[submission]"
        mode={editorMode}
      />
    );
  }

  const editorProps = {
    data,
    dataFiles,
    isLoading,
    editorMode,
    hasSubmissions, // java editor
    testData: data, // java editor
  };

  switch (languageId) {
    case programmingLanguages.PYTHON_2_7:
    case programmingLanguages.PYTHON_3_4:
    case programmingLanguages.PYTHON_3_5:
    case programmingLanguages.PYTHON_3_6:
      return (<OnlineEditorPythonView {...editorProps} />);

    case programmingLanguages.C_CPP:
      return (<OnlineEditorCppView {...editorProps} />);

    case programmingLanguages.JAVA:
      return (<OnlineEditorJavaView {...editorProps} />);

    case null:
    case undefined:
      return (
        <div className="alert alert-warning">
          {intl.formatMessage(translations.selectLanguageAlert)}
        </div>
      );

    default:
      return (
        <div className="alert alert-info">
          {intl.formatMessage(translations.notYetImplementedAlert)}
        </div>
      );
  }
};

OnlineEditor.propTypes = propTypes;

export default injectIntl(OnlineEditor);
