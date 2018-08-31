import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import translations from './translations';

class FilePreview extends React.Component {
  static propTypes = {
    file: PropTypes.object,
  };

  render() {
    const { file } = this.props;
    return (
      <>
        <div className="file-name">{file && file.name}</div>
        <div><FormattedMessage {...translations.dropzone} /></div>
      </>
    );
  }
}

export default FilePreview;
