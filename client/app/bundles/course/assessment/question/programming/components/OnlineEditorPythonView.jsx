import Immutable from 'immutable';

import React, { PropTypes } from 'react';
import AceEditor from 'react-ace';
import { injectIntl } from 'react-intl';
import styles from './OnlineEditorPythonView.scss'
import { onlineEditorPythonViewTranslations as translations } from '../constants/translations'

import 'brace/mode/python';
import 'brace/theme/monokai';

const propTypes = {
  data: PropTypes.instanceOf(Immutable.Map).isRequired,
  actions: React.PropTypes.shape({
    updatePythonCodeBlock: PropTypes.func.isRequired,
    createPythonTestCase: PropTypes.func.isRequired,
    updatePythonTestCase: PropTypes.func.isRequired,
    deletePythonTestCase: PropTypes.func.isRequired
  }),
  isLoading: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class OnlineEditorPythonView extends React.Component {

  onCodeChange(field, e) {
    this.props.actions.updatePythonCodeBlock(field, e);
  }

  onTestCodeChange(type, index, field, e) {
    this.props.actions.updatePythonTestCase(type, index, field, e.target.value);
  }

  deleteTestCase(type, index, e) {
    e.preventDefault();

    if (!this.props.isLoading) {
      this.props.actions.deletePythonTestCase(type, index);
    }
  }

  addTestCase(type, e) {
    e.preventDefault();

    if (!this.props.isLoading) {
      this.props.actions.createPythonTestCase(type);
    }
  }

  handleKeyPress = (event) => {
    if(event.key == 'Enter'){
      event.preventDefault();
    }
  };

  getInputName = (field) => {
    return `question_programming[${field}]`;
  };

  getTestInputName = (type, field) => {
    return `question_programming[test_cases][${type}][][${field}]`;
  };

  renderAceEditor(field, label) {
    return (
      <div className="form-group" key={field}>
        <label>{label}</label>
        <textarea name={this.getInputName(field)}
                  value={this.props.data.get(field)}
                  style={{display: 'none'}}
                  readOnly="true"
        />
        <AceEditor
          mode="python"
          theme="monokai"
          width="100%"
          minLines={10}
          maxLines={Math.max(20, this.props.data.get(field).split(/\r\n|\r|\n/).length)}
          name={this.getInputName(field)}
          value={this.props.data.get(field)}
          onChange={this.onCodeChange.bind(this, field)}
          editorProps={{$blockScrolling: true}}
          setOptions={{useSoftTabs: true, readOnly: this.props.isLoading}}
        />
      </div>
    );
  }

  renderTestCases(header, testCases, type, startIndex=0) {

    const renderInput = (test, field, index, required) => {
      return (
        <input className="form-control"
               type="text"
               name={this.getTestInputName(type, field)}
               required={required}
               value={test.get(field)}
               onChange={this.onTestCodeChange.bind(this, type, index, field)}
               onKeyPress={this.handleKeyPress}
               disabled={this.props.isLoading}
        />
      );
    };

    const rows = [...testCases.get(type).toArray().entries()].map(([index, test]) => {
      return (
        <tr key={index}>
          <td>
            <button className="btn btn-danger fa fa-minus" disabled={this.props.isLoading}
                    onClick={this.deleteTestCase.bind(this, type, index)} />
          </td>
          <td>test_{type}_{startIndex + index + 1}</td>
          <td>{ renderInput(test, 'expression', index, true) }</td>
          <td>{ renderInput(test, 'expected', index, true) }</td>
          <td>{ renderInput(test, 'hint', index, false) }</td>
        </tr>
      )
    });

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
            <td className={styles.addNewTestRow} colSpan="5" onClick={this.addTestCase.bind(this, type)}>
              <button className={`btn btn-default ${styles.addNewTestButton}`} disabled={this.props.isLoading} onClick={(e) => e.preventDefault()}>
                <i className="fa fa-plus" /> {this.props.intl.formatMessage(translations.addNewTestButton)}
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    )
  }

  render() {
    const testCases = this.props.data.get('test_cases');

    return (
      <div id="python-online-editor">
        { this.renderAceEditor('prepend', this.props.intl.formatMessage(translations.prependTitle)) }
        { this.renderAceEditor('append', this.props.intl.formatMessage(translations.appendTitle)) }
        { this.renderAceEditor('solution', this.props.intl.formatMessage(translations.solutionTitle)) }
        { this.renderAceEditor('submission', this.props.intl.formatMessage(translations.submissionTitle)) }
        { this.renderTestCases(this.props.intl.formatMessage(translations.publicTestCases), testCases, 'public') }
        { this.renderTestCases(this.props.intl.formatMessage(translations.privateTestCases), testCases, 'private', testCases.get('public').size) }
        { this.renderTestCases(this.props.intl.formatMessage(translations.evaluationTestCases), testCases, 'evaluation', testCases.get('public').size + testCases.get('private').size) }
      </div>
    );
  }
}

OnlineEditorPythonView.propTypes = propTypes;

export default injectIntl(OnlineEditorPythonView);
