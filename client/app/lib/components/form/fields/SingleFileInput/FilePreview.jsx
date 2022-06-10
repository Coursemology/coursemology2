import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Chip from '@mui/material/Chip';
import translations from './translations';

const FilePreview = (props) => {
  const { file } = props;
  return (
    <>
      {file && <Chip label={file.name} className="file-name" />}
      <div>
        <FormattedMessage {...translations.dropzone} />
      </div>
    </>
  );
};

FilePreview.propTypes = {
  file: PropTypes.object,
};

export default FilePreview;
