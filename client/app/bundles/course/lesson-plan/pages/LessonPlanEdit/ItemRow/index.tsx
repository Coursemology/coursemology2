import { memo, useEffect, useRef, useState } from 'react';
import { defineMessages } from 'react-intl';

import { setNotification } from 'lib/actions';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import { useDebounce } from 'lib/hooks/useDebounce';
import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';

import TranslatedItemType from '../../../containers/TranslatedItemType';
import { updateItem } from '../../../operations';
import {
  LessonPlanDate,
  LessonPlanItemUpdate,
  LessonPlanItemUpdateField,
} from '../../../types';

import DateCell from './DateCell';
import PublishedCell from './PublishedCell';

const translations = defineMessages({
  updateSuccess: {
    id: 'course.lessonPlan.LessonPlanEdit.ItemRow.updateSuccess',
    defaultMessage: '"{title}" was updated.',
  },
  updateFailed: {
    id: 'course.lessonPlan.LessonPlanEdit.ItemRow.updateFailed',
    defaultMessage: 'Failed to update {title}.',
  },
});

type ItemValue = LessonPlanItemUpdate[LessonPlanItemUpdateField];

// `start_at` is required server-side, so an empty field is a transient state
// while the instructor retypes the date rather than an edit worth sending. It is
// dropped here, leaving the item untouched until the field is valid again.
const REQUIRED_FIELDS: LessonPlanItemUpdateField[] = ['start_at'];

const sameValue = (
  a: ItemValue | LessonPlanDate | undefined,
  b: ItemValue | LessonPlanDate | undefined,
): boolean => {
  if (typeof a === 'boolean' || typeof b === 'boolean') return a === b;
  return Boolean((!a && !b) || (a && b && moment(a).isSame(b, 'minute')));
};

interface ItemRowProps {
  id: number;
  type: string;
  title: string;
  startAt: LessonPlanDate;
  bonusEndAt?: LessonPlanDate;
  endAt?: LessonPlanDate;
  published: boolean;
  itemPath?: string;
}

const ItemRow = (props: ItemRowProps): JSX.Element | null => {
  const { id, type, title, startAt, bonusEndAt, endAt, published, itemPath } =
    props;

  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  // A boolean rather than the whole map: the map gets a new identity whenever any
  // type is toggled, so selecting it would re-render every row on the page rather
  // than only the rows whose own type changed. An unknown type stays hidden, as
  // before.
  const isVisible = useAppSelector((state) =>
    Boolean(state.lessonPlan.lessonPlan.visibilityByType[type]),
  );
  const columnsVisible = useAppSelector(
    (state) => state.lessonPlan.flags.editPageColumnsVisible,
  );

  // Edits the user has made that have not been sent yet.
  const pendingRef = useRef<LessonPlanItemUpdate>({});
  // At most one request per row may be in flight.
  const inFlightRef = useRef(false);
  const [saving, setSaving] = useState(false);
  // Bumped to remount the pickers after a failed save, to put the saved values
  // back on screen: the store never changed, so nothing else would.
  const [revision, setRevision] = useState(0);

  const savedValues: Record<LessonPlanItemUpdateField, ItemValue> = {
    start_at: startAt as ItemValue,
    bonus_end_at: bonusEndAt as ItemValue,
    end_at: endAt as ItemValue,
    published,
  };

  /** The subset of `payload` that actually differs from what is saved. */
  const changedFromSaved = (
    payload: LessonPlanItemUpdate,
  ): LessonPlanItemUpdate =>
    Object.entries(payload).reduce<LessonPlanItemUpdate>(
      (acc, [field, value]) => {
        const key = field as LessonPlanItemUpdateField;
        if (sameValue(savedValues[key], value)) return acc;
        return { ...acc, [key]: value };
      },
      {},
    );

  // Mirrored so the debounced call always runs the newest closure: it is
  // created once, and needs the props as they are when it fires rather than
  // when it was made.
  const flushRef = useRef<() => void>(() => {});

  const flush = (): void => {
    if (inFlightRef.current) return;

    // Diffed here rather than when queued: an in-flight request may have moved
    // the saved state on since, and after a failure it will not have.
    const payload = changedFromSaved(pendingRef.current);
    pendingRef.current = {};

    if (Object.keys(payload).length === 0) {
      setSaving(false);
      return;
    }

    inFlightRef.current = true;
    dispatch(updateItem(id, payload)).then((succeeded) => {
      inFlightRef.current = false;

      // A newer edit is already queued, so let it give the verdict instead —
      // otherwise the user gets a failure followed by a success for one action.
      const superseded = Object.keys(pendingRef.current).length > 0;

      if (succeeded) {
        dispatch(setNotification(t(translations.updateSuccess, { title })));
      } else if (!superseded) {
        setRevision((current) => current + 1);
        dispatch(setNotification(t(translations.updateFailed, { title })));
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

  const queueUpdate = (payload: LessonPlanItemUpdate): void => {
    const changes = Object.entries(payload).reduce<LessonPlanItemUpdate>(
      (acc, [field, value]) => {
        const key = field as LessonPlanItemUpdateField;
        if (REQUIRED_FIELDS.includes(key) && !value) return acc;
        return { ...acc, [key]: value };
      },
      {},
    );

    if (Object.keys(changes).length === 0) return;

    // With nothing queued or in flight the saved values are current, so a no-op
    // can be dropped now rather than showing a spinner until the flush. While
    // either is outstanding the saved values may still move, so the flush decides.
    const settled =
      !inFlightRef.current && !Object.keys(pendingRef.current).length;
    if (settled && Object.keys(changedFromSaved(changes)).length === 0) return;

    pendingRef.current = { ...pendingRef.current, ...changes };
    setSaving(true);
    debouncedFlush();
  };

  const updatePublished = (_, isToggled: boolean): void =>
    queueUpdate({ published: isToggled });

  if (!isVisible) return null;

  const dateProps = {
    startAt,
    bonusEndAt,
    endAt,
    updateItem: queueUpdate,
  };

  return (
    <tr>
      {columnsVisible.ITEM_TYPE ? (
        <td>
          <TranslatedItemType type={type} />
        </td>
      ) : null}
      <td>
        <div className="flex items-center gap-2">
          <Link to={itemPath}>{title}</Link>
          {saving ? <LoadingIndicator size={20} /> : null}
        </div>
      </td>
      {columnsVisible.START_AT ? (
        <DateCell
          key={`start_at-${revision}`}
          fieldName="start_at"
          fieldValue={startAt}
          {...dateProps}
        />
      ) : null}
      {columnsVisible.BONUS_END_AT ? (
        <DateCell
          key={`bonus_end_at-${revision}`}
          fieldName="bonus_end_at"
          fieldValue={bonusEndAt}
          {...dateProps}
        />
      ) : null}
      {columnsVisible.END_AT ? (
        <DateCell
          key={`end_at-${revision}`}
          fieldName="end_at"
          fieldValue={endAt}
          {...dateProps}
        />
      ) : null}
      {columnsVisible.PUBLISHED ? (
        <PublishedCell
          disabled={saving}
          onToggle={updatePublished}
          published={published}
        />
      ) : null}
    </tr>
  );
};

// Memoised to match what `connect` used to provide: a row renders up to three
// MUI date pickers, so re-rendering every row on an unrelated parent render is
// expensive.
export default memo(ItemRow);
