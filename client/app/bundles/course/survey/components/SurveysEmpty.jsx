import React, { PropTypes } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import { grey600 } from 'material-ui/styles/colors';

const translations = defineMessages({
  noSurveys: {
    id: 'course.surveys.SurveysEmpty.noSurveys',
    defaultMessage: 'No surveys have been created.',
    description: 'Informs user that there are no surveys.',
  },
});

const inlineStyles = {
  noSurveys: {
    color: grey600,
  },
};

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const SurveysEmpty = ({ intl }) => (
  <h4 style={inlineStyles.noSurveys}>
    {intl.formatMessage(translations.noSurveys)}
  </h4>
);

SurveysEmpty.propTypes = propTypes;

export default injectIntl(SurveysEmpty);
