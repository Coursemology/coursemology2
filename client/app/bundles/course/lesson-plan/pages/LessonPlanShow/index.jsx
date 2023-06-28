import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { scroller } from 'react-scroll';
import PropTypes from 'prop-types';

import Page from 'lib/components/core/layouts/Page';
import moment from 'lib/moment';
import { lessonPlanTypesGroups } from 'lib/types';

import EnterEditModeButton from '../../containers/LessonPlanLayout/EnterEditModeButton';
import NewEventButton from '../../containers/LessonPlanLayout/NewEventButton';
import NewMilestoneButton from '../../containers/LessonPlanLayout/NewMilestoneButton';
import translations from '../../translations';

import LessonPlanGroup from './LessonPlanGroup';

export class LessonPlanShow extends Component {
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

  render() {
    return (
      <Page
        actions={
          this.props.canManageLessonPlan && (
            <div className="space-x-4">
              <EnterEditModeButton />
              <NewMilestoneButton />
              <NewEventButton />
            </div>
          )
        }
        title={<FormattedMessage {...translations.lessonPlan} />}
      >
        {this.props.groups.map((group) => this.renderGroup(group))}
      </Page>
    );
  }
}

LessonPlanShow.propTypes = {
  groups: lessonPlanTypesGroups.isRequired,
  visibility: PropTypes.shape({}).isRequired,
  milestonesExpanded: PropTypes.string,
  canManageLessonPlan: PropTypes.bool.isRequired,
};

export default connect(({ lessonPlan }) => ({
  groups: lessonPlan.lessonPlan.groups,
  visibility: lessonPlan.lessonPlan.visibilityByType,
  milestonesExpanded: lessonPlan.flags.milestonesExpanded,
  canManageLessonPlan: lessonPlan.flags.canManageLessonPlan,
}))(LessonPlanShow);
