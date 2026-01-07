import { defineMessages, MessageDescriptor } from 'react-intl';

import { MessageTranslator } from 'lib/hooks/useTranslation';

const translations = defineMessages({
  admin_duplication: {
    id: 'course.courses.SidebarItem.admin.duplication',
    defaultMessage: 'Duplicate Data',
  },
  admin_multiple_reference_timelines: {
    id: 'course.courses.SidebarItem.admin.multipleReferenceTimelines',
    defaultMessage: 'Timeline Designer',
  },
  admin_plagiarism: {
    id: 'course.courses.SidebarItem.admin.plagiarism',
    defaultMessage: 'Plagiarism Check',
  },
  admin_scholaistic_assistants: {
    id: 'course.courses.SidebarItem.admin.scholaistic.assistants',
    defaultMessage: 'Assistants',
  },
  admin_settings: {
    id: 'course.courses.SidebarItem.admin.settings',
    defaultMessage: 'Course Settings',
  },
  admin_settings_component_settings: {
    id: 'course.courses.SidebarItem.admin.settings.components',
    defaultMessage: 'Components',
  },
  admin_settings_general: {
    id: 'course.courses.SidebarItem.admin.settings.general',
    defaultMessage: 'General',
  },
  admin_settings_notifications: {
    id: 'course.courses.SidebarItem.admin.settings.notifications',
    defaultMessage: 'Email',
  },
  admin_settings_sidebar_settings: {
    id: 'course.courses.SidebarItem.admin.settings.sidebar',
    defaultMessage: 'Sidebar',
  },
  admin_users_manage_users: {
    id: 'course.courses.SidebarItem.admin.users.manageUsers',
    defaultMessage: 'Manage Users',
  },
  course_achievements_component: {
    id: 'course.componentTitles.course_achievements_component',
    defaultMessage: 'Achievements',
  },
  course_announcements_component: {
    id: 'course.componentTitles.course_announcements_component',
    defaultMessage: 'Announcements',
  },
  course_assessments_component: {
    id: 'course.componentTitles.course_assessments_component',
    defaultMessage: 'Assessments',
  },
  course_codaveri_component: {
    id: 'course.componentTitles.course_codaveri_component',
    defaultMessage: 'Codaveri Evaluation and Feedback',
  },
  course_discussion_topics_component: {
    id: 'course.componentTitles.course_discussion_topics_component',
    defaultMessage: 'Comments Center',
  },
  course_duplication_component: {
    id: 'course.componentTitles.course_duplication_component',
    defaultMessage: 'Duplication',
  },
  course_experience_points_component: {
    id: 'course.componentTitles.course_experience_points_component',
    defaultMessage: 'Experience Points',
  },
  course_forums_component: {
    id: 'course.componentTitles.course_forums_component',
    defaultMessage: 'Forums',
  },
  course_groups_component: {
    id: 'course.componentTitles.course_groups_component',
    defaultMessage: 'Groups',
  },
  course_koditsu_platform_component: {
    id: 'course.componentTitles.course_koditsu_platform_component',
    defaultMessage: 'Koditsu Exam',
  },
  course_leaderboard_component: {
    id: 'course.componentTitles.course_leaderboard_component',
    defaultMessage: 'Leaderboard',
  },
  course_learning_map_component: {
    id: 'course.componentTitles.course_learning_map_component',
    defaultMessage: 'Learning Map',
  },
  course_lesson_plan_component: {
    id: 'course.componentTitles.course_lesson_plan_component',
    defaultMessage: 'Lesson Plan',
  },
  course_levels_component: {
    id: 'course.componentTitles.course_levels_component',
    defaultMessage: 'Levels',
  },
  course_materials_component: {
    id: 'course.componentTitles.course_materials_component',
    defaultMessage: 'Materials',
  },
  course_monitoring_component: {
    id: 'course.componentTitles.course_monitoring_component',
    defaultMessage: 'Heartbeat Monitoring for Exams',
  },
  course_multiple_reference_timelines_component: {
    id: 'course.componentTitles.course_multiple_reference_timelines_component',
    defaultMessage: 'Multiple Reference Timelines',
  },
  course_plagiarism_component: {
    id: 'course.componentTitles.course_plagiarism_component',
    defaultMessage: 'SSID Plagiarism Check',
  },
  course_rag_wise_component: {
    id: 'course.componentTitles.course_rag_wise_component',
    defaultMessage: 'RagWise Auto Forum Response',
  },
  course_scholaistic_component: {
    id: 'course.componentTitles.course_scholaistic_component',
    defaultMessage: 'Role-Playing Chatbots & Assessments',
  },
  course_settings_component: {
    id: 'course.componentTitles.course_settings_component',
    defaultMessage: 'Settings',
  },
  course_statistics_component: {
    id: 'course.componentTitles.course_statistics_component',
    defaultMessage: 'Statistics',
  },
  course_stories_component: {
    id: 'course.componentTitles.course_stories_component',
    defaultMessage: 'Stories',
  },
  course_survey_component: {
    id: 'course.componentTitles.course_survey_component',
    defaultMessage: 'Surveys',
  },
  course_users_component: {
    id: 'course.componentTitles.course_users_component',
    defaultMessage: 'Users',
  },
  course_videos_component: {
    id: 'course.componentTitles.course_videos_component',
    defaultMessage: 'Videos',
  },
  sidebar_assessments_skills: {
    id: 'course.courses.SidebarItem.assessmentSkills',
    defaultMessage: 'Skills',
  },
  sidebar_assessments_submissions: {
    id: 'course.courses.SidebarItem.assessmentSubmissions',
    defaultMessage: 'Submissions',
  },
  sidebar_discussion_topics: {
    id: 'course.courses.SidebarItem.discussionTopics',
    defaultMessage: 'Comments',
  },
  sidebar_experience_points: {
    id: 'course.courses.SidebarItem.experiencePoints',
    defaultMessage: 'Experience Points',
  },
  sidebar_home: {
    id: 'course.courses.SidebarItem.home',
    defaultMessage: 'Home',
  },
  sidebar_scholaistic_assessments: {
    id: 'course.courses.SidebarItem.scholaistic.assessments',
    defaultMessage: 'Role-Playing Assessments',
  },
  sidebar_stories_learn: {
    id: 'course.courses.SidebarItem.stories.learn',
    defaultMessage: 'Learn',
  },
  sidebar_stories_mission_control: {
    id: 'course.courses.SidebarItem.stories.missionControl',
    defaultMessage: 'Mission Control',
  },
});

