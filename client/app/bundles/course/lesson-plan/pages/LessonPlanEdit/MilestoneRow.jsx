import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Element } from 'react-scroll';
import moment from 'lib/moment';
import DateTimePicker from 'lib/components/form/DateTimePicker';
import { updateMilestone } from 'course/lesson-plan/actions';
import { fields } from 'course/lesson-plan/constants';

const translations = defineMessages({
  updateSuccess: {
    id: 'course.lessonPlan.LessonPlanEdit.MilestoneRow.updateSuccess',
    defaultMessage: "'{title}' was updated.",
  },
  updateFailed: {
    id: 'course.lessonPlan.LessonPlanEdit.MilestoneRow.updateFailed',
    defaultMessage: 'Failed to update milestone date.',
  },
});

const sameDate = (a, b) =>
  (!a && !b) || (a && b && moment(a).isSame(b, 'minute'));

class MilestoneRow extends React.Component {
  updateMilestoneStartAt = (_, newDate) => {
    const { id, title, startAt, dispatch } = this.props;
    if (sameDate(startAt, newDate)) {
      return;
    }

    const successMessage = (
      <FormattedMessage {...translations.updateSuccess} values={{ title }} />
    );
    const failureMessage = <FormattedMessage {...translations.updateFailed} />;
    dispatch(
      updateMilestone(id, { start_at: newDate }, successMessage, failureMessage)
    );
  };

  render() {
    const { title, startAt, groupId, columnsVisible } = this.props;

    return (
      <tr>
        <td colSpan={columnsVisible[fields.ITEM_TYPE] ? 2 : 1}>
          <h3>
            <Element name={groupId}>{title}</Element>
          </h3>
        </td>
        {columnsVisible[fields.START_AT] ? (
          <td>
            <DateTimePicker
              name="start_at"
              value={startAt}
              onChange={this.updateMilestoneStartAt}
            />
          </td>
        ) : null}
        {columnsVisible[fields.BONUS_END_AT] ? <td /> : null}
        {columnsVisible[fields.END_AT] ? <td /> : null}
        {columnsVisible[fields.PUBLISHED] ? <td /> : null}
      </tr>
    );
  }
}

MilestoneRow.propTypes = {
  id: PropTypes.number.isRequired,
  groupId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  startAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    .isRequired,
  columnsVisible: PropTypes.shape({}).isRequired,

  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => ({
  columnsVisible: state.flags.editPageColumnsVisible,
}))(MilestoneRow);
