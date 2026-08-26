import { ReactNode } from 'react';
import { UseFormSetError } from 'react-hook-form';
import { AppDispatch } from 'store';

import { MessageTranslator } from 'lib/hooks/useTranslation';

/** A datetime as it arrives from the server, or as constructed by the pickers. */
export type LessonPlanDate = string | Date | null;

/**
 * A partial update to a lesson plan item. Dates are ISO strings, or `null` when
 * the field is being cleared.
 */
export interface LessonPlanItemUpdate {
  start_at?: string | null;
  bonus_end_at?: string | null;
  end_at?: string | null;
  published?: boolean;
}

export type LessonPlanItemUpdateField = keyof LessonPlanItemUpdate;

/**
 * A lesson plan item as the server serialises it: the fields common to every
 * item (see `_item.json.jbuilder`), plus the actable-specific ones these pages
 * read.
 *
 * There is no discriminant on the payload — `lesson_plan_item_type` is an array
 * of instructor-defined tab titles, not a type tag — so the actable-specific
 * fields are optional rather than a discriminated union.
 */
export interface LessonPlanItem {
  id: number;
  title: string;
  published: boolean;
  start_at: LessonPlanDate;
  bonus_end_at?: LessonPlanDate;
  end_at?: LessonPlanDate;
  lesson_plan_item_type?: string[];
  /** Derived client-side by `generateTypeKey`, not sent by the server. */
  itemTypeKey?: string;
  item_path?: string;
  eventId?: number;
  location?: string;
  description?: string;
}

/**
 * A lesson plan item that is a course event. Every field is optional, mirroring
 * the shape `AdminTools` accepted before the conversion: `id` is the lesson plan
 * item, `eventId` the event resource behind it.
 */
export interface LessonPlanEventItem {
  id?: number;
  eventId?: number;
  title?: string;
  published?: boolean;
  location?: string;
  description?: string;
  start_at?: LessonPlanDate;
  end_at?: LessonPlanDate;
  lesson_plan_item_type?: string[];
}

/** A milestone as the server sends it. */
export interface LessonPlanMilestone {
  id: number;
  title: string;
  description?: string | null;
  start_at?: LessonPlanDate;
}

/**
 * What the show page's admin tools receive. `LessonPlanGroup` synthesises an
 * "Ungrouped Items" placeholder with a null id and a translated element for a
 * title, and the tools hide themselves for it.
 */
export interface MilestoneOrPlaceholder {
  id?: number | null;
  title?: ReactNode;
  description?: string | null;
  start_at?: LessonPlanDate;
}

/** Values submitted by the milestone form. */
export interface MilestoneFormValues {
  title?: string;
  description?: string;
  start_at?: LessonPlanDate;
}

/** Values submitted by the event form. */
export interface EventFormValues {
  title?: string;
  event_type?: string;
  location?: string;
  description?: string;
  start_at?: LessonPlanDate;
  end_at?: LessonPlanDate;
  published?: boolean;
}

/**
 * A dialog's submit handler, supplied by whoever opens the dialog. Resolves to
 * whether the request succeeded, which is what tells the dialog to close itself.
 */
export type FormSubmitHandler<Values> = (
  values: Values,
  setError: UseFormSetError<Values & Record<string, unknown>>,
) => Promise<boolean>;

/**
 * What a queued request needs. Passed to the debounced flush as an argument so
 * that it never closes over props that may have moved on since the edit was
 * queued.
 */
export interface SaveContext {
  id: number;
  title: string;
  dispatch: AppDispatch;
  t: MessageTranslator;
}

/**
 * The parts of the lesson plan slice these pages read. The reducers are still
 * JavaScript, so `combineReducers` cannot infer their shape and selectors have
 * to assert it. Drop the assertions once the reducers are converted.
 */
export interface LessonPlanSliceState {
  visibilityByType: Record<string, boolean>;
  items: LessonPlanItem[];
  isLoading: boolean;
  groups: LessonPlanGroup[];
}

/** Items grouped under the milestone they fall after; see `groupItemsUnderMilestones`. */
export interface LessonPlanGroup {
  id: string;
  milestone: LessonPlanMilestone | null;
  items: LessonPlanItem[];
}

export interface LessonPlanFlagsState {
  canManageLessonPlan: boolean;
  editPageColumnsVisible: Record<string, boolean>;
}
