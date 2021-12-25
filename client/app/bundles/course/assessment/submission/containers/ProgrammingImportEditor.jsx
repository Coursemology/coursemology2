import { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import { white } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';

import { deleteFile, importFiles, stageFiles } from '../actions';
import Editor from '../components/Editor';
import FileInput from '../components/FileInput';
import { formNames } from '../constants';
import { fileShape, questionShape } from '../propTypes';
import translations from '../translations';
import { parseLanguages } from '../utils';

import ImportedFileView from './ImportedFileView';
import ReadOnlyEditor from './ReadOnlyEditor';

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
      <>
        {fields.map((answerId, index) => {
          const file = fields.get(index);
          if (readOnly) {
            const content = file.content.split('\n');
            return (
              <ReadOnlyEditor
                key={answerId}
                answerId={parseInt(answerId.split('[')[0], 10)}
                content={content}
                fileId={file.id}
              />
            );
          }
          if (index === displayFileIndex && !file.staged) {
            return (
              <Editor
                key={answerId}
                filename={file.filename}
                language={language}
                name={`${answerId}[content]`}
              />
            );
          }
          return null;
        })}
      </>
    );
  }

  constructor(props) {
    super(props);
    this.state = { displayFileIndex: 0 };
  }

  handleDeleteFile = (fileId) => {
    const { dispatch, answerId, answers } = this.props;
    dispatch(deleteFile(answerId, fileId, answers));
    this.setState({ displayFileIndex: 0 });
  };

  renderProgrammingHistoryEditor(answer) {
    const { displayFileIndex } = this.state;
    const file = answer.files_attributes[displayFileIndex];
    if (file) {
      const content = file.content.split('\n');
      return (
        <ReadOnlyEditor
          key={answer.id}
          answerId={answer.id}
          content={content}
          fileId={file.id}
        />
      );
    }
    return null;
  }

  render() {
    const {
      dispatch,
      submissionId,
      questionId,
      answerId,
      readOnly,
      question,
      intl,
      answers,
      isSaving,
      viewHistory,
    } = this.props;
    const { displayFileIndex } = this.state;
    const files = answers[answerId].files_attributes;
    const stagedFiles = files.filter((file) => file.staged).length > 0;
    const disableImport = !stagedFiles || isSaving;
    return (
      <>
        {readOnly ? null : (
          <ImportedFileView
            displayFileIndex={displayFileIndex}
            files={files}
            handleDeleteFile={this.handleDeleteFile}
            handleFileTabbing={(index) =>
              this.setState({ displayFileIndex: index })
            }
            questionId={questionId}
            submissionId={submissionId}
            viewHistory={viewHistory}
          />
        )}
        {viewHistory ? (
          this.renderProgrammingHistoryEditor(answers[answerId])
        ) : (
          <FieldArray
            component={
              VisibleProgrammingImportEditor.renderSelectProgrammingFileEditor
            }
            name={`${answerId}[files_attributes]`}
            {...{
              readOnly,
              question,
              displayFileIndex,
              viewHistory,
              language: parseLanguages(question.language),
            }}
          />
        )}
        {readOnly || viewHistory ? null : (
          <>
            <FileInput
              callback={(filesToImport) =>
                dispatch(stageFiles(submissionId, answerId, filesToImport))
              }
              disabled={isSaving}
              name={`${answerId}[import_files]`}
            />
            <RaisedButton
              backgroundColor={white}
              disabled={disableImport}
              label={intl.formatMessage(translations.uploadFiles)}
              onClick={() =>
                dispatch(importFiles(answerId, answers, question.language))
              }
              style={styles.formButton}
            />
          </>
        )}
      </>
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
  viewHistory: PropTypes.bool,
  isSaving: PropTypes.bool,
  answers: PropTypes.shape({
    id: PropTypes.number,
    questionId: PropTypes.number,
    files_attributes: PropTypes.arrayOf(fileShape),
  }),
};

function mapStateToProps(state, ownProps) {
  const { questionId, answerId, question, readOnly, viewHistory } = ownProps;
  const { submission, form, dispatch, submissionFlags, history } = state;

  const submissionId = submission.id;
  let answers;
  if (viewHistory) {
    answers = history.answers;
  } else {
    answers = form[formNames.SUBMISSION].values;
  }
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

const ProgrammingImportEditor = connect(mapStateToProps)(
  injectIntl(VisibleProgrammingImportEditor),
);
export default ProgrammingImportEditor;
