import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { scroller } from 'react-scroll';
import moment from 'lib/moment';
import LessonPlanGroup from './LessonPlanGroup';

class LessonPlanShow extends React.Component {
  static propTypes = {
    groups: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      milestone: PropTypes.object,
      items: PropTypes.array,
    })).isRequired,
    visibility: PropTypes.shape({}).isRequired,
    milestonesExpanded: PropTypes.string,
  }

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
      current: currentGroupId ? (id === currentGroupId) : true,
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
      <div>
        { this.props.groups.map(group => this.renderGroup(group)) }
      </div>
    );
  }
}

export const UnconnectedLessonPlanShow = LessonPlanShow;
export default connect(state => ({
  groups: state.lessonPlan.groups,
  visibility: state.lessonPlan.visibilityByType,
  milestonesExpanded: state.flags.milestonesExpanded,
}))(LessonPlanShow);
