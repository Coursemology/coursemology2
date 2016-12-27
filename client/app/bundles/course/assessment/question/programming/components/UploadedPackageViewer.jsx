import Immutable from 'immutable';

import React, { PropTypes } from 'react';
import { injectIntl } from 'react-intl';
import TemplatePackageView from '../components/TemplatePackageView'
import TemplateTestCaseView from '../components/TemplateTestCaseView'
import { uploadedPackageViewer as translations } from '../constants/translations'

const propTypes = {
  data: PropTypes.instanceOf(Immutable.Map).isRequired,
  actions: PropTypes.object.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class UploadedPackageViewer extends React.Component {
  render() {
    const { data, actions, intl } = this.props;
    const { changeTemplateTab } = actions;
    const packageUI = data.get('package_ui');
    const templates = packageUI.get('templates');
    const selectedTab = packageUI.get('selected');
    const testCases = packageUI.get('test_cases');

    if (data.get('question').get('package')) {
      return (
        <div className="template-package-container">
          <h2>{intl.formatMessage(translations.templateHeader)}</h2>
          <TemplatePackageView {...{changeTemplateTab, templates, selectedTab}} />
          <h2>{intl.formatMessage(translations.testCasesHeader)}</h2>
          <TemplateTestCaseView {...{testCases}} />
        </div>
      );
    } else {
      return null;
    }
  }
}

UploadedPackageViewer.propTypes = propTypes;

export default injectIntl(UploadedPackageViewer);
