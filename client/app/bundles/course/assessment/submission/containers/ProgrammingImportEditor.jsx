import { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import { deleteFile, importFiles } from '../actions';
import Editor from '../components/Editor';
import FileInputField from '../components/FileInput';
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

const SelectProgrammingFileEditor = ({
  answerId,
  readOnly,
  language,
  displayFileIndex,
  saveAnswer,
}) => {
  const { control } = useFormContext();
  const { fields } = useFieldArray({
    control,
    name: `${answerId}.files_attributes`,
  });

  const currentFields = useWatch({
    control,
    name: `${answerId}.files_attributes`,
  });

  const controlledProgrammingFields =
    currentFields.length === fields.length
      ? fields.map((field, index) => ({
          ...field,
          ...currentFields[index],
        }))
      : currentFields;

  return (
    <>
      {controlledProgrammingFields.map((field, index) => {
        const file = field;
        if (readOnly) {
          return (
            <ReadOnlyEditor key={file.id} answerId={answerId} file={file} />
          );
        }
        if (index === displayFileIndex && !file.staged) {
          return (
            <Editor
              key={file.id}
              answerId={answerId}
              fieldName={`${answerId}.files_attributes.${index}.content`}
              file={file}
              language={language}
              saveAnswer={saveAnswer}
            />
          );
        }
        return null;
      })}
    </>
  );
};

SelectProgrammingFileEditor.propTypes = {
  answerId: PropTypes.number,
  readOnly: PropTypes.bool,
  language: PropTypes.string,
  displayFileIndex: PropTypes.number,
  saveAnswer: PropTypes.func,
};

const renderProgrammingHistoryEditor = (answer, displayFileIndex) => {
  const file = answer.files_attributes[displayFileIndex];
  if (!file) {
    return null;
  }

  return <ReadOnlyEditor key={answer.id} answerId={answer.id} file={file} />;
};

const stageFiles = async (props) => {
  const { answerId, answers, filesToImport, setValue } = props;

  // Create a map of promises that will resolve all files are read
  const readerPromises = Object.keys(filesToImport).map(
    (key) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsText(filesToImport[key]);
        reader.onload = (e) => {
          resolve(e.target.result);
        };
      }),
  );

  // Detects when all of the promises are fully loaded
  Promise.all(readerPromises).then((results) => {
    const newFiles = [];
    Object.keys(filesToImport).forEach((key, index) => {
      const obj = filesToImport[key];
      const file = {
        filename: obj.name,
        staged: true,
        content: results[index],
      };
      newFiles.push(file);
    });

    // Removes previously staged files
    const filteredFiles = answers[`${answerId}`].files_attributes.filter(
      (file) => !file.staged,
    );

    setValue(`${answerId}.files_attributes`, filteredFiles.concat(newFiles));
  });
};

const VisibleProgrammingImportEditor = (props) => {
  const [displayFileIndex, setDisplayFileIndex] = useState(0);
  const { control, setValue } = useFormContext();
  const {
    dispatch,
    submissionId,
    questionId,
    answerId,
    readOnly,
    question,
    intl,
    historyAnswers,
    isSaving,
    viewHistory,
    saveAnswer,
  } = props;
  const currentAnswer = useWatch({ control });
  const answers = viewHistory ? historyAnswers : currentAnswer;

  // When an assessment is submitted/unsubmitted,
  // the form is somehow not reset yet and the answers for the new answerId
  // can't be found.
  if (!answers[answerId]) {
    return null;
  }

  const files =
    answers[answerId].files_attributes ||
    answers[`${answerId}`].files_attributes;
  const stagedFiles = files.filter((file) => file.staged).length > 0;
  const disableImport = !stagedFiles || isSaving;

  const handleDeleteFile = (fileId) => {
    dispatch(deleteFile(answerId, fileId, answers, setValue));
    setDisplayFileIndex(0);
  };

  return (
    <>
      {!readOnly && (
        <ImportedFileView
          displayFileIndex={displayFileIndex}
          files={files}
          handleDeleteFile={handleDeleteFile}
          handleFileTabbing={(index) => setDisplayFileIndex(index)}
          questionId={questionId}
          submissionId={submissionId}
          viewHistory={viewHistory}
        />
      )}
      {viewHistory ? (
        renderProgrammingHistoryEditor(answers[answerId], displayFileIndex)
      ) : (
        <SelectProgrammingFileEditor
          {...{
            answerId,
            readOnly,
            question,
            displayFileIndex,
            viewHistory,
            saveAnswer,
            language: parseLanguages(question.language),
          }}
        />
      )}
      {readOnly || viewHistory ? null : (
        <>
          <FileInputField
            callback={(filesToImport) =>
              stageFiles({
                answerId,
                answers,
                filesToImport,
                setValue,
              })
            }
            disabled={isSaving}
            name={`${answerId}.import_files`}
          />
          <Button
            disabled={disableImport}
            onClick={() =>
              dispatch(
                importFiles(answerId, answers, question.language, setValue),
              )
            }
            style={styles.formButton}
            variant="contained"
          >
            {intl.formatMessage(translations.uploadFiles)}
          </Button>
        </>
      )}
    </>
  );
};

VisibleProgrammingImportEditor.propTypes = {
  intl: PropTypes.object.isRequired,
  dispatch: PropTypes.func,
  submissionId: PropTypes.number,
  questionId: PropTypes.number,
  answerId: PropTypes.number,
  question: questionShape,
  readOnly: PropTypes.bool,
  viewHistory: PropTypes.bool,
  isSaving: PropTypes.bool,
  historyAnswers: PropTypes.shape({
    id: PropTypes.number,
    questionId: PropTypes.number,
    files_attributes: PropTypes.arrayOf(fileShape),
  }),
  saveAnswer: PropTypes.func,
};

function mapStateToProps(state, ownProps) {
  const { questionId, answerId, question, readOnly, viewHistory } = ownProps;
  const { submission, submissionFlags, history } = state.assessments.submission;

  const submissionId = submission.id;
  let historyAnswers;
  if (viewHistory) {
    historyAnswers = history.answers;
  }
  const isSaving = submissionFlags.isSaving;

  return {
    submissionId,
    questionId,
    answerId,
    question,
    readOnly,
    isSaving,
    historyAnswers,
  };
}

const ProgrammingImportEditor = connect(mapStateToProps)(
  injectIntl(VisibleProgrammingImportEditor),
);
export default ProgrammingImportEditor;
