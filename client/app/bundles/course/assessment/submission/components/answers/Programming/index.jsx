import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

import { getIsSavingAnswer } from 'course/assessment/submission/selectors/answerFlags';
import { useAppSelector } from 'lib/hooks/store';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';

import CodaveriFeedbackStatus from '../../../containers/CodaveriFeedbackStatus';
import ProgrammingImportEditor from '../../../containers/ProgrammingImport/ProgrammingImportEditor';
import { parseLanguages } from '../../../utils';

import ProgrammingFile from './ProgrammingFile';

const ProgrammingFiles = ({
  readOnly,
  answerId,
  language,
  saveAnswerAndUpdateClientVersion,
  editorRef,
}) => {
  const { control } = useFormContext();

  const { fields } = useFieldArray({
    control,
    name: `${answerId}.files_attributes`,
  });

  const currentField = useWatch({
    control,
    name: `${answerId}.files_attributes`,
  });

  const controlledProgrammingFields = fields.map((field, index) => ({
    ...field,
    ...currentField[index],
  }));

  return controlledProgrammingFields.map((field, index) => {
    const file = {
      id: field.id,
      filename: field.filename,
      content: field.content,
      highlightedContent: field.highlightedContent,
    };

    const keyString = `editor-container-${index}`;

    return (
      <div key={keyString} id={keyString} style={{ position: 'relative' }}>
        <Box marginRight="0px">
          <ProgrammingFile
            key={field.id}
            answerId={answerId}
            editorRef={editorRef}
            fieldName={`${answerId}.files_attributes.${index}.content`}
            file={file}
            language={language}
            readOnly={readOnly}
            saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
          />
        </Box>
      </div>
    );
  });
};

const Programming = (props) => {
  const {
    question,
    readOnly,
    answerId,
    saveAnswerAndUpdateClientVersion,
    editorRef,
  } = props;
  const fileSubmission = question.fileSubmission;
  const isSavingAnswer = useAppSelector((state) =>
    getIsSavingAnswer(state, answerId),
  );

  return (
    <div className="mt-5">
      {fileSubmission ? (
        <ProgrammingImportEditor
          key={question.id}
          answerId={answerId}
          isSavingAnswer={isSavingAnswer}
          question={question}
          readOnly={readOnly}
          saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
        />
      ) : (
        <ProgrammingFiles
          key={question.id}
          answerId={answerId}
          editorRef={editorRef}
          language={parseLanguages(question.language)}
          questionId={question.id}
          readOnly={readOnly}
          saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
        />
      )}
      <CodaveriFeedbackStatus answerId={answerId} questionId={question.id} />
    </div>
  );
};

Programming.propTypes = {
  question: PropTypes.object.isRequired,
  readOnly: PropTypes.bool.isRequired,
  answerId: PropTypes.number.isRequired,
  saveAnswerAndUpdateClientVersion: PropTypes.func.isRequired,
  editorRef: PropTypes.object.isRequired,
};

export default Programming;
