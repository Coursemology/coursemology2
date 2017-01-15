import Immutable from 'immutable';

import React, { PropTypes } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
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
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export function validation(data, pathOfKeysToData, intl) {
  const mode = data.get('mode');
  const errors = [];

  switch (mode) {
    case 'python':
      return errors.concat(
        pythonValidation(data.get('python'), pathOfKeysToData.concat(['python']), intl)
      );
    default:
      return errors;
  }
}

const OnlineEditor = (props) => {
  const { data, actions, intl } = props;
  const testUI = data.get('test_ui');
  const mode = testUI.get('mode');
  const isLoading = data.get('is_loading');

  switch (mode) {
    case 'python':
      return (<OnlineEditorPythonView
        {...{
          actions, data: testUI.get('python'), dataFiles: testUI.get('data_files'), isLoading }}
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
