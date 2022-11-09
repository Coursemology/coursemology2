import { Component } from 'react';
import { connect } from 'react-redux';
import { scroller } from 'react-scroll';
import { Card, CardContent } from '@mui/material';
import PropTypes from 'prop-types';

import EnterEditModeButton from 'course/lesson-plan/containers/LessonPlanLayout/EnterEditModeButton';
import NewEventButton from 'course/lesson-plan/containers/LessonPlanLayout/NewEventButton';
import NewMilestoneButton from 'course/lesson-plan/containers/LessonPlanLayout/NewMilestoneButton';
import moment from 'lib/moment';
import { lessonPlanTypesGroups } from 'lib/types';

import LessonPlanGroup from './LessonPlanGroup';

class LessonPlanShow extends Component {
  /**
   * Searches for the last milestone that has just passed.
   * The current group contains that milestone and the items that come after that milestone,
   * but before the next one.
   *
   * @return {String} id of the current group
   * @return {Null} if no milestones have passed yet
   */
  static currentGroupId(groups) {
    let currentGroupId = null;
    groups.some((group) => {
      if (
        !group.milestone ||
        moment(group.milestone.start_at).isSameOrBefore()
      ) {
        currentGroupId = group.id;
        return false;
      }
      return true;
    });
    return currentGroupId;
  }

  constructor(props) {
    super(props);
    this.state = {
      currentGroupId: LessonPlanShow.currentGroupId(props.groups),
    };
  }

  componentDidMount() {
    if (this.state.currentGroupId) {
      scroller.scrollTo(this.state.currentGroupId, {
        duration: 200,
        delay: 100,
        smooth: true,
        offset: -100,
      });
    }
  }

  renderGroup(group) {
    const { visibility, milestonesExpanded } = this.props;
    const { currentGroupId } = this.state;
    const { id, items } = group;

    const visibleItems = items.filter((item) => visibility[item.itemTypeKey]);
    const initiallyExpanded = {
      current: currentGroupId ? id === currentGroupId : false,
      all: true,
      none: false,
    }[milestonesExpanded];

    return (
      <LessonPlanGroup
        key={id}
        group={{ ...group, items: visibleItems }}
        initiallyExpanded={
          initiallyExpanded === undefined ? true : initiallyExpanded
        }
      />
    );
  }

  // eslint-disable-next-line class-methods-use-this
  renderHeader = () => (
    <Card>
      <CardContent>
        <EnterEditModeButton />
        <NewMilestoneButton />
        <NewEventButton />
      </CardContent>
    </Card>
  );

  render() {
    return (
      <>
        {this.props.canManageLessonPlan && this.renderHeader()}
        {this.props.groups.map((group) => this.renderGroup(group))}
      </>
    );
  }
}

LessonPlanShow.propTypes = {
  groups: lessonPlanTypesGroups.isRequired,
  visibility: PropTypes.shape({}).isRequired,
  milestonesExpanded: PropTypes.string,
  canManageLessonPlan: PropTypes.bool.isRequired,
};

export const UnconnectedLessonPlanShow = LessonPlanShow;
export default connect((state) => ({
  groups: state.lessonPlan.groups,
  visibility: state.lessonPlan.visibilityByType,
  milestonesExpanded: state.flags.milestonesExpanded,
  canManageLessonPlan: state.flags.canManageLessonPlan,
}))(LessonPlanShow);
