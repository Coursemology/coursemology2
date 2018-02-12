import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { FieldArray } from 'redux-form';
import RaisedButton from 'material-ui/RaisedButton';
import { white } from 'material-ui/styles/colors';

import ImportedFileView from './ImportedFileView';
import Editor from '../components/Editor';
import FileInput from '../components/FileInput';
import ReadOnlyEditor from './ReadOnlyEditor';
import { importFiles, deleteFile, stageFiles } from '../actions';
import translations from '../translations';
import { questionShape, fileShape } from '../propTypes';
import { parseLanguages } from '../utils';
import { formNames } from '../constants';

const styles = {
  formButton: {
    marginBottom: 10,
    marginRight: 10,
  },
};

class VisibleProgrammingImportEditor extends Component {
  static renderSelectProgrammingFileEditor(props) {
    const { fields, readOnly, language, displayFileIndex } = props;
    return (
      <React.Fragment>
        {fields.map((answerId, index) => {
          const file = fields.get(index);
          if (readOnly) {
            const content = file.content.split('\n');
            return (
              <ReadOnlyEditor
                key={answerId}
                answerId={parseInt(answerId.split('[')[0], 10)}
                fileId={file.id}
                content={content}
              />
            );
          }
          if (index === displayFileIndex && !file.staged) {
            return (
              <Editor
                key={answerId}
                name={`${answerId}[content]`}
                filename={file.filename}
                language={language}
              />
            );
          }
          return null;
        })}
      </React.Fragment>
    );
  }

  constructor(props) {
    super(props);
    this.state = { displayFileIndex: 0 };
    this.handleDeleteFile = this.handleDeleteFile.bind(this);
  }

  handleDeleteFile(fileId) {
    const { dispatch, answerId, answers } = this.props;
    dispatch(deleteFile(answerId, fileId, answers));
    this.setState({ displayFileIndex: 0 });
  }

  render() {
    const {
      dispatch, submissionId, questionId, answerId,
      readOnly, question, intl, answers, isSaving,
    } = this.props;
    const { displayFileIndex } = this.state;
    const files = answers[answerId].files_attributes;
    const stagedFiles = files.filter(file => file.staged).length > 0;
    const disableImport = !stagedFiles || isSaving;
    return (
      <React.Fragment>
        {readOnly ? null : <ImportedFileView
          submissionId={submissionId}
          questionId={questionId}
          displayFileIndex={displayFileIndex}
          handleDeleteFile={this.handleDeleteFile}
          handleFileTabbing={index => this.setState({ displayFileIndex: index })}
          files={files}
        />}
        <FieldArray
          name={`${answerId}[files_attributes]`}
          component={VisibleProgrammingImportEditor.renderSelectProgrammingFileEditor}
          {...{
            readOnly,
            question,
            displayFileIndex,
            language: parseLanguages(question.language),
          }}
        />
        {readOnly ?
          null
          :
          <React.Fragment>
            <FileInput
              name={`${answerId}[import_files]`}
              disabled={isSaving}
              callback={filesToImport => dispatch(stageFiles(submissionId, answerId, filesToImport))}
            />
            <RaisedButton
              style={styles.formButton}
              backgroundColor={white}
              label={intl.formatMessage(translations.uploadFiles)}
              onClick={() => dispatch(importFiles(answerId, answers, question.language))}
              disabled={disableImport}
            />
          </React.Fragment>
        }
      </React.Fragment>
    );
  }
}

VisibleProgrammingImportEditor.propTypes = {
  intl: intlShape.isRequired,
  dispatch: PropTypes.func,
  submissionId: PropTypes.number,
  questionId: PropTypes.number,
  answerId: PropTypes.number,
  question: questionShape,
  readOnly: PropTypes.bool,
  isSaving: PropTypes.bool,
  answers: PropTypes.shape({
    id: PropTypes.number,
    questionId: PropTypes.number,
    files_attributes: PropTypes.arrayOf(fileShape),
  }),
};

function mapStateToProps(state, ownProps) {
  const { questionId, answerId, question, readOnly } = ownProps;
  const { submission, form, dispatch, submissionFlags } = state;

  const submissionId = submission.id;
  const answers = form[formNames.SUBMISSION].values;
  const isSaving = submissionFlags.isSaving;

  return {
    dispatch,
    submissionId,
    questionId,
    answerId,
    question,
    readOnly,
    isSaving,
    answers,
  };
}

const ProgrammingImportEditor = connect(
  mapStateToProps
)(injectIntl(VisibleProgrammingImportEditor));
export default ProgrammingImportEditor;
