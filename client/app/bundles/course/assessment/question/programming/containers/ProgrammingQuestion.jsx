import React, { PropTypes } from 'react';
import BuildLog from '../components/BuildLog'
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
  return { programmingQuestionStore: state.programmingQuestionStore };
}

function makeUploadedPackageViewer(templatePackageActions, store) {
  const { changeTemplateTab } = templatePackageActions;
  const packageUI = store.get('package_ui');
  const templates = packageUI.get('templates');
  const selectedTab = packageUI.get('selected');
  const testCases = packageUI.get('test_cases');

  if (store.get('question').get('package')) {
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

function makeOnlineEditor(actions, store) {
  const mode = store.get('test_ui').get('mode');
  const isLoading = store.get('is_loading');

  switch (mode) {
    case 'python':
      const data = store.get('test_ui').get('python');
      return <OnlineEditorPythonView {...{ actions, data, isLoading }}/>;

    case null:
      return <div className="alert alert-warning">Please select a language.</div>;

    default:
      return <div className="alert alert-info">Not yet implemented :(</div>;
  }
}

function makeImportAlert(store) {
  const alertData = store.get('import_result').get('alert');

  if (alertData) {
    return <div className={alertData.get('class')}>{alertData.get('message')}</div>
  } else {
    return null;
  }
}

function makeBuildLog(store) {
  const buildLogData = store.get('import_result').get('build_log');

  if (buildLogData) {
    return <BuildLog {...{ buildLogData }} />;
  } else {
    return null;
  }
}

const ProgrammingQuestion = (props) => {
  const { dispatch, programmingQuestionStore } = props;
  const actions = bindActionCreators(programmingQuestionActionCreators, dispatch);
  const data = {
    question: programmingQuestionStore.get('question'),
    formData: programmingQuestionStore.get('form_data'),
    isLoading: programmingQuestionStore.get('is_loading'),
    isEvaluating: programmingQuestionStore.get('is_evaluating')
  };

  const templatePackageActions = bindActionCreators(templatePackageActionCreators, dispatch);
  const onlineEditorActions = bindActionCreators(onlineEditorActionCreators, dispatch);

  var testView = data.question.get('can_edit_online') ?
    makeOnlineEditor(onlineEditorActions, programmingQuestionStore)
    :
    makeUploadedPackageViewer(templatePackageActions, programmingQuestionStore);

  const importAlertView = makeImportAlert(programmingQuestionStore);
  const buildLogView = makeBuildLog(programmingQuestionStore);

  return (
    <ProgrammingQuestionForm {...{ actions, data, testView, importAlertView, buildLogView }} />
  );
};

ProgrammingQuestion.propTypes = {
  dispatch: PropTypes.func.isRequired,
  programmingQuestionStore: PropTypes.instanceOf(Immutable.Map).isRequired,
};

export default connect(select)(ProgrammingQuestion);
