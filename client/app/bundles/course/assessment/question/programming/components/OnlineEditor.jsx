import Immutable from 'immutable';

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import OnlineEditorPythonView, { validation as pythonValidation } from './OnlineEditorPythonView';

const translations = defineMessages({
  selectLanguageAlert: {
    id: 'course.assessment.question.programming.onlineEditor.selectLanguageAlert',
    defaultMessage: 'Please select a language.',
    description: 'Alert message to be displayed when no language is selected.',
  },
  notYetImplementedAlert: {
    id: 'course.assessment.question.programming.onlineEditor.notYetImplementedAlert',
    defaultMessage: 'Not yet implemented :(',
    description: 'Alert message to be displayed when selected language does not have an online editor.',
  },
});

const propTypes = {
  data: PropTypes.instanceOf(Immutable.Map).isRequired,
  actions: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  autograded: PropTypes.bool.isRequired,
  autogradedAssessment: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

export function validation(data, pathOfKeysToData, intl) {
  const mode = data.getIn(pathOfKeysToData).get('mode');
  const errors = [];

  switch (mode) {
    case 'python':
      return errors.concat(
        pythonValidation(data, pathOfKeysToData.concat(['python']), intl)
      );
    default:
      return errors;
  }
}

const OnlineEditor = (props) => {
  const { data, actions, intl, isLoading, autograded, autogradedAssessment } = props;
  const mode = data.get('mode');

  switch (mode) {
    case 'python':
      return (<OnlineEditorPythonView
        {...{
          actions,
          data: data.get('python'),
          dataFiles: data.get('data_files'),
          isLoading,
          autograded,
          autogradedAssessment,
        }}
      />);

    case null:
      return (
        <div className="alert alert-warning">
          {intl.formatMessage(translations.selectLanguageAlert)}
        </div>
      );

    default:
      return (
        <div className="alert alert-info">
          {intl.formatMessage(translations.notYetImplementedAlert)}
        </div>
      );
  }
};

OnlineEditor.propTypes = propTypes;

export default injectIntl(OnlineEditor);
