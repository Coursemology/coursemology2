import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import translations from './translations';

const FilePreview = (props) => {
  const { file } = props;
  return (
    <>
      <div className="file-name">{file && file.name}</div>
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
