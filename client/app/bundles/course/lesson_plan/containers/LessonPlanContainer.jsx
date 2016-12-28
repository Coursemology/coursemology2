import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LessonPlan from '../components/LessonPlan';
import * as actionCreators from '../actions';

function mapStateToProps(state) {
  return state.get('lessonPlan').toObject();
}

const propTypes = {
  milestones: React.PropTypes.instanceOf(Immutable.List).isRequired,
  items: React.PropTypes.instanceOf(Immutable.List).isRequired,
  hiddenItemTypes: React.PropTypes.instanceOf(Immutable.List).isRequired,
  dispatch: PropTypes.func.isRequired,
};

const LessonPlanContainer = (props) => {
  const { dispatch, milestones, items, hiddenItemTypes } = props;
  const { toggleItemTypeVisibility } = bindActionCreators(actionCreators, dispatch);

  return (
    <LessonPlan {...{ milestones, items, hiddenItemTypes, toggleItemTypeVisibility }} />
  );
};

LessonPlanContainer.propTypes = propTypes;

export default connect(mapStateToProps)(LessonPlanContainer);
