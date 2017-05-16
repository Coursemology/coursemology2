import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { Element } from 'react-scroll';
import Paper from 'material-ui/Paper';
import LessonPlanItem from '../components/LessonPlanItem';
import LessonPlanMilestone from '../components/LessonPlanMilestone';

const LessonPlanGroup = ({ milestone, items }) => {
  const componentKey = node => node.get('lesson_plan_element_class') + node.get('id');
  return (
    <Element name={`milestone-group-${milestone.get('id')}`}>
      <LessonPlanMilestone key={componentKey(milestone)} {...{ milestone }} />
      <Paper>
        {
          items.map(item =>
            <LessonPlanItem
              key={componentKey(item)}
              {...{ item }}
            />
          )
        }
      </Paper>
    </Element>
  );
};

LessonPlanGroup.propTypes = {
  milestone: PropTypes.instanceOf(Immutable.Map).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.instanceOf(Immutable.Map).isRequired
  ).isRequired,
};

export default LessonPlanGroup;
