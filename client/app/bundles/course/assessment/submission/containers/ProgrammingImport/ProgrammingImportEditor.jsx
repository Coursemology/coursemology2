import { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  deleteProgrammingFile,
  importProgrammingFiles,
} from '../../actions/answers/programming';
import Editor from '../../components/Editor';
import FileInputField from '../../components/FileInput';
import { fileShape, questionShape } from '../../propTypes';
import { parseLanguages } from '../../utils';
import ReadOnlyEditor from '../ReadOnlyEditor';

import ImportedFileView from './ImportedFileView';

const SelectProgrammingFileEditor = ({
  answerId,
  readOnly,
  language,
  displayFileName,
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
        if (file.filename === displayFileName && !file.staged) {
          return (
            <Editor
              key={file.id}
              fieldName={`${answerId}.files_attributes.${index}.content`}
              file={file}
              language={language}
              onChangeCallback={() =>
                saveAnswerAndUpdateClientVersion(answerId)
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
  displayFileName: PropTypes.string,
  saveAnswerAndUpdateClientVersion: PropTypes.func,
};

const renderProgrammingHistoryEditor = (answer, displayFileName) => {
  const file = answer.files_attributes.find(
    (elem) => elem.filename === displayFileName,
  );
  if (!file) {
    return null;
  }

  return <ReadOnlyEditor key={answer.id} answerId={answer.id} file={file} />;
};

const handleStageFiles = async (filesToImport) => {
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

  return Promise.all(readerPromises).then((results) => {
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
    return newFiles;
  });
};

const VisibleProgrammingImportEditor = (props) => {
  const {
    answerId,
    disabled,
    dispatch,
    historyAnswers,
    question,
    readOnly,
    saveAnswerAndUpdateClientVersion,
    viewHistory,
  } = props;
  const { control, resetField, getValues } = useFormContext();
  const currentAnswer = useWatch({ control });
  const answers = viewHistory ? historyAnswers : currentAnswer;

  const files = answers[answerId]
    ? answers[answerId].files_attributes ||
      answers[`${answerId}`].files_attributes
    : null;

  const [displayFileName, setDisplayFileName] = useState(
    files && files.length > 0 ? files[0].filename : '',
  );

  // When an assessment is submitted/unsubmitted,
  // the form is somehow not reset yet and the answers for the new answerId
  // can't be found.
  if (!answers[answerId]) {
    return null;
  }

  const handleUploadFiles = (filesToUpload) => {
    dispatch(
      importProgrammingFiles(
        answerId,
        filesToUpload,
        parseLanguages(question.language),
        resetField,
      ),
    );
    if (displayFileName === '') {
      setDisplayFileName(filesToUpload[0].filename);
    }
  };

  const handleDeleteFile = (fileId, fileName) => {
    const answer = answers[answerId];
    const onDeleteSuccess = () => {
      // When an uploaded programming file is deleted, we need to update the field value
      // excluding the deleted file.
      const newFilesAttributes = answer.files_attributes.filter(
        (file) => file.id !== fileId,
      );
      resetField(`${answerId}.files_attributes`, {
        defaultValue: newFilesAttributes,
      });
      if (fileName === displayFileName) {
        setDisplayFileName(
          newFilesAttributes.length > 0 ? newFilesAttributes[0].filename : '',
        );
      }
    };
    dispatch(deleteProgrammingFile(answer, fileId, onDeleteSuccess));
  };

  return (
    <>
      {!readOnly && (
        <ImportedFileView
          displayFileName={displayFileName}
          files={files}
          handleDeleteFile={handleDeleteFile}
          handleFileTabbing={(filename) => setDisplayFileName(filename)}
          viewHistory={viewHistory}
        />
      )}
      {viewHistory ? (
        renderProgrammingHistoryEditor(answers[answerId], displayFileName)
      ) : (
        <SelectProgrammingFileEditor
          {...{
            answerId,
            readOnly,
            question,
            displayFileName,
            viewHistory,
            saveAnswerAndUpdateClientVersion,
            language: parseLanguages(question.language),
          }}
        />
      )}
      {readOnly || viewHistory ? null : (
        <FileInputField
          disabled={disabled}
          name={`${answerId}.import_files`}
          onDropCallback={(filesToImport) => {
            handleStageFiles(filesToImport).then((response) => {
              const existingFiles = getValues()[answerId].files_attributes;
              const parsedFiles = response;
              const allFiles = existingFiles.concat(parsedFiles);
              handleUploadFiles(allFiles);
            });
          }}
        />
      )}
    </>
  );
};

VisibleProgrammingImportEditor.propTypes = {
  answerId: PropTypes.number.isRequired,
  disabled: PropTypes.bool.isRequired,
  dispatch: PropTypes.func,
  question: questionShape,
  readOnly: PropTypes.bool,
  viewHistory: PropTypes.bool,
  historyAnswers: PropTypes.shape({
    id: PropTypes.number,
    questionId: PropTypes.number,
    files_attributes: PropTypes.arrayOf(fileShape),
  }),
  saveAnswerAndUpdateClientVersion: PropTypes.func,
};

function mapStateToProps(state, ownProps) {
  const { answerId, question, readOnly, viewHistory, isSavingAnswer } =
    ownProps;
  const { submissionFlags, history } = state.assessments.submission;

  let historyAnswers;
  if (viewHistory) {
    historyAnswers = history.answers;
  }
  const disabled = submissionFlags.isSaving || isSavingAnswer;

  return {
    answerId,
    disabled,
    historyAnswers,
    question,
    readOnly,
  };
}

const ProgrammingImportEditor = connect(mapStateToProps)(
  VisibleProgrammingImportEditor,
);

export default ProgrammingImportEditor;
