import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PackageTemplates from './PackageTemplates';
import PackageTestCases from './PackageTestCases';

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
  programmingPackage: PropTypes.object,
  intl: intlShape.isRequired,
};

const UploadedPackageView = (props) => {
  const { intl, programmingPackage: { templates, testCases } } = props;

  return (
    <div className="template-package-container">
      <h3>{intl.formatMessage(translations.templateHeader)}</h3>
      <PackageTemplates templates={templates} />
      <h3>{intl.formatMessage(translations.testCasesHeader)}</h3>
      <PackageTestCases testCases={testCases} />
    </div>
  );
};

UploadedPackageView.propTypes = propTypes;

export default injectIntl(UploadedPackageView);
