import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Immutable from 'immutable';

import BuildLog from '../components/BuildLog';
import OnlineEditor from '../components/OnlineEditor';
import ProgrammingQuestionForm from '../components/ProgrammingQuestionForm';
import UploadedPackageViewer from '../components/UploadedPackageViewer';
import * as onlineEditorActionCreators from '../actions/onlineEditorActionCreators';
import * as programmingQuestionActionCreators from '../actions/programmingQuestionActionCreators';
import * as templatePackageActionCreators from '../actions/templatePackageActionCreators';

function select(state) {
  return { programmingQuestionStore: state.programmingQuestionStore };
}

function makeImportAlert(store) {
  const alertData = store.get('import_result').get('alert');

  if (alertData) {
    return <div className={alertData.get('class')}>{alertData.get('message')}</div>;
  }

  return null;
}

function makeBuildLog(store) {
  const buildLogData = store.get('import_result').get('build_log');

  if (buildLogData) {
    return <BuildLog {...{ buildLogData }} />;
  }

  return null;
}

const ProgrammingQuestion = (props) => {
  const { dispatch, programmingQuestionStore } = props;
  const actions = bindActionCreators(programmingQuestionActionCreators, dispatch);
  const data = {
    question: programmingQuestionStore.get('question'),
    formData: programmingQuestionStore.get('form_data'),
    isLoading: programmingQuestionStore.get('is_loading'),
    isEvaluating: programmingQuestionStore.get('is_evaluating'),
  };

  const templatePackageActions = bindActionCreators(templatePackageActionCreators, dispatch);
  const onlineEditorActions = bindActionCreators(onlineEditorActionCreators, dispatch);

  const testView = data.question.get('can_edit_online') ?
    <OnlineEditor {...{ actions: onlineEditorActions, data: programmingQuestionStore }} />
    :
    (<UploadedPackageViewer
      {...{ actions: templatePackageActions, data: programmingQuestionStore }}
    />);

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
