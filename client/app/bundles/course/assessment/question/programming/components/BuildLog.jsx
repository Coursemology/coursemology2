import Immutable from 'immutable';

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';

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
  data: PropTypes.instanceOf(Immutable.Map).isRequired,
  intl: intlShape.isRequired,
};

const BuildLog = (props) => {
  const { data, intl } = props;

  return (
    <div className="build-log">
      <h2>{intl.formatMessage(translations.header)}</h2>
      <h3>{intl.formatMessage(translations.stdoutHeader)}</h3>
      <div className="stdout">
        <pre>{data.get('stdout')}</pre>
      </div>
      <h3>{intl.formatMessage(translations.stderrHeader)}</h3>
      <div className="stderr">
        <pre>{data.get('stderr')}</pre>
      </div>
    </div>
  );
};

BuildLog.propTypes = propTypes;

export default injectIntl(BuildLog);
