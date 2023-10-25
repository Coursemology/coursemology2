import { defineMessages } from 'react-intl';

const translations = defineMessages({
  lessonPlanSettings: {
    id: 'course.admin.LessonPlanSettings.lessonPlanSettings',
    defaultMessage: 'Lesson Plan Settings',
  },
  lessonPlanItemSettings: {
    id: 'course.admin.LessonPlanSettings.lessonPlanItemSettings',
    defaultMessage: 'Item Settings',
  },
  lessonPlanAssessmentItemSettings: {
    id: 'course.admin.LessonPlanSettings.lessonPlanAssessmentItemSettings',
    defaultMessage: 'Assessment Item Settings',
  },
  lessonPlanComponentItemSettings: {
    id: 'course.admin.LessonPlanSettings.lessonPlanComponentItemSettings',
    defaultMessage: 'Component Item Settings',
  },
  assessmentCategory: {
    id: 'course.admin.LessonPlanSettings.assessmentCategory',
    defaultMessage: 'Assessment Category',
  },
  assessmentTab: {
    id: 'course.admin.LessonPlanSettings.assessmentTab',
    defaultMessage: 'Assessment Tab',
  },
  enabled: {
    id: 'course.admin.LessonPlanSettings.enabled',
    defaultMessage: 'Show on Lesson Plan',
  },
  visible: {
    id: 'course.admin.LessonPlanSettings.visible',
    defaultMessage: 'Visible by Default',
  },
  component: {
    id: 'course.admin.LessonPlanSettings.component',
    defaultMessage: 'Component',
  },
  updateSuccess: {
    id: 'course.admin.LessonPlanSettings.updateSuccess',
    defaultMessage: 'Setting for "{setting}" updated.',
  },
  updateFailure: {
    id: 'course.admin.LessonPlanSettings.updateFailure',
    defaultMessage: 'Failed to update setting for "{setting}".',
  },
  noLessonPlanItems: {
    id: 'course.admin.LessonPlanSettings.noLessonPlanItems',
    defaultMessage:
      'There are no lesson plan items to configure for lesson plan display.',
  },
});

export default translations;
