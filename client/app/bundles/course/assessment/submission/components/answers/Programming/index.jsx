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

const ProgrammingFiles = ({ readOnly, answerId, language }) => {
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

  return controlledProgrammingFields.map((field, index) => (
    <ProgrammingFile
      key={field.id}
      {...{
        control,
        file: field,
        fieldName: `${answerId}.files_attributes.${index}`,
        readOnly,
        answerId,
        language,
      }}
    />
  ));
};

const Programming = (props) => {
  const { question, readOnly, answerId } = props;
  const fileSubmission = question.fileSubmission;

  return (
    <div>
      {fileSubmission ? (
        <ProgrammingImportEditor
          key={question.id}
          answerId={answerId}
          questionId={question.id}
          {...{ readOnly, question }}
        />
      ) : (
        <ProgrammingFiles
          key={question.id}
          answerId={answerId}
          language={parseLanguages(question.language)}
          readOnly={readOnly}
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
};

export default Programming;
