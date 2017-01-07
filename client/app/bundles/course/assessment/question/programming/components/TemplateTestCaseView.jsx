import React, { PropTypes } from 'react';
import { injectIntl } from 'react-intl';
import translations from './OnlineEditorPythonView.intl';

const propTypes = {
  testCases: PropTypes.object.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class TemplateTestCaseView extends React.Component {

  renderPanel(header, tests) {
    let panelBody;

    if (tests.size > 0) {
      const rows = tests.map(test => (
        <tr key={test.get('id')}>
          <th>{ test.get('identifier') }</th>
          <td>{ test.get('expression') }</td>
          <td>{ test.get('expected') }</td>
          <td>{ test.get('hint') }</td>
        </tr>
        ));

      panelBody =
        (<table className="table">
          <thead>
            <tr>
              <th>{ this.props.intl.formatMessage(translations.identifierHeader) }</th>
              <th>{ this.props.intl.formatMessage(translations.expressionHeader) }</th>
              <th>{ this.props.intl.formatMessage(translations.expectedHeader) }</th>
              <th>{ this.props.intl.formatMessage(translations.hintHeader) }</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>);
    } else {
      panelBody = <div className="panel-body text-center">No tests.</div>;
    }

    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h4 className="panel-title">{header}</h4>
        </div>
        {panelBody}
      </div>
    );
  }

  render() {
    const { testCases, intl } = this.props;
    const publicTests = testCases.get('public');
    const privateTests = testCases.get('private');
    const evaluationTests = testCases.get('evaluation');

    return (
      <div>
        { this.renderPanel(intl.formatMessage(translations.publicTestCases), publicTests) }
        { this.renderPanel(intl.formatMessage(translations.privateTestCases), privateTests) }
        { this.renderPanel(intl.formatMessage(translations.evaluationTestCases), evaluationTests) }
      </div>
    );
  }
}

TemplateTestCaseView.propTypes = propTypes;

export default injectIntl(TemplateTestCaseView);
