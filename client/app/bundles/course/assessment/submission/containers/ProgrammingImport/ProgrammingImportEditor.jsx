import { Component } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  deleteProgrammingFile,
  importProgrammingFiles,
} from '../../actions/answers/programming';
import Editor from '../../components/Editor';
import FileInputField from '../../components/FileInput';
import { questionShape } from '../../propTypes';
import ReadOnlyEditor from '../ReadOnlyEditor';

import ImportedFileView from './ImportedFileView';

const SelectProgrammingFileEditor = ({
  answerId,
  editorRef,
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
            // The editor is bound to the file's position, so it must remount if the file moves:
            // a mounted editor keeps showing the value of the position it was created for.
            <Editor
              key={`${file.id}-${index}`}
              editorRef={editorRef}
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
  editorRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Component) }),
  ]),
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
    editorRef,
    disabled,
    dispatch,
    question,
    readOnly,
    displayFileName,
    setDisplayFileName,
    saveAnswerAndUpdateClientVersion,
  } = props;
  const { control, resetField, getValues } = useFormContext();
  const answers = useWatch({ control });

  const files = answers[answerId]
    ? answers[answerId].files_attributes ||
      answers[`${answerId}`].files_attributes
    : null;

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
        question.editorMode,
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
    <div className="mb-3 flex flex-col gap-4 md:flex-row">
      <div className="relative w-full flex-none md:min-h-80 md:w-72 lg:w-80">
        <div className="md:absolute md:inset-0">
          <AnswerFilesTree
            answerId={answerId}
            disabled={disabled}
            displayFileName={displayFileName}
            language={question.editorMode}
            setDisplayFileName={setDisplayFileName}
          />
        </div>
      </div>
      <div className="min-w-0 flex-1">{editor}</div>
    </div>
  );
};

VisibleProgrammingImportEditor.propTypes = {
  answerId: PropTypes.number.isRequired,
  disabled: PropTypes.bool.isRequired,
  dispatch: PropTypes.func,
  question: questionShape,
  readOnly: PropTypes.bool,
  displayFileName: PropTypes.string,
  setDisplayFileName: PropTypes.func,
  saveAnswerAndUpdateClientVersion: PropTypes.func,
  editorRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Component) }),
  ]),
};

function mapStateToProps(state, ownProps) {
  const { answerId, question, readOnly, isSavingAnswer } = ownProps;
  const { submissionFlags } = state.assessments.submission;
  const disabled = submissionFlags.isSaving || isSavingAnswer;

  return {
    answerId,
    disabled,
    question,
    readOnly,
  };
}

const ProgrammingImportEditor = connect(mapStateToProps)(
  VisibleProgrammingImportEditor,
);

export default ProgrammingImportEditor;
