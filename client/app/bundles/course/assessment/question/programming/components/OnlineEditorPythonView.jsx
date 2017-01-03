import Immutable from 'immutable';

import React, { PropTypes } from 'react';
import AceEditor from 'react-ace';
import { injectIntl } from 'react-intl';
import TextField from 'material-ui/TextField';

import 'brace/mode/python';
import 'brace/theme/monokai';

import styles from './OnlineEditorPythonView.scss';
import translations from './OnlineEditorPythonView.intl';

const propTypes = {
  data: PropTypes.instanceOf(Immutable.Map).isRequired,
  dataFiles: PropTypes.instanceOf(Immutable.Map).isRequired,
  actions: React.PropTypes.shape({
    updatePythonCodeBlock: PropTypes.func.isRequired,
    createPythonTestCase: PropTypes.func.isRequired,
    updatePythonTestCase: PropTypes.func.isRequired,
    deletePythonTestCase: PropTypes.func.isRequired,
    updateNewDataFile: PropTypes.func.isRequired,
    deleteNewDataFile: PropTypes.func.isRequired,
    deleteExistingDataFile: PropTypes.func.isRequired,
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
    this.renderExistingDataFiles = this.renderExistingDataFiles.bind(this);
  }

  onAutogradedChange(e) {
    this.props.actions.updatePythonCodeBlock('autograded', e.target.checked);
  }

  codeChangeHandler(field) {
    return e => this.props.actions.updatePythonCodeBlock(field, e);
  }

  newDataFileChangeHandler(index) {
    return (e) => {
      const files = e.target.files;
      const filename = files.length === 0 ? null : files[0].name;
      this.props.actions.updateNewDataFile(filename, index);
    };
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

  renderExistingDataFiles() {
    if (this.props.data.get('data_files').size === 0) {
      return null;
    }

    const formatBytes = (bytes, decimals) => {
      if (bytes === 0) return '0 Byte';
      const k = 1000; // or 1024 for binary
      const dm = decimals || 3;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const renderDataFile = (fileData) => {
      const filename = fileData.get('filename');
      const filesize = fileData.get('size');
      const hash = fileData.get('hash');
      const toDelete = this.props.dataFiles.get('to_delete').has(filename);

      return (
        <tr key={hash}>
          <td className={styles.deleteButtonCell}>
            <input
              className="boolean"
              type="checkbox"
              name={`question_programming[data_files_to_delete][${filename}]`}
              checked={toDelete}
              onChange={() => { this.props.actions.deleteExistingDataFile(filename); }}
              disabled={this.props.isLoading}
            />
          </td>
          <td>{filename}</td>
          <td>{formatBytes(filesize, 2)}</td>
        </tr>
      );
    };

    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h4 className="panel-title">
            {this.props.intl.formatMessage(translations.dataFilesHeader)}
          </h4>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>{this.props.intl.formatMessage(translations.deleteDataFilesHeader)}</th>
              <th>{this.props.intl.formatMessage(translations.fileNameHeader)}</th>
              <th>{this.props.intl.formatMessage(translations.fileSizeHeader)}</th>
            </tr>
          </thead>
          <tbody>
            {this.props.data.get('data_files').map(renderDataFile)}
          </tbody>
        </table>
      </div>
    );
  }

  renderDataFiles() {
    const newDataFilesRows = this.props.dataFiles.get('new').map((fileData, index) => {
      const key = fileData.get('key');

      return (
        <tr key={key}>
          <td className={styles.deleteButtonCell}>
            {
              this.props.dataFiles.get('key') === key ?
                null
                :
                <button
                  className="btn btn-danger fa fa-minus" disabled={this.props.isLoading}
                  onClick={() => { this.props.actions.deleteNewDataFile(index); }}
                />
            }
          </td>
          <td>
            <input
              className="form-control"
              name="question_programming[data_files][]"
              type="file"
              disabled={this.props.isLoading}
              onChange={this.newDataFileChangeHandler(index)}
            />
          </td>
        </tr>
      );
    });

    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h4 className="panel-title">
            {this.props.intl.formatMessage(translations.newDataFilesHeader)}
          </h4>
        </div>
        <table className="table">
          <tbody>
            { newDataFilesRows }
          </tbody>
        </table>
      </div>
    );
  }

  renderTestCases(header, testCases, type, startIndex = 0) {
    const renderInput = (test, field, placeholder, index, required) => (
      <TextField
        type="text"
        name={OnlineEditorPythonView.getTestInputName(type, field)}
        onChange={(e, newValue) => {
          this.props.actions.updatePythonTestCase(type, index, field, newValue);
        }}
        hintText={placeholder}
        disabled={this.props.isLoading}
        value={test.get(field)}
        fullWidth
      />
    );

    const expression = this.props.intl.formatMessage(translations.expressionHeader);
    const expected = this.props.intl.formatMessage(translations.expectedHeader);
    const hint = this.props.intl.formatMessage(translations.hintHeader);

    const rows = [...testCases.get(type).toArray().entries()].map(([index, test]) => (
      <tr key={index}>
        <td className={styles.deleteButtonCell}>
          <button
            className="btn btn-danger fa fa-minus" disabled={this.props.isLoading}
            onClick={this.testCaseDeleteHandler(type, index)}
          />
        </td>
        <td className={styles.testCell}>test_{type}_{startIndex + index + 1}</td>
        <td className={styles.testCell}>
          { renderInput(test, 'expression', expression, index, true) }
        </td>
        <td className={styles.testCell}>
          { renderInput(test, 'expected', expected, index, true) }
        </td>
        <td className={styles.testCell}>
          { renderInput(test, 'hint', hint, index, false) }
        </td>
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
              <th>{expression}</th>
              <th>{expected}</th>
              <th>{hint}</th>
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
            this.renderExistingDataFiles()
            :
            null
        }
        {
          autograded ?
            this.renderDataFiles()
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
