import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { FieldArray } from 'redux-form';
import { Button } from '@mui/material';
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
      <>
        {fields.map((answerId, index) => {
          const file = fields.get(index);
          if (readOnly) {
            const content = file.highlighted_content.split('\n');
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
      const content = file.highlighted_content.split('\n');
      return (
        <ReadOnlyEditor
          key={answer.id}
          answerId={answer.id}
          fileId={file.id}
          content={content}
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
            submissionId={submissionId}
            questionId={questionId}
            displayFileIndex={displayFileIndex}
            handleDeleteFile={this.handleDeleteFile}
            handleFileTabbing={(index) =>
              this.setState({ displayFileIndex: index })
            }
            files={files}
            viewHistory={viewHistory}
          />
        )}
        {viewHistory ? (
          this.renderProgrammingHistoryEditor(answers[answerId])
        ) : (
          <FieldArray
            name={`${answerId}[files_attributes]`}
            component={
              VisibleProgrammingImportEditor.renderSelectProgrammingFileEditor
            }
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
              name={`${answerId}[import_files]`}
              disabled={isSaving}
              callback={(filesToImport) =>
                dispatch(stageFiles(submissionId, answerId, filesToImport))
              }
            />
            <Button
              variant="contained"
              disabled={disableImport}
              onClick={() =>
                dispatch(importFiles(answerId, answers, question.language))
              }
              style={styles.formButton}
            >
              {intl.formatMessage(translations.uploadFiles)}
            </Button>
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
