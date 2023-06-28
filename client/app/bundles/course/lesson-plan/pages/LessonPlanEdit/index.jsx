import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Page from 'lib/components/core/layouts/Page';
import { getCourseId } from 'lib/helpers/url-helpers';
import { lessonPlanTypesGroups } from 'lib/types';

import { fields } from '../../constants';
import ColumnVisibilityDropdown from '../../containers/ColumnVisibilityDropdown';
import NewEventButton from '../../containers/LessonPlanLayout/NewEventButton';
import NewMilestoneButton from '../../containers/LessonPlanLayout/NewMilestoneButton';
import translations from '../../translations';

import ItemRow from './ItemRow';
import MilestoneRow from './MilestoneRow';

const { ITEM_TYPE, TITLE, START_AT, BONUS_END_AT, END_AT, PUBLISHED } = fields;

export class LessonPlanEdit extends Component {
  // eslint-disable-next-line class-methods-use-this
  renderGroup = (group) => {
    const { id, milestone, items } = group;

    const rows = items
      ? items.map((item) => (
          <ItemRow
            key={item.id}
            bonusEndAt={item.bonus_end_at}
            endAt={item.end_at}
            id={item.id}
            itemPath={item.item_path}
            published={item.published}
            startAt={item.start_at}
            title={item.title}
            type={item.itemTypeKey}
          />
        ))
      : [];

    if (milestone) {
      rows.unshift(
        <MilestoneRow
          key={`milestone-${id}`}
          groupId={id}
          id={milestone.id}
          startAt={milestone.start_at}
          title={milestone.title}
        />,
      );
    }

    return rows;
  };

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
    const courseId = getCourseId();

    return (
      <Page
        actions={
          this.props.canManageLessonPlan && (
            <div className="space-x-4">
              <NewMilestoneButton />
              <NewEventButton />
              <ColumnVisibilityDropdown />
            </div>
          )
        }
        backTo={`/courses/${courseId}/lesson_plan`}
        title={<FormattedMessage {...translations.editLessonPlan} />}
      >
        <div className="mt-8">
          <table className="border-separate border-spacing-x-4">
            {this.renderTableHeader()}
            <tbody>{groups.map(this.renderGroup)}</tbody>
          </table>
        </div>
      </Page>
    );
  }
}

LessonPlanEdit.propTypes = {
  groups: lessonPlanTypesGroups.isRequired,
  columnsVisible: PropTypes.shape({}).isRequired,
  canManageLessonPlan: PropTypes.bool.isRequired,
};

export default connect(({ lessonPlan }) => ({
  groups: lessonPlan.lessonPlan.groups,
  columnsVisible: lessonPlan.flags.editPageColumnsVisible,
  canManageLessonPlan: lessonPlan.flags.canManageLessonPlan,
}))(LessonPlanEdit);
