import { connect } from 'react-redux';
import { Map } from 'immutable';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import * as onlineEditorActionCreators from './actions/onlineEditorActionCreators';
import * as programmingQuestionActionCreators from './actions/programmingQuestionActionCreators';
import ProgrammingQuestionForm from './containers/ProgrammingQuestionForm/ProgrammingQuestionForm';

function mapStateToProps(state) {
  return state.toObject();
}

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  programmingQuestion: PropTypes.instanceOf(Map).isRequired,
};

const ProgrammingQuestion = (props) => {
  const { dispatch, programmingQuestion } = props;
  const actions = bindActionCreators(
    programmingQuestionActionCreators,
    dispatch,
  );
  const onlineEditorActions = bindActionCreators(
    onlineEditorActionCreators,
    dispatch,
  );

  return (
    <ProgrammingQuestionForm
      {...{
        actions,
        data: programmingQuestion,
        onlineEditorActions,
      }}
    />
  );
};

ProgrammingQuestion.propTypes = propTypes;

export default connect(mapStateToProps)(ProgrammingQuestion);
