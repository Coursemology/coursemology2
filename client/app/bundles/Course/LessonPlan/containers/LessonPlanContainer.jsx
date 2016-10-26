import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LessonPlan from '../components/LessonPlan';
import * as actionCreators from '../actions';

function mapStateToProps(state) {
  const lessonPlan = state.lessonPlan;
  const items = lessonPlan.get('items');
  const milestones = lessonPlan.get('milestones');
  const hiddenItemTypes = lessonPlan.get('hiddenItemTypes');

  return { milestones, items, hiddenItemTypes };
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
