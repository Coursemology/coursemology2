import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import translations from 'course/lesson-plan/translations';
import { fields } from 'course/lesson-plan/constants';
import { lessonPlanTypesGroups } from 'lib/types';
import MilestoneRow from './MilestoneRow';
import ItemRow from './ItemRow';

const { ITEM_TYPE, TITLE, START_AT, BONUS_END_AT, END_AT, PUBLISHED } = fields;

const styles = {
  page: {
    marginTop: 30,
  },
};

class LessonPlanEdit extends React.Component {
  renderHeader() {
    const { columnsVisible } = this.props;

    const headerFor = (field) => (
      <th>
        <FormattedMessage {...translations[field]} />
      </th>
    );
    return (
      <thead>
        <tr>
          {columnsVisible[ITEM_TYPE] ? headerFor(ITEM_TYPE) : null}
          {headerFor(TITLE)}
          {columnsVisible[START_AT] ? headerFor(START_AT) : null}
          {columnsVisible[BONUS_END_AT] ? headerFor(BONUS_END_AT) : null}
          {columnsVisible[END_AT] ? headerFor(END_AT) : null}
          {columnsVisible[PUBLISHED] ? headerFor(PUBLISHED) : null}
        </tr>
      </thead>
    );
  }

  renderGroup = (group) => {
    const { id, milestone, items } = group;

    const rows = items
      ? items.map((item) => (
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
        ))
      : [];

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
  };

  render() {
    const { groups } = this.props;

    return (
      <div style={styles.page}>
        <table>
          {this.renderHeader()}
          <tbody>{groups.map(this.renderGroup)}</tbody>
        </table>
      </div>
    );
  }
}

LessonPlanEdit.propTypes = {
  groups: lessonPlanTypesGroups.isRequired,
  columnsVisible: PropTypes.shape({}).isRequired,
};

export default connect((state) => ({
  groups: state.lessonPlan.groups,
  columnsVisible: state.flags.editPageColumnsVisible,
}))(LessonPlanEdit);
