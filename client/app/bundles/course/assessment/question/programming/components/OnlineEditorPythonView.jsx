import Immutable from 'immutable';

import React, { PropTypes } from 'react';
import AceEditor from 'react-ace';
import { injectIntl } from 'react-intl';

import 'brace/mode/python';
import 'brace/theme/monokai';

import styles from './OnlineEditorPythonView.scss';
import translations from './OnlineEditorPythonView.intl'

const propTypes = {
  data: PropTypes.instanceOf(Immutable.Map).isRequired,
  actions: React.PropTypes.shape({
    updatePythonCodeBlock: PropTypes.func.isRequired,
    createPythonTestCase: PropTypes.func.isRequired,
    updatePythonTestCase: PropTypes.func.isRequired,
    deletePythonTestCase: PropTypes.func.isRequired,
  }),
  isLoading: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class OnlineEditorPythonView extends React.Component {

  static handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  static getInputName(field) {
    return `question_programming[${field}]`;
  }

  static getTestInputName(type, field) {
    return `question_programming[test_cases][${type}][][${field}]`;
  }

  constructor(props) {
    super(props);
    this.onAutogradedChange = this.onAutogradedChange.bind(this);
  }

  onAutogradedChange(e) {
    this.props.actions.updatePythonCodeBlock('autograded', e.target.checked);
  }

  codeChangeHandler(field) {
    return e => this.props.actions.updatePythonCodeBlock(field, e);
  }

  testCaseUpdateHandler(type, index, field) {
    return e => this.props.actions.updatePythonTestCase(type, index, field, e.target.value);
  }

  testCaseDeleteHandler(type, index) {
    return (e) => {
      e.preventDefault();

      if (!this.props.isLoading) {
        this.props.actions.deletePythonTestCase(type, index);
      }
    };
  }

  testCaseCreateHandler(type) {
    return (e) => {
      e.preventDefault();

      if (!this.props.isLoading) {
        this.props.actions.createPythonTestCase(type);
      }
    };
  }

  renderCheckbox(label, field, value, onChange) {
    return (
      <div className="form-group boolean" key={field}>
        <div className="checkbox">
          <label className="boolean" htmlFor={field}>
            <input
              className="boolean"
              type="checkbox"
              name={OnlineEditorPythonView.getInputName(field)}
              checked={value}
              onChange={onChange}
              disabled={this.props.isLoading}
            />
            {label}
          </label>
        </div>
      </div>
    );
  }

  renderAceEditor(label, field) {
    return (
      <div className="form-group" key={field}>
        <label htmlFor={field}>{label}</label>
        <textarea
          name={OnlineEditorPythonView.getInputName(field)}
          value={this.props.data.get(field)}
          style={{ display: 'none' }}
          readOnly="true"
        />
        <AceEditor
          mode="python"
          theme="monokai"
          width="100%"
          minLines={10}
          maxLines={Math.max(20, this.props.data.get(field).split(/\r\n|\r|\n/).length)}
          name={OnlineEditorPythonView.getInputName(field)}
          value={this.props.data.get(field)}
          onChange={this.codeChangeHandler(field)}
          editorProps={{ $blockScrolling: true }}
          setOptions={{ useSoftTabs: true, readOnly: this.props.isLoading }}
        />
      </div>
    );
  }

  renderTestCases(header, testCases, type, startIndex = 0) {
    const renderInput = (test, field, index, required) => (
      <input
        className="form-control"
        type="text"
        name={OnlineEditorPythonView.getTestInputName(type, field)}
        required={required}
        value={test.get(field)}
        onChange={this.testCaseUpdateHandler(type, index, field)}
        onKeyPress={OnlineEditorPythonView.handleKeyPress}
        disabled={this.props.isLoading}
      />
      );

    const rows = [...testCases.get(type).toArray().entries()].map(([index, test]) => (
      <tr key={index}>
        <td>
          <button
            className="btn btn-danger fa fa-minus" disabled={this.props.isLoading}
            onClick={this.testCaseDeleteHandler(type, index)}
          />
        </td>
        <td>test_{type}_{startIndex + index + 1}</td>
        <td>{ renderInput(test, 'expression', index, true) }</td>
        <td>{ renderInput(test, 'expected', index, true) }</td>
        <td>{ renderInput(test, 'hint', index, false) }</td>
      </tr>
      ));

    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h4 className="panel-title">{header}</h4>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th />
              <th>{this.props.intl.formatMessage(translations.identifierHeader)}</th>
              <th>{this.props.intl.formatMessage(translations.expressionHeader)}</th>
              <th>{this.props.intl.formatMessage(translations.expectedHeader)}</th>
              <th>{this.props.intl.formatMessage(translations.hintHeader)}</th>
            </tr>
          </thead>
          <tbody>
            {rows}
            <tr style={{ cursor: 'pointer' }}>
              <td className={styles.addNewTestRow} colSpan="5">
                <button
                  className={`btn btn-default ${styles.addNewTestButton}`}
                  disabled={this.props.isLoading} onClick={this.testCaseCreateHandler(type)}
                >
                  <i className="fa fa-plus" />
                  {this.props.intl.formatMessage(translations.addNewTestButton)}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    const { intl, data } = this.props;
    const testCases = data.get('test_cases');
    const autograded = data.get('autograded');

    return (
      <div id="python-online-editor">
        {
          this.renderCheckbox(intl.formatMessage(translations.autograded), 'autograded',
            autograded, this.onAutogradedChange)
        }
        {
          this.renderAceEditor(intl.formatMessage(translations.submissionTitle), 'submission')
        }
        {
          autograded ?
            this.renderAceEditor(intl.formatMessage(translations.solutionTitle), 'solution')
            :
            null
        }
        {
          autograded ?
            this.renderAceEditor(intl.formatMessage(translations.prependTitle), 'prepend')
            :
            null
        }
        {
          autograded ?
            this.renderAceEditor(intl.formatMessage(translations.appendTitle), 'append')
            :
            null
        }
        {
          autograded ?
            this.renderTestCases(intl.formatMessage(translations.publicTestCases),
              testCases, 'public')
            :
            null
        }
        {
          autograded ?
            this.renderTestCases(intl.formatMessage(translations.privateTestCases),
              testCases, 'private', testCases.get('public').size)
            :
            null
        }
        {
          autograded ?
            this.renderTestCases(intl.formatMessage(translations.evaluationTestCases),
              testCases, 'evaluation',
              testCases.get('public').size + testCases.get('private').size)
            :
            null
        }
      </div>
    );
  }
}

OnlineEditorPythonView.propTypes = propTypes;

export default injectIntl(OnlineEditorPythonView);
