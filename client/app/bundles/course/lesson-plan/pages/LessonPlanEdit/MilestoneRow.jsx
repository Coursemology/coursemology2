import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Element } from 'react-scroll';
import moment from 'lib/moment';
import DateTimePicker from 'lib/components/form/DateTimePicker';
import { updateMilestone } from 'course/lesson-plan/actions';

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

const sameDate = (a, b) => (!a && !b) || (a && b && moment(a).isSame(b, 'minute'));

class MilestoneRow extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    groupId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    startAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]).isRequired,

    dispatch: PropTypes.func.isRequired,
  }

  updateMilestoneStartAt = (_, newDate) => {
    const { id, title, startAt, dispatch } = this.props;
    if (sameDate(startAt, newDate)) { return; }

    const successMessage = <FormattedMessage {...translations.updateSuccess} values={{ title }} />;
    const failureMessage = <FormattedMessage {...translations.updateFailed} />;
    dispatch(updateMilestone(id, { start_at: newDate }, successMessage, failureMessage));
  }

  render() {
    const { title, startAt, groupId } = this.props;

    return (
      <tr>
        <td colSpan={2}>
          <h3><Element name={groupId}>{ title }</Element></h3>
        </td>
        <td>
          <DateTimePicker
            name="start_at"
            value={startAt}
            onChange={this.updateMilestoneStartAt}
          />
        </td>
        <td />
        <td />
        <td />
      </tr>
    );
  }
}

export default connect()(MilestoneRow);
