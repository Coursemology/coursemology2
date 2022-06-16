import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Chip from '@mui/material/Chip';
import translations from './translations';

const FilePreview = (props) => {
  const { file } = props;
  return (
    <div className="file-name">
      {file && <Chip label={file.name} />}
      <div>
        <FormattedMessage {...translations.dropzone} />
      </div>
    </div>
  );
};

FilePreview.propTypes = {
  file: PropTypes.object,
};

export default FilePreview;
