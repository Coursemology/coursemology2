import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { Element } from 'react-scroll';
import LessonPlanItem from '../components/LessonPlanItem';
import LessonPlanMilestone from '../components/LessonPlanMilestone';

const propTypes = {
  milestone: PropTypes.instanceOf(Immutable.Map).isRequired,
  items: PropTypes.instanceOf(Immutable.List).isRequired,
  lessonPlanItemTypeKey: PropTypes.func.isRequired,
};

const MilestoneGroup = ({ milestone, items, lessonPlanItemTypeKey }) => {
  const componentKey = node => node.get('lesson_plan_element_class') + node.get('id');
  return (
    <Element name={`milestone-group-${milestone.get('id')}`}>
      <LessonPlanMilestone key={componentKey(milestone)} {...{ milestone }} />
      {
        items.map(item =>
          <LessonPlanItem
            key={componentKey(item)}
            {...{ lessonPlanItemTypeKey, item }}
          />
        )
      }
    </Element>
  );
};

MilestoneGroup.propTypes = propTypes;

export default MilestoneGroup;
