import Immutable from 'immutable';

import React, { PropTypes } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import TemplatePackageView from '../components/TemplatePackageView';
import TemplateTestCaseView from '../components/TemplateTestCaseView';

const translations = defineMessages({
  templateHeader: {
    id: 'course.assessment.question.programming.uploadedPackageViewer.templateHeader',
    defaultMessage: 'Template',
    description: 'Header for submission template of the uploaded package.',
  },
  testCasesHeader: {
    id: 'course.assessment.question.programming.uploadedPackageViewer.testCasesHeader',
    defaultMessage: 'Test Cases',
    description: 'Header for the test cases of the uploaded package.',
  },
});

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
          <TemplatePackageView {...{ changeTemplateTab, templates, selectedTab }} />
          <h2>{intl.formatMessage(translations.testCasesHeader)}</h2>
          <TemplateTestCaseView {...{ testCases }} />
        </div>
      );
    }

    return null;
  }
}

UploadedPackageViewer.propTypes = propTypes;

export default injectIntl(UploadedPackageViewer);