// Keys for main sidebar items (the ones students can see) cannot be changed,
// because the ordering of sidebar items for each course is saved in DB using these names.
const LegacySidebarItemKeyMapper: Record<string, MessageDescriptor> = {
  announcements: translations.course_announcements_component,
  achievements: translations.course_achievements_component,
  assessments_submissions: translations.sidebar_assessments_submissions,
  discussion_topics: translations.sidebar_discussion_topics,
  forums: translations.course_forums_component,
  leaderboard: translations.course_leaderboard_component,
  learning_map: translations.course_learning_map_component,
  lesson_plan: translations.course_lesson_plan_component,
  materials: translations.course_materials_component,
  learn: translations.sidebar_stories_learn,
  scholaistic_assessments: translations.sidebar_scholaistic_assessments,
  surveys: translations.course_survey_component,
  users: translations.course_users_component,
  videos: translations.course_videos_component,
};

export const getComponentTranslationKey = (
  key?: string,
): MessageDescriptor | undefined => {
  if (!key) return undefined;
  if (translations[key]) return translations[key];
  if (LegacySidebarItemKeyMapper[key]) return LegacySidebarItemKeyMapper[key];
  return undefined;
};

export const getComponentTitle = (
  t: MessageTranslator,
  key?: string,
  definedTitle?: string,
): string | undefined => {
  if (definedTitle && definedTitle.length > 0) return definedTitle;

  const translationKey = getComponentTranslationKey(key);
  if (translationKey) return t(translationKey);
  return key;
};

export default translations;
