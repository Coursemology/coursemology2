import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import PropTypes from 'prop-types';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';

import CodaveriFeedbackStatus from '../../../containers/CodaveriFeedbackStatus';
import ProgrammingImportEditor from '../../../containers/ProgrammingImportEditor';
import TestCaseView from '../../../containers/TestCaseView';
import { questionShape } from '../../../propTypes';
import { parseLanguages } from '../../../utils';

import ProgrammingFile from './ProgrammingFile';

const ProgrammingFiles = ({ readOnly, answerId, language, saveAnswer }) => {
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
    return (
      <ProgrammingFile
        key={field.id}
        answerId={answerId}
        fieldName={`${answerId}.files_attributes.${index}.content`}
        file={file}
        language={language}
        readOnly={readOnly}
        saveAnswer={saveAnswer}
      />
    );
  });
};

const Programming = (props) => {
  const { question, readOnly, answerId, saveAnswer } = props;
  const fileSubmission = question.fileSubmission;

  return (
    <div>
      {fileSubmission ? (
        <ProgrammingImportEditor
          key={question.id}
          answerId={answerId}
          question={question}
          questionId={question.id}
          readOnly={readOnly}
        />
      ) : (
        <ProgrammingFiles
          key={question.id}
          answerId={answerId}
          language={parseLanguages(question.language)}
          readOnly={readOnly}
          saveAnswer={saveAnswer}
        />
      )}
      <TestCaseView questionId={question.id} />
      <CodaveriFeedbackStatus answerId={answerId} questionId={question.id} />
    </div>
  );
};

Programming.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  answerId: PropTypes.number,
  saveAnswer: PropTypes.func,
};

export default Programming;
