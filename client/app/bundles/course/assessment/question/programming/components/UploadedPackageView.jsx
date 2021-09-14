import Immutable from 'immutable';

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import UploadedPackageTemplateView from './UploadedPackageTemplateView';
import UploadedPackageTestCaseView from './UploadedPackageTestCaseView';

const translations = defineMessages({
  templateHeader: {
    id: 'course.assessment.question.programming.uploadedPackageViewer.templateHeader',
    defaultMessage: 'Templates',
    description: 'Header for submission templates of the uploaded package.',
  },
  testCasesHeader: {
    id: 'course.assessment.question.programming.uploadedPackageViewer.testCasesHeader',
    defaultMessage: 'Test Cases',
    description: 'Header for the test cases of the uploaded package.',
  },
});

const propTypes = {
  data: PropTypes.instanceOf(Immutable.Map).isRequired,
  intl: intlShape.isRequired,
};

const UploadedPackageView = (props) => {
  const { data, intl } = props;
  const packageUI = data.get('package_ui');
  const templates = packageUI.get('templates');
  const testCases = packageUI.get('test_cases');

  if (data.get('question').get('package')) {
    return (
      <div className="template-package-container">
        <h3>{intl.formatMessage(translations.templateHeader)}</h3>
        <UploadedPackageTemplateView {...{ templates }} />
        <h3>{intl.formatMessage(translations.testCasesHeader)}</h3>
        <UploadedPackageTestCaseView {...{ testCases }} />
      </div>
    );
  }

  return null;
};

UploadedPackageView.propTypes = propTypes;

export default injectIntl(UploadedPackageView);
