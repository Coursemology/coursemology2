import { defineMessages } from 'react-intl';

import { fields } from './constants';

const {
  ITEM_TYPE,
  TITLE,
  START_AT,
  BONUS_END_AT,
  END_AT,
  PUBLISHED,
  LOCATION,
  DESCRIPTION,
  EVENT_TYPE,
} = fields;

const translations = defineMessages({
  [ITEM_TYPE]: {
    id: 'course.lessonPlan.itemType',
    defaultMessage: 'Type',
  },
  [EVENT_TYPE]: {
    id: 'course.lessonPlan.eventType',
    defaultMessage: 'Event Type',
  },
  [TITLE]: {
    id: 'course.lessonPlan.title',
    defaultMessage: 'Title',
  },
  [DESCRIPTION]: {
    id: 'course.lessonPlan.description',
    defaultMessage: 'Description',
  },
  [LOCATION]: {
    id: 'course.lessonPlan.location',
    defaultMessage: 'Location',
  },
  [START_AT]: {
    id: 'course.lessonPlan.startAt',
    defaultMessage: 'Start At *',
  },
  [BONUS_END_AT]: {
    id: 'course.lessonPlan.bonusEndAt',
    defaultMessage: 'Bonus End At',
  },
  [END_AT]: {
    id: 'course.lessonPlan.endAt',
    defaultMessage: 'End At',
  },
  [PUBLISHED]: {
    id: 'course.lessonPlan.published',
    defaultMessage: 'Published',
  },
  lessonPlan: {
    id: 'course.lessonPlan.LessonPlanLayout.lessonPlan',
    defaultMessage: 'Lesson Plan',
  },
  editLessonPlan: {
    id: 'course.lessonPlan.LessonPlanLayout.editLessonPlan',
    defaultMessage: 'Edit Lesson Plan',
  },
  empty: {
    id: 'course.lessonPlan.LessonPlanLayout.empty',
    defaultMessage: 'The lesson plan is empty.',
  },
});

export default translations;
