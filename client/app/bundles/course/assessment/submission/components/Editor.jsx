import { Controller, useFormContext } from 'react-hook-form';
import PropTypes from 'prop-types';

import AceEditorField from 'lib/components/form/fields/AceEditorField';

import { fileShape } from '../propTypes';

import ProgrammingFileDownloadLink from './answers/Programming/ProgrammingFileDownloadLink';

const Editor = (props) => {
  const { file, fieldName, language, answerId, saveAnswer } = props;
  const { control, getValues } = useFormContext();

  return (
    <>
      <ProgrammingFileDownloadLink file={file} />
      <Controller
        control={control}
        name={fieldName}
        render={({ field }) => (
          <AceEditorField
            editorProps={{ $blockScrolling: true }}
            field={{
              ...field,
              onChange: (event) => {
                field.onChange(event);
                const modifiedAnswer = {
                  [answerId]: getValues()[answerId],
                };
                saveAnswer(modifiedAnswer, answerId);
              },
            }}
            filename={file.filename}
            maxLines={25}
            minLines={25}
            mode={language}
            readOnly={false}
            setOptions={{ useSoftTabs: true }}
            style={{ marginBottom: 10 }}
            theme="github"
            width="100%"
          />
        )}
      />
    </>
  );
};

Editor.propTypes = {
  fieldName: PropTypes.string.isRequired,
  file: PropTypes.shape(fileShape).isRequired,
  language: PropTypes.string.isRequired,
  answerId: PropTypes.number,
  saveAnswer: PropTypes.func,
};

export default Editor;
