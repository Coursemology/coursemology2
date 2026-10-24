import { Component } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Editor from '../../components/Editor';
import { questionShape } from '../../propTypes';
import ReadOnlyEditor from '../ReadOnlyEditor';

import AnswerFilesTree from './AnswerFilesTree';

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

const VisibleProgrammingImportEditor = (props) => {
  const {
    answerId,
    editorRef,
    disabled,
    question,
    readOnly,
    displayFileName,
    setDisplayFileName,
    saveAnswerAndUpdateClientVersion,
  } = props;
  const { control } = useFormContext();
  const answers = useWatch({ control });

  // When an assessment is submitted/unsubmitted,
  // the form is somehow not reset yet and the answers for the new answerId
  // can't be found.
  if (!answers[answerId]) {
    return null;
  }

  const editor = (
    <SelectProgrammingFileEditor
      {...{
        answerId,
        editorRef,
        readOnly,
        question,
        displayFileName,
        saveAnswerAndUpdateClientVersion,
        language: question.editorMode,
      }}
    />
  );

  // Read-only answers stack every file, so they have no file tree.
  if (readOnly) return editor;

  // The file tree sits to the left of the editor, as in a code editor, and is as tall as the
  // editor: the editor alone sets the row's height, the tree fills it, and the tree's rows scroll.
  // On a narrow screen the tree goes above the editor at its own height. The minimum height keeps
  // the tree usable when no file is open, so there is no editor to set the height. The space below
  // belongs to the row, so the tree and the editor end at the same line.
  return (
    <div className="mb-3 flex flex-col md:flex-row">
      <div className="relative w-full flex-none md:min-h-80 md:w-80 xl:w-96">
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
