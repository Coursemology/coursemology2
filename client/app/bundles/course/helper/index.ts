import courseDefaultLogoUrl from 'assets/images/course-default-logo.svg?url';
import courseUserInvitationTemplateEnUrl from 'assets/templates/course-user-invitation-template-en.csv?url';
import courseUserInvitationTemplateEnNoTimelineUrl from 'assets/templates/course-user-invitation-template-en-no-timeline.csv?url';
import courseUserInvitationTemplateKoUrl from 'assets/templates/course-user-invitation-template-ko.csv?url';
import courseUserInvitationTemplateKoNoTimelineUrl from 'assets/templates/course-user-invitation-template-ko-no-timeline.csv?url';
import courseUserInvitationTemplateZhUrl from 'assets/templates/course-user-invitation-template-zh.csv?url';
import courseUserInvitationTemplateZhNoTimelineUrl from 'assets/templates/course-user-invitation-template-zh-no-timeline.csv?url';

export const getCourseLogoUrl = (url?: string | null): string => {
  if (!url) {
    return courseDefaultLogoUrl;
  }
  return url;
};

const TEMPLATE_MAP: Record<string, Record<string, string>> = {
  en: {
    timeline: courseUserInvitationTemplateEnUrl,
    noTimeline: courseUserInvitationTemplateEnNoTimelineUrl,
  },
  zh: {
    timeline: courseUserInvitationTemplateZhUrl,
    noTimeline: courseUserInvitationTemplateZhNoTimelineUrl,
  },
  ko: {
    timeline: courseUserInvitationTemplateKoUrl,
    noTimeline: courseUserInvitationTemplateKoNoTimelineUrl,
  },
};

export const getCourseUserInviteTemplatePath = (
  hasPersonalTimelines: boolean,
  locale?: string,
): string => {
  const normalizedLocale = locale?.split('-')[0] ?? 'en';
  const localeMap = TEMPLATE_MAP[normalizedLocale] ?? TEMPLATE_MAP.en;
  return hasPersonalTimelines ? localeMap.timeline : localeMap.noTimeline;
};
