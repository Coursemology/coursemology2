import { useState } from 'react';

import DateTimePicker from 'lib/components/core/fields/DateTimePicker';
import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';
import formTranslations from 'lib/translations/form';

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

  const { t } = useTranslation();

  // Shown on this field until the user corrects it. While it is set, nothing has
  // been queued, so no request goes out and no debounce is running.
  const [error, setError] = useState<string | null>(null);

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

    // The server rejects an item whose start is after its end, so the edit is
    // held here instead of being sent and bounced. The pair is checked as the
    // edit would leave it: `undefined` means this edit does not touch the field,
    // whereas `null` means it is being cleared.
    const resultingStart =
      payload.start_at !== undefined ? payload.start_at : startAt;
    const resultingEnd = payload.end_at !== undefined ? payload.end_at : endAt;

    if (
      resultingStart &&
      resultingEnd &&
      moment(resultingEnd).isBefore(resultingStart)
    ) {
      setError(t(formTranslations.startEndDateValidationError));
      return;
    }

    setError(null);
    updateItem(payload);
  };

  return (
    <td>
      <DateTimePicker
        errorText={error ?? undefined}
        name={fieldName}
        onChange={updateItemDate}
        value={fieldValue}
      />
    </td>
  );
};

export default DateCell;
