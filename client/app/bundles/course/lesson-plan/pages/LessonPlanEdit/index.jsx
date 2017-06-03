import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import MilestoneRow from './MilestoneRow';
import ItemRow from './ItemRow';

const translations = defineMessages({
  type: {
    id: 'course.lessonPlan.LessonPlanEdit.type',
    defaultMessage: 'Type',
  },
  title: {
    id: 'course.lessonPlan.LessonPlanEdit.title',
    defaultMessage: 'Title',
  },
  startTime: {
    id: 'course.lessonPlan.LessonPlanEdit.startTime',
    defaultMessage: 'Start Time',
  },
  bonusEndTime: {
    id: 'course.lessonPlan.LessonPlanEdit.bonusEndTime',
    defaultMessage: 'Bonus End Time',
  },
  endTime: {
    id: 'course.lessonPlan.LessonPlanEdit.endTime',
    defaultMessage: 'End Time',
  },
  published: {
    id: 'course.lessonPlan.LessonPlanEdit.published',
    defaultMessage: 'Published',
  },
});

class LessonPlanEdit extends React.Component {
  static propTypes = {
    groups: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      milestone: PropTypes.object,
      items: PropTypes.array,
    })).isRequired,
  }

  static renderHeader() {
    const rowFor = field => <th><FormattedMessage {...translations[field]} /></th>;
    return (
      <thead>
        <tr>
          {rowFor('type')}
          {rowFor('title')}
          {rowFor('startTime')}
          {rowFor('bonusEndTime')}
          {rowFor('endTime')}
          {rowFor('published')}
        </tr>
      </thead>
    );
  }

  renderGroup = (group) => {
    const { id, milestone, items } = group;

    const rows = items ? items.map(item =>
      (<ItemRow
        id={item.id}
        type={item.itemTypeKey}
        title={item.title}
        startAt={item.start_at}
        bonusEndAt={item.bonus_end_at}
        endAt={item.end_at}
        published={item.published}
      />)
    ) : [];

    if (milestone) {
      rows.unshift(
        <MilestoneRow
          groupId={id}
          id={milestone.id}
          title={milestone.title}
          startAt={milestone.start_at}
        />
      );
    }

    return rows;
  }

  render() {
    const { groups } = this.props;

    return (
      <div>
        <table>
          { LessonPlanEdit.renderHeader() }
          <tbody>
            { groups.map(this.renderGroup) }
          </tbody>
        </table>
      </div>
    );
  }
}

export default connect(state => ({
  groups: state.groups,
}))(LessonPlanEdit);
