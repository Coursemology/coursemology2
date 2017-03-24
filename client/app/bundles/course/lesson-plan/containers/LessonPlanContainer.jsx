import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import * as actionCreators from '../actions';
import lessonPlanItemTypeKey from '../utils';
import { constants } from '../constants';

const translations = defineMessages({
  priorItemsMilestoneTitle: {
    id: 'course.lessonPlan.lessonPlan.priorItemsMilestoneTitle',
    defaultMessage: 'Prior Items',
    description: 'Title for prior items milestones',
  },
});

const propTypes = {
  milestones: PropTypes.instanceOf(Immutable.List).isRequired,
  items: PropTypes.instanceOf(Immutable.List).isRequired,
  hiddenItemTypes: PropTypes.instanceOf(Immutable.List).isRequired,
  dispatch: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  children: PropTypes.element.isRequired,
};

function mapStateToProps(state) {
  return state.get('lessonPlan').toObject();
}

class LessonPlanContainer extends React.Component {
  /**
   * Groups lesson plan items with their respective milestones into 'milestone groups'
   * and sorts items according to their types within each milestone group.
   */
  milestoneGroups() {
    const { milestones, items, hiddenItemTypes, intl } = this.props;

    const MILESTONE_CLASS_NAME = 'Course::LessonPlan::Milestone';
    const isMilestone = elem => elem.get('lesson_plan_element_class') === MILESTONE_CLASS_NAME;

    // Filter away items that the user has hidden
    const visibleItems = items.filter((item) => {
      const type = lessonPlanItemTypeKey(item.get('lesson_plan_item_type'));
      return !hiddenItemTypes.includes(type);
    });

    // Combine milestones and visible items, then order them chronologically
    const sortedLessonPlanElements = milestones.concat(visibleItems)
      .map(elem => elem.merge({ start_at: Date.parse(elem.get('start_at')) }))
      .sortBy(elem => elem.get('start_at'));

    // Create a default milestone to hold items that precede the first milestone,
    // if one is needed.
    const seedGroup =
      sortedLessonPlanElements.isEmpty() || isMilestone(sortedLessonPlanElements.first()) ?
      [] :
      [{
        milestone: Immutable.fromJS({
          id: constants.PRIOR_ITEMS_MILESTONE,
          title: intl.formatMessage(translations.priorItemsMilestoneTitle),
          start_at: sortedLessonPlanElements.first().get('start_at'),
        }),
        items: [],
      }];

    // Reducer method that takes a flat array of milestones and items,
    // and chunks them into milestone groups.
    const groupItemsWithMilestones = (result, elem) => {
      if (isMilestone(elem)) {
        result.push({ milestone: elem, items: [] });
      } else {
        result[result.length - 1].items.push(elem);
      }
      return result;
    };

    // Build the sorted milestone groups
    const groups = sortedLessonPlanElements
      .reduce(groupItemsWithMilestones, seedGroup);

    return groups;
  }

  render() {
    const actions = bindActionCreators(actionCreators, this.props.dispatch);
    const childProps = {
      ...this.props,
      ...actions,
      milestoneGroups: this.milestoneGroups(),
    };

    return (React.cloneElement(this.props.children, childProps));
  }
}

LessonPlanContainer.propTypes = propTypes;

export default connect(mapStateToProps)(injectIntl(LessonPlanContainer));
