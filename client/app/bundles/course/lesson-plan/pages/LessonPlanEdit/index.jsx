import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Card, CardContent } from '@mui/material';
import translations from 'course/lesson-plan/translations';
import { fields } from 'course/lesson-plan/constants';
import { lessonPlanTypesGroups } from 'lib/types';
import ColumnVisibilityDropdown from 'course/lesson-plan/containers/ColumnVisibilityDropdown';
import ExitEditModeButton from 'course/lesson-plan/containers/LessonPlanLayout/ExitEditModeButton';
import NewMilestoneButton from 'course/lesson-plan/containers/LessonPlanLayout/NewMilestoneButton';
import NewEventButton from 'course/lesson-plan/containers/LessonPlanLayout/NewEventButton';
import MilestoneRow from './MilestoneRow';
import ItemRow from './ItemRow';

const { ITEM_TYPE, TITLE, START_AT, BONUS_END_AT, END_AT, PUBLISHED } = fields;

const styles = {
  page: {
    marginTop: 30,
  },
};

class LessonPlanEdit extends Component {
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
        />,
      );
    }

    return rows;
  };

  renderHeader = () => (
    <Card>
      <CardContent>
        <ExitEditModeButton />
        <NewMilestoneButton />
        <NewEventButton />
        <ColumnVisibilityDropdown />
      </CardContent>
    </Card>
  );

  renderTableHeader() {
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

  render() {
    const { groups } = this.props;

    return (
      <>
        {this.props.canManageLessonPlan && this.renderHeader()}
        <div style={styles.page}>
          <table>
            {this.renderTableHeader()}
            <tbody>{groups.map(this.renderGroup)}</tbody>
          </table>
        </div>
      </>
    );
  }
}

LessonPlanEdit.propTypes = {
  groups: lessonPlanTypesGroups.isRequired,
  columnsVisible: PropTypes.shape({}).isRequired,
  canManageLessonPlan: PropTypes.bool.isRequired,
};

export default connect((state) => ({
  groups: state.lessonPlan.groups,
  columnsVisible: state.flags.editPageColumnsVisible,
  canManageLessonPlan: state.flags.canManageLessonPlan,
}))(LessonPlanEdit);
