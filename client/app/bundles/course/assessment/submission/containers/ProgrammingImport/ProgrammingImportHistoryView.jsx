import { useState } from 'react';
import PropTypes from 'prop-types';

import { fileShape } from '../../propTypes';
import ReadOnlyEditor from '../ReadOnlyEditor';

import ImportedFileView from './ImportedFileView';

const ProgrammingImportHistoryView = (props) => {
  const { historyAnswer } = props;

  const files = historyAnswer.files_attributes;

  const [displayFileName, setDisplayFileName] = useState(
    files && files.length > 0 ? files[0].filename : '',
  );
  const selectedFile = historyAnswer.files_attributes.find(
    (elem) => elem.filename === displayFileName,
  );

  return (
    <>
      <ImportedFileView
        displayFileName={displayFileName}
        files={files}
        handleFileTabbing={(filename) => setDisplayFileName(filename)}
        viewHistory
      />

      {selectedFile && (
        <ReadOnlyEditor answerId={historyAnswer.id} file={selectedFile} />
      )}
    </>
  );
};

ProgrammingImportHistoryView.propTypes = {
  historyAnswer: PropTypes.shape({
    id: PropTypes.number,
    questionId: PropTypes.number,
    files_attributes: PropTypes.arrayOf(fileShape),
  }).isRequired,
};

export default ProgrammingImportHistoryView;
