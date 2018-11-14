import React from 'react';
import PropTypes from 'prop-types';
import moment from 'lib/moment';
import DateTimePicker from 'lib/components/form/DateTimePicker';

const sameDate = (a, b) => (!a && !b) || (a && b && moment(a).isSame(b, 'minute'));
const datePropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.instanceOf(Date),
]);

class DateCell extends React.Component {
  static propTypes = {
    fieldValue: datePropType,
    fieldName: PropTypes.string.isRequired,
    startAt: datePropType.isRequired,
    endAt: datePropType,
    bonusEndAt: datePropType,
    updateItem: PropTypes.func.isRequired,

  }

  /**
   * Updates a date value for a lesson plan item if the date has changed.
   * If it is start_at that is shifted, shift existing end dates by the same amount.
   */
  updateItemDate = (_, newDate) => {
    const {
      fieldValue: oldDate, fieldName, updateItem,
      startAt, endAt, bonusEndAt,
    } = this.props;

    if (sameDate(oldDate, newDate)) { return; }

    const payload = { [fieldName]: moment(newDate).toISOString() };
    if (startAt && fieldName === 'start_at') {
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
    updateItem(payload);
  }

  render() {
    const { fieldName, fieldValue } = this.props;
    return (
      <td>
        <DateTimePicker
          name={fieldName}
          clearable={fieldName === 'end_at'}
          value={fieldValue}
          onChange={this.updateItemDate}
        />
      </td>
    );
  }
}


export default DateCell;
