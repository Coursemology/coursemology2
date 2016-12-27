import Immutable from 'immutable';

import React, { PropTypes } from 'react';
import { injectIntl } from 'react-intl';
import { buildLogTranslations as translations } from '../constants/translations'

const propTypes = {
  buildLogData: PropTypes.instanceOf(Immutable.Map).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class BuildLog extends React.Component {
  render() {
    const { buildLogData, intl } = this.props;

    return (
      <div className="build-log">
        <h2>{intl.formatMessage(translations.header)}</h2>
        <h3>{intl.formatMessage(translations.stdoutHeader)}</h3>
        <div className="stdout">
          <pre>{buildLogData.get('stdout')}</pre>
        </div>
        <h3>{intl.formatMessage(translations.stderrHeader)}</h3>
        <div className="stderr">
          <pre>{buildLogData.get('stderr')}</pre>
        </div>
      </div>
    )
  }
}

BuildLog.propTypes = propTypes;

export default injectIntl(BuildLog);
