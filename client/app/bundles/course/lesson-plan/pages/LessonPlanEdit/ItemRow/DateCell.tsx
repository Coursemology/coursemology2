import DateTimePicker from 'lib/components/core/fields/DateTimePicker';
import moment from 'lib/moment';

import {
  LessonPlanDate,
  LessonPlanItemUpdate,
  LessonPlanItemUpdateField,
} from '../../../types';

interface DateCellProps {
  fieldName: Exclude<LessonPlanItemUpdateField, 'published'>;
  fieldValue?: LessonPlanDate;
  startAt: LessonPlanDate;
  bonusEndAt?: LessonPlanDate;
  endAt?: LessonPlanDate;
  updateItem: (payload: LessonPlanItemUpdate) => void;
}

/**
 * Renders one datetime field of a lesson plan item. Changes are handed to
 * `updateItem`, which is responsible for coalescing and sending them — this
 * component deliberately does not talk to the server itself.
 */
const DateCell = (props: DateCellProps): JSX.Element => {
  const { fieldName, fieldValue, startAt, bonusEndAt, endAt, updateItem } =
    props;

  /**
   * Reports a new value for this field. If it is start_at that is shifted, the
   * existing end dates are shifted by the same amount.
   */
  const updateItemDate = (_, newDate: Date | null): void => {
    const payload: LessonPlanItemUpdate = {
      [fieldName]: newDate ? moment(newDate).toISOString() : null,
    };

    if (startAt && fieldName === 'start_at' && newDate) {
      const timeShift = moment.duration(moment(newDate).diff(moment(startAt)));

      if (endAt) {
        payload.end_at = moment(endAt).add(timeShift).toISOString();
      }

      if (bonusEndAt) {
        payload.bonus_end_at = moment(bonusEndAt).add(timeShift).toISOString();
      }
    }

    updateItem(payload);
  };

  return (
    <td>
      <DateTimePicker
        name={fieldName}
        onChange={updateItemDate}
        value={fieldValue}
      />
    </td>
  );
};

export default DateCell;
