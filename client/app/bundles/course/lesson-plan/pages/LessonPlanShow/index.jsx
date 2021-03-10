import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { scroller } from 'react-scroll';
import moment from 'lib/moment';
import { lessonPlanTypesGroups } from 'lib/types';
import LessonPlanGroup from './LessonPlanGroup';

class LessonPlanShow extends React.Component {
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
      if (!group.milestone || moment(group.milestone.start_at).isSameOrBefore()) {
        currentGroupId = group.id;
        return false;
      }
      return true;
    });
    return currentGroupId;
  }

  static propTypes = {
    groups: lessonPlanTypesGroups.isRequired,
    visibility: PropTypes.shape({}).isRequired,
    milestonesExpanded: PropTypes.string,
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

    const visibleItems = items.filter(item => visibility[item.itemTypeKey]);
    const initiallyExpanded = {
      current: currentGroupId ? (id === currentGroupId) : false,
      all: true,
      none: false,
    }[milestonesExpanded];

    return (
      <LessonPlanGroup
        key={id}
        initiallyExpanded={initiallyExpanded === undefined ? true : initiallyExpanded}
        group={{ ...group, items: visibleItems }}
      />
    );
  }

  render() {
    return (
      <>
        { this.props.groups.map(group => this.renderGroup(group)) }
      </>
    );
  }
}

export const UnconnectedLessonPlanShow = LessonPlanShow;
export default connect(state => ({
  groups: state.lessonPlan.groups,
  visibility: state.lessonPlan.visibilityByType,
  milestonesExpanded: state.flags.milestonesExpanded,
}))(LessonPlanShow);
