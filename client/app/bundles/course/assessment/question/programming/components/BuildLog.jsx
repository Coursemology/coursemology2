import Immutable from 'immutable';

import React, { PropTypes } from 'react';
import { injectIntl, defineMessages } from 'react-intl';

const translations = defineMessages({
  header: {
    id: 'course.assessment.question.programming.buildLog.header',
    defaultMessage: 'Build Log',
    description: 'Header for build log.',
  },
  stdoutHeader: {
    id: 'course.assessment.question.programming.buildLog.stdoutHeader',
    defaultMessage: 'Standard Output',
    description: 'Header for standard output.',
  },
  stderrHeader: {
    id: 'course.assessment.question.programming.buildLog.stderrHeader',
    defaultMessage: 'Standard Error',
    description: 'Header for standard error.',
  },
});

const propTypes = {
  buildLogData: PropTypes.instanceOf(Immutable.Map).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const BuildLog = (props) => {
  const { buildLogData, intl } = props;

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
  );
};

BuildLog.propTypes = propTypes;

export default injectIntl(BuildLog);
