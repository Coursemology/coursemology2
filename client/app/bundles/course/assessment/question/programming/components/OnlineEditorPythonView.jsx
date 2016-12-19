import React, { PropTypes } from 'react';
import AceEditor from 'react-ace';
import styles from './OnlineEditorPythonView.scss'

import 'brace/mode/python';
import 'brace/theme/monokai';

export default class OnlineEditorPythonView extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    actions: React.PropTypes.shape({
      updatePythonCodeBlock: PropTypes.func.isRequired,
      createPythonTestCase: PropTypes.func.isRequired,
      updatePythonTestCase: PropTypes.func.isRequired,
      deletePythonTestCase: PropTypes.func.isRequired
    }),
    isLoading: PropTypes.bool.isRequired
  };

  componentWillReceiveProps(nextProps) {
    this.isLoading = nextProps.isLoading;
  }

  onCodeChange(field, e) {
    this.props.actions.updatePythonCodeBlock(field, e);
  }

  onTestCodeChange(type, index, field, e) {
    this.props.actions.updatePythonTestCase(type, index, field, e.target.value);
  }

  deleteTestCase(type, index, e) {
    if (!this.isLoading) {
      this.props.actions.deletePythonTestCase(type, index);
    }
  }

  addTestCase(type, e) {
    if (!this.isLoading) {
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
          setOptions={{useSoftTabs: true}}
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
               disabled={this.isLoading}
        />
      );
    };

    const rows = [...testCases.get(type).toArray().entries()].map(([index, test]) => {
      return (
        <tr key={index}>
          <td>
            <button className="btn btn-danger fa fa-minus" disabled={this.isLoading}
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
            <th>Identifier</th>
            <th>Expression</th>
            <th>Expected</th>
            <th>Hint</th>
          </tr>
          </thead>
          <tbody>
          {rows}
          <tr style={{ cursor: 'pointer' }}>
            <td className={styles.addNewTestRow} colSpan="5" onClick={this.addTestCase.bind(this, type)}>
              <button className={`btn btn-default ${styles.addNewTestButton}`} disabled={this.isLoading}>
                <i className="fa fa-plus" /> Add new test
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
        { this.renderAceEditor('prepend', 'Prepend') }
        { this.renderAceEditor('append', 'Append') }
        { this.renderAceEditor('solution', 'Solution Template') }
        { this.renderAceEditor('submission', 'Submission Template') }
        { this.renderTestCases('Public Test Cases', testCases, 'public') }
        { this.renderTestCases('Private Test Cases', testCases, 'private', testCases.get('public').size) }
        { this.renderTestCases('Evaluation Test Cases', testCases, 'evaluation', testCases.get('public').size + testCases.get('private').size) }
      </div>
    );
  }
}
