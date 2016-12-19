import React, { PropTypes } from 'react';

export default class TemplateTestCaseView extends React.Component {
  static propTypes = {
    testCases: PropTypes.object.isRequired
  };

  renderPanel(header, tests) {
    var panelBody;

    if (tests.size > 0) {
      const rows = tests.map(test => {
        return (
          <tr key={test.get('id')}>
            <th>{test.get('identifier')}</th>
            <td>{test.get('expression')}</td>
            <td>{test.get('expected')}</td>
            <td>{test.get('hint')}</td>
          </tr>
        )
      });

      panelBody =
        <table className="table">
          <thead>
          <tr>
            <th>Identifier</th>
            <th>Expression</th>
            <th>Expected</th>
            <th>Hint</th>
          </tr>
          </thead>
          <tbody>
          {rows}
          </tbody>
        </table>;
    } else {
      panelBody = <div className="panel-body text-center">No tests.</div>
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
    const testCases = this.props.testCases;
    const publicTests = testCases.get('public');
    const privateTests = testCases.get('private');
    const evaluationTests = testCases.get('evaluation');

    return (
      <div>
        {this.renderPanel('Public Test Cases', publicTests)}
        {this.renderPanel('Private Test Cases', privateTests)}
        {this.renderPanel('Evaluation Test Cases', evaluationTests)}
      </div>
    );
  }
}
