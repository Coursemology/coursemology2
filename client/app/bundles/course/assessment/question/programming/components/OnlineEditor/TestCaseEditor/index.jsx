import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { FieldArray } from 'redux-form';

import 'brace/mode/python';
import 'brace/theme/monokai';

import translations from '../OnlineEditorView.intl';
import TestCaseTable from './TestCaseTable';

const propTypes = {
  isLoading: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

class TestCaseEditor extends React.Component {
  renderTestCasesByType(header, type) {
    const { intl } = this.props;

    return (
      <Card initiallyExpanded>
        <CardHeader
          title={header}
          textStyle={{ fontWeight: 'bold' }}
          actAsExpander
          showExpandableButton
        />
        <CardText expandable style={{ padding: 0 }}>
          <FieldArray
            name={`question_programming[test_cases][${type}]`}
            component={TestCaseTable}
            type={type}
            intl={intl}
          />
        </CardText>
      </Card>
    );
  }

  render() {
    const { intl } = this.props;
    return (
      <React.Fragment>
        {this.renderTestCasesByType(intl.formatMessage(translations.publicTestCases), 'public')}
        {this.renderTestCasesByType(intl.formatMessage(translations.privateTestCases), 'private')}
        {this.renderTestCasesByType(intl.formatMessage(translations.evaluationTestCases), 'evaluation')}
      </React.Fragment>
    );
  }
}

TestCaseEditor.propTypes = propTypes;

export default injectIntl(TestCaseEditor);
