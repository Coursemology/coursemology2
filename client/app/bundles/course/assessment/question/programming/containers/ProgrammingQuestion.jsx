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


function mapStateToProps(state) {
  return state.toObject();
}

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  programmingQuestion: PropTypes.instanceOf(Immutable.Map).isRequired,
};

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
  const { dispatch, programmingQuestion } = props;
  const actions = bindActionCreators(programmingQuestionActionCreators, dispatch);
  const data = {
    question: programmingQuestion.get('question'),
    formData: programmingQuestion.get('form_data'),
    isLoading: programmingQuestion.get('is_loading'),
    isEvaluating: programmingQuestion.get('is_evaluating'),
  };

  const templatePackageActions = bindActionCreators(templatePackageActionCreators, dispatch);
  const onlineEditorActions = bindActionCreators(onlineEditorActionCreators, dispatch);

  const testView = data.question.get('can_edit_online') ?
    <OnlineEditor {...{ actions: onlineEditorActions, data: programmingQuestion }} />
    :
    (<UploadedPackageViewer
      {...{ actions: templatePackageActions, data: programmingQuestion }}
    />);

  const importAlertView = makeImportAlert(programmingQuestion);
  const buildLogView = makeBuildLog(programmingQuestion);

  return (
    <ProgrammingQuestionForm {...{ actions, data, testView, importAlertView, buildLogView }} />
  );
};

ProgrammingQuestion.propTypes = propTypes;

export default connect(mapStateToProps)(ProgrammingQuestion);
