import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import translations from 'course/lesson-plan/translations';
import MilestoneRow from './MilestoneRow';
import ItemRow from './ItemRow';

const styles = {
  page: {
    marginTop: 30,
  },
};

class LessonPlanEdit extends React.Component {
  static propTypes = {
    groups: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      milestone: PropTypes.object,
      items: PropTypes.array,
    })).isRequired,
  }

  static renderHeader() {
    const headerFor = field => <th><FormattedMessage {...translations[field]} /></th>;
    return (
      <thead>
        <tr>
          {headerFor('type')}
          {headerFor('title')}
          {headerFor('startAt')}
          {headerFor('bonusEndAt')}
          {headerFor('endAt')}
          {headerFor('published')}
        </tr>
      </thead>
    );
  }

  renderGroup = (group) => {
    const { id, milestone, items } = group;

    const rows = items ? items.map(item => (
      <ItemRow
        key={item.id}
        id={item.id}
        type={item.itemTypeKey}
        title={item.title}
        startAt={item.start_at}
        bonusEndAt={item.bonus_end_at}
        endAt={item.end_at}
        published={item.published}
        itemPath={item.item_path}
      />
    )) : [];

    if (milestone) {
      rows.unshift(
        <MilestoneRow
          key={`milestone-${id}`}
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
      <div style={styles.page}>
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
  groups: state.lessonPlan.groups,
}))(LessonPlanEdit);
