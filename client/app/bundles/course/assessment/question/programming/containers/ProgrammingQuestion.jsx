import React, { PropTypes } from 'react';
import OnlineEditorPythonView from '../components/OnlineEditorPythonView'
import ProgrammingQuestionForm from '../components/ProgrammingQuestionForm';
import TemplatePackageView from '../components/TemplatePackageView'
import TemplateTestCaseView from '../components/TemplateTestCaseView'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Immutable from 'immutable';
import * as onlineEditorActionCreators from '../actions/onlineEditorActionCreators'
import * as programmingQuestionActionCreators from '../actions/programmingQuestionActionCreators';
import * as templatePackageActionCreators from '../actions/templatePackageActionCreators'

function select(state) {
  // Note the use of `$$` to prefix the property name because the value is of type Immutable.js
  return { $$programmingQuestionStore: state.$$programmingQuestionStore };
}

function makePackageUploadUI(templatePackageActions, $$store) {
  const { changeTemplateTab } = templatePackageActions;
  const packageUI = $$store.get('package_ui');
  const templates = packageUI.get('templates');
  const selectedTab = packageUI.get('selected');
  const testCases = packageUI.get('test_cases');

  if ($$store.get('question').get('package')) {
    return (
      <div className="template-package-container">
        <h2>Template</h2>
        <TemplatePackageView {...{changeTemplateTab, templates, selectedTab}} />
        <h2>Test Cases</h2>
        <TemplateTestCaseView {...{testCases}} />
      </div>
    );
  } else {
    return null;
  }
}

function makeOnlineEditorUI(actions, $$store) {
  const mode = $$store.get('test_ui').get('mode');
  const isLoading = $$store.get('is_loading');

  switch (mode) {
    case 'python':
      const data = $$store.get('test_ui').get('python');
      return <OnlineEditorPythonView {...{ actions, data, isLoading }}/>;

    case null:
      return <div className="alert alert-warning">Please select a language.</div>;

    default:
      return <div className="alert alert-info">Not yet implemented :(</div>;
  }
}

function makeImportAlertView($$store) {
  const alertData = $$store.get('import_result').get('alert');

  if (alertData) {
    return <div className={alertData.get('class')}>{alertData.get('message')}</div>
  } else {
    return null;
  }
}

function makeBuildLogView($$store) {
  const buildLogData = $$store.get('import_result').get('build_log');

  if (buildLogData) {
    return (
      <div className="build-log">
        <h2>Build Log</h2>
        <h3>Standard Output</h3>
        <div className="stdout">
          <pre>{buildLogData.get('stdout')}</pre>
        </div>
        <h3>Standard Error</h3>
        <div className="stderr">
          <pre>{buildLogData.get('stderr')}</pre>
        </div>
      </div>
    )
  } else {
    return null;
  }
}

const ProgrammingQuestion = (props) => {
  const { dispatch, $$programmingQuestionStore } = props;
  const actions = bindActionCreators(programmingQuestionActionCreators, dispatch);
  const data = {
    question: $$programmingQuestionStore.get('question'),
    formData: $$programmingQuestionStore.get('form_data'),
    isLoading: $$programmingQuestionStore.get('is_loading'),
    isEvaluating: $$programmingQuestionStore.get('is_evaluating')
  };

  const templatePackageActions = bindActionCreators(templatePackageActionCreators, dispatch);
  const onlineEditorActions = bindActionCreators(onlineEditorActionCreators, dispatch);

  var testView = data.question.get('can_edit_online') ?
    makeOnlineEditorUI(onlineEditorActions, $$programmingQuestionStore)
    :
    makePackageUploadUI(templatePackageActions, $$programmingQuestionStore);

  const importAlertView = makeImportAlertView($$programmingQuestionStore);
  const buildLogView = makeBuildLogView($$programmingQuestionStore);

  // This uses the ES2015 spread operator to pass properties as it is more DRY
  return (
    <ProgrammingQuestionForm {...{ actions, data, testView, importAlertView, buildLogView }} />
  );
};

ProgrammingQuestion.propTypes = {
  dispatch: PropTypes.func.isRequired,

  // This corresponds to the value used in function select above.
  // We prefix all property and variable names pointing to Immutable.js objects with '$$'.
  // This allows us to immediately know we don't call $$programmingQuestionStore['someProperty'],
  // but instead use the Immutable.js `get` API for Immutable.Map
  $$programmingQuestionStore: PropTypes.instanceOf(Immutable.Map).isRequired,
};

// Don't forget to actually use connect!
// Note that we don't export ProgrammingQuestion, but the redux "connected" version of it.
// See https://github.com/reactjs/react-redux/blob/master/docs/api.md#examples
export default connect(select)(ProgrammingQuestion);
