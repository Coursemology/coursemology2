import { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { deleteFile } from '../actions';
import Editor from '../components/Editor';
import FileInputField from '../components/FileInput';
import { fileShape, questionShape } from '../propTypes';
import { parseLanguages } from '../utils';

import ImportedFileView from './ImportedFileView';
import ReadOnlyEditor from './ReadOnlyEditor';

const SelectProgrammingFileEditor = ({
  answerId,
  readOnly,
  language,
  displayFileIndex,
  saveAnswerAndUpdateClientVersion,
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
              saveAnswerAndUpdateClientVersion={
                saveAnswerAndUpdateClientVersion
              }
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
  saveAnswerAndUpdateClientVersion: PropTypes.func,
};

const renderProgrammingHistoryEditor = (answer, displayFileIndex) => {
  const file = answer.files_attributes[displayFileIndex];
  if (!file) {
    return null;
  }

  return <ReadOnlyEditor key={answer.id} answerId={answer.id} file={file} />;
};

const stageFiles = async (props) => {
  const {
    answerId,
    answers,
    filesToImport,
    question,
    setValue,
    importProgrammingFiles,
    getValues,
  } = props;

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
    const filteredFiles = answers[`${answerId}`].files_attributes
      .filter((file) => !file.staged)
      .concat(newFiles);

    setValue(`${answerId}.files_attributes`, filteredFiles);
    importProgrammingFiles(answerId, getValues(), question.language, setValue);
  });
};

const VisibleProgrammingImportEditor = (props) => {
  const [displayFileIndex, setDisplayFileIndex] = useState(0);
  const { control, setValue, getValues } = useFormContext();
  const {
    dispatch,
    submissionId,
    questionId,
    answerId,
    readOnly,
    question,
    historyAnswers,
    isSaving,
    viewHistory,
    saveAnswerAndUpdateClientVersion,
    importProgrammingFiles,
    isSavingAnswer,
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

  const handleDeleteFile = (fileId) => {
    const currentTime = Date.now();
    dispatch(deleteFile(answerId, fileId, answers, currentTime, setValue));
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
            saveAnswerAndUpdateClientVersion,
            language: parseLanguages(question.language),
          }}
        />
      )}
      {readOnly || viewHistory ? null : (
        <FileInputField
          callback={(filesToImport) =>
            stageFiles({
              answerId,
              answers,
              filesToImport,
              question,
              setValue,
              importProgrammingFiles,
              getValues,
            })
          }
          disabled={isSaving || isSavingAnswer}
          name={`${answerId}.import_files`}
        />
      )}
    </>
  );
};

VisibleProgrammingImportEditor.propTypes = {
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
  saveAnswerAndUpdateClientVersion: PropTypes.func,
  importProgrammingFiles: PropTypes.func,
  isSavingAnswer: PropTypes.bool,
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
  VisibleProgrammingImportEditor,
);
export default ProgrammingImportEditor;
