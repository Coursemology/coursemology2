import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Toggle from 'material-ui/Toggle';
import moment from 'lib/moment';
import DateTimePicker from 'lib/components/form/DateTimePicker';
import { updateItem } from 'course/lesson-plan/actions';

const translations = defineMessages({
  updateSuccess: {
    id: 'course.lessonPlan.LessonPlanEdit.ItemRow.updateSuccess',
    defaultMessage: "'{title}' was updated.",
  },
  updateFailed: {
    id: 'course.lessonPlan.LessonPlanEdit.ItemRow.updateFailed',
    defaultMessage: 'Failed to update {title}.',
  },
});

const sameDate = (a, b) => (!a && !b) || (a && b && moment(a).isSame(b, 'minute'));

class ItemRow extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    startAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]).isRequired,
    bonusEndAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    endAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    published: PropTypes.bool.isRequired,
    visibility: PropTypes.shape().isRequired,

    dispatch: PropTypes.func.isRequired,
  }

  updateItem = (payload) => {
    const { id, title, dispatch } = this.props;
    const successMessage = <FormattedMessage {...translations.updateSuccess} values={{ title }} />;
    const failureMessage = <FormattedMessage {...translations.updateFailed} values={{ title }} />;
    dispatch(updateItem(id, payload, successMessage, failureMessage));
  }

  /**
   * Updates a date value for a lesson plan item if the date has changed.
   * If it is start_at that is shifted, shift existing end dates by the same amount.
   */
  updateItemDate = (oldDate, fieldName) => (_, newDate) => {
    const { startAt } = this.props;
    if (sameDate(oldDate, newDate)) { return; }

    const payload = { [fieldName]: moment(newDate).toISOString() };
    if (startAt && fieldName === 'start_at') {
      const { endAt, bonusEndAt } = this.props;
      const timeShift = moment.duration(moment(newDate).diff(moment(startAt)));

      if (endAt) {
        const shiftedDate = moment(endAt);
        shiftedDate.add(timeShift);
        payload.end_at = shiftedDate.toISOString();
      }

      if (bonusEndAt) {
        const shiftedDate = moment(bonusEndAt);
        shiftedDate.add(timeShift);
        payload.bonus_end_at = shiftedDate.toISOString();
      }
    }
    this.updateItem(payload);
  }

  render() {
    const { type, title, startAt, bonusEndAt, endAt, published, visibility } = this.props;

    const isHidden = !visibility[type];
    if (isHidden) { return null; }

    return (
      <tr>
        <td>{ type }</td>
        <td>{ title }</td>
        <td>
          <DateTimePicker
            name="start_at"
            value={startAt}
            onChange={this.updateItemDate(startAt, 'start_at')}
          />
        </td>
        <td>
          <DateTimePicker
            name="bonus_end_at"
            value={bonusEndAt}
            onChange={this.updateItemDate(bonusEndAt, 'bonus_end_at')}
          />
        </td>
        <td>
          <DateTimePicker
            name="end_at"
            value={endAt}
            onChange={this.updateItemDate(startAt, 'end_at')}
          />
        </td>
        <td>
          <Toggle
            toggled={published}
            onToggle={(_, isToggled) => this.updateItem({ published: isToggled })}
          />
        </td>
      </tr>
    );
  }
}

export default connect(state => ({
  visibility: state.visibilityByType,
}))(ItemRow);
