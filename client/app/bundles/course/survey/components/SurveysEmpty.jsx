import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
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

const SurveysEmpty = () => (
  <h4 style={inlineStyles.noSurveys}>
    {<FormattedMessage {...translations.noSurveys} />}
  </h4>
);

export default SurveysEmpty;
