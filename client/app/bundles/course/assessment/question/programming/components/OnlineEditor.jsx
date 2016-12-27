import Immutable from 'immutable';

import React, { PropTypes } from 'react';
import { injectIntl } from 'react-intl';
import OnlineEditorPythonView from '../components/OnlineEditorPythonView'
import { onlineEditorTranslations as translations } from '../constants/translations'

const propTypes = {
  data: PropTypes.instanceOf(Immutable.Map).isRequired,
  actions: PropTypes.object.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class OnlineEditor extends React.Component {
  render() {
    const { data, actions, intl } = this.props;
    const testUI = data.get('test_ui');
    const mode = testUI.get('mode');
    const isLoading = data.get('is_loading');

    switch (mode) {
      case 'python':
        let data = testUI.get('python');
        return <OnlineEditorPythonView {...{ actions, data, isLoading }}/>;

      case null:
        return <div className="alert alert-warning">{intl.formatMessage(translations.selectLanguageAlert)}</div>;

      default:
        return <div className="alert alert-info">{intl.formatMessage(translations.notYetImplementedAlert)}</div>;
    }
  }
}

OnlineEditor.propTypes = propTypes;

export default injectIntl(OnlineEditor);
