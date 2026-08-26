import { memo, useEffect, useRef, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Element } from 'react-scroll';

import { setNotification } from 'lib/actions';
import DateTimePicker from 'lib/components/core/fields/DateTimePicker';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import { useDebounce } from 'lib/hooks/useDebounce';
import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';

import { updateMilestone } from '../../operations';
import { LessonPlanDate } from '../../types';

const translations = defineMessages({
  updateSuccess: {
    id: 'course.lessonPlan.LessonPlanEdit.MilestoneRow.updateSuccess',
    defaultMessage: '"{title}" was updated.',
  },
  updateFailed: {
    id: 'course.lessonPlan.LessonPlanEdit.MilestoneRow.updateFailed',
    defaultMessage: 'Failed to update milestone date.',
  },
});

const sameDate = (a?: LessonPlanDate, b?: LessonPlanDate): boolean =>
  Boolean((!a && !b) || (a && b && moment(a).isSame(b, 'minute')));

type SetError = (...args: never[]) => void;

interface PendingUpdate {
  startAt: Date;
  setError?: SetError;
}

interface MilestoneRowProps {
  id: number;
  groupId: string;
  title: string;
  startAt: LessonPlanDate;
}

const MilestoneRow = (props: MilestoneRowProps): JSX.Element => {
  const { id, groupId, title, startAt } = props;

  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const columnsVisible = useAppSelector(
    (state) => state.lessonPlan.flags.editPageColumnsVisible,
  );

  // See ItemRow: the edit is diffed against the saved value when it is flushed,
  // and only one request per row may be in flight at a time.
  const pendingRef = useRef<PendingUpdate | null>(null);
  const inFlightRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);

  // Mirrored so the debounced call always runs the newest closure: it is
  // created once, and needs the props as they are when it fires rather than
  // when it was made.
  const flushRef = useRef<() => void>(() => {});

  const flush = (): void => {
    if (inFlightRef.current) return;

    const pending = pendingRef.current;
    pendingRef.current = null;

    if (!pending || sameDate(startAt, pending.startAt)) {
      setSaving(false);
      return;
    }

    inFlightRef.current = true;
    dispatch(
      updateMilestone(id, { start_at: pending.startAt }, pending.setError),
    ).then((succeeded) => {
      inFlightRef.current = false;

      // A newer edit is already queued, so let it give the verdict instead.
      const superseded = Boolean(pendingRef.current);

      if (succeeded) {
        dispatch(setNotification(t(translations.updateSuccess, { title })));
      } else if (!superseded) {
        setRevision((current) => current + 1);
        dispatch(setNotification(t(translations.updateFailed)));
      }

      if (superseded) {
        flushRef.current();
      } else {
        setSaving(false);
      }
    });
  };

  useEffect(() => {
    flushRef.current = flush;
  });

  const debouncedFlush = useDebounce(
    () => flushRef.current(),
    FIELD_LONG_DEBOUNCE_DELAY_MS,
    [],
  );

  const updateMilestoneStartAt = (
    _,
    newDate: Date | null,
    setError?: SetError,
  ): void => {
    // `start_at` is required server-side, so an empty field is a transient state
    // while the date is retyped rather than an edit worth sending.
    if (!newDate) return;

    const settled = !inFlightRef.current && !pendingRef.current;
    if (settled && sameDate(startAt, newDate)) return;

    pendingRef.current = { startAt: newDate, setError };
    setSaving(true);
    debouncedFlush();
  };

  return (
    <tr>
      <td colSpan={columnsVisible.ITEM_TYPE ? 2 : 1}>
        <h3>
          <div className="flex items-center gap-2">
            <Element name={groupId}>{title}</Element>
            {saving ? <LoadingIndicator size={20} /> : null}
          </div>
        </h3>
      </td>
      {columnsVisible.START_AT ? (
        <td>
          <DateTimePicker
            key={revision}
            name="start_at"
            onChange={updateMilestoneStartAt}
            value={startAt}
          />
        </td>
      ) : null}
      {columnsVisible.BONUS_END_AT ? <td /> : null}
      {columnsVisible.END_AT ? <td /> : null}
      {columnsVisible.PUBLISHED ? <td /> : null}
    </tr>
  );
};

// Memoised to match what `connect` used to provide: a row renders up to three
// MUI date pickers, so re-rendering every row on an unrelated parent render is
// expensive.
export default memo(MilestoneRow);
