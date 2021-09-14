import { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import translations from './translations';

class FilePreview extends Component {
  render() {
    const { file } = this.props;
    return (
      <>
        <div className="file-name">{file && file.name}</div>
        <div>
          <FormattedMessage {...translations.dropzone} />
        </div>
      </>
    );
  }
}

FilePreview.propTypes = {
  file: PropTypes.object,
};

export default FilePreview;
