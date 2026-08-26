import { memo, useEffect, useRef, useState } from 'react';
import { defineMessages } from 'react-intl';

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

  // Changes queued but not yet sent. Merged so that editing several fields of the
  // same row results in one request rather than one per field.
  const pendingRef = useRef<LessonPlanItemUpdate>({});
  // The latest value we know for each field, whether or not it has been saved yet.
  // Guards against re-sending a value the user has already queued.
  const latestValuesRef = useRef<LessonPlanItemUpdate>({});
  // At most one request per row may be in flight.
  const inFlightRef = useRef(false);
  const [saving, setSaving] = useState(false);

  const flush = (context: SaveContext): void => {
    if (inFlightRef.current) return;

    const payload = pendingRef.current;
    pendingRef.current = {};

    if (Object.keys(payload).length === 0) {
      setSaving(false);
      return;
    }

    const successMessage = context.t(translations.updateSuccess, {
      title: context.title,
    });
    const failureMessage = context.t(translations.updateFailed, {
      title: context.title,
    });

    inFlightRef.current = true;
    context
      .dispatch(updateItem(context.id, payload, successMessage, failureMessage))
      .finally(() => {
        inFlightRef.current = false;
        if (Object.keys(pendingRef.current).length > 0) {
          flush(context);
        } else {
          setSaving(false);
        }
      });
  };

  const debouncedFlush = useDebounce(flush, FIELD_LONG_DEBOUNCE_DELAY_MS, []);

  const queueUpdate = (payload: LessonPlanItemUpdate): void => {
    const savedValues: Record<LessonPlanItemUpdateField, unknown> = {
      start_at: startAt,
      bonus_end_at: bonusEndAt,
      end_at: endAt,
      published,
    };

    const changes = Object.entries(payload).reduce<LessonPlanItemUpdate>(
      (acc, [field, value]) => {
        const key = field as LessonPlanItemUpdateField;
        if (REQUIRED_FIELDS.includes(key) && !value) return acc;

        const latest =
          key in latestValuesRef.current
            ? latestValuesRef.current[key]
            : (savedValues[key] as ItemValue);
        if (sameValue(latest, value)) return acc;
        return { ...acc, [key]: value };
      },
      {},
    );

    if (Object.keys(changes).length === 0) return;

    latestValuesRef.current = { ...latestValuesRef.current, ...changes };
    pendingRef.current = { ...pendingRef.current, ...changes };
    setSaving(true);
    debouncedFlush({ id, title, dispatch, t });
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
      {columnsVisible['ITEM_TYPE'] ? (
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
      {columnsVisible['START_AT'] ? (
        <DateCell fieldName="start_at" fieldValue={startAt} {...dateProps} />
      ) : null}
      {columnsVisible['BONUS_END_AT'] ? (
        <DateCell
          fieldName="bonus_end_at"
          fieldValue={bonusEndAt}
          {...dateProps}
        />
      ) : null}
      {columnsVisible['END_AT'] ? (
        <DateCell fieldName="end_at" fieldValue={endAt} {...dateProps} />
      ) : null}
      {columnsVisible['PUBLISHED'] ? (
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
