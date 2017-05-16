import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LessonPlanFilterButton from '../components/LessonPlanFilterButton';
import * as actionCreators from '../actions';

function mapStateToProps(state) {
  return state.get('lessonPlan').toObject();
}

const propTypes = {
  items: PropTypes.instanceOf(Immutable.List).isRequired,
  hiddenItemTypes: PropTypes.instanceOf(Immutable.List).isRequired,
  dispatch: PropTypes.func.isRequired,
};

const LessonPlanFilter = ({ items, hiddenItemTypes, dispatch }) => {
  const { toggleItemTypeVisibility } = bindActionCreators(actionCreators, dispatch);

  const childProps = {
    items,
    hiddenItemTypes,
    toggleItemTypeVisibility,
  };

  return (<LessonPlanFilterButton {...childProps} />);
};

LessonPlanFilter.propTypes = propTypes;

export default connect(mapStateToProps)(LessonPlanFilter);
