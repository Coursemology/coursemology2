import courseDefaultLogoUrl from 'assets/images/course-default-logo.svg?url';
import courseUserInvitationTemplateUrl from 'assets/templates/course-user-invitation-template.csv?url';
import courseUserInvitationTemplateNoTimelineUrl from 'assets/templates/course-user-invitation-template-no-timeline.csv?url';

export const getCourseLogoUrl = (url?: string | null): string => {
  if (!url) {
    return courseDefaultLogoUrl;
  }
  return url;
};

export const getCourseUserInviteTemplatePath = (
  hasPersonalTimelines: boolean,
): string => {
  return hasPersonalTimelines
    ? courseUserInvitationTemplateUrl
    : courseUserInvitationTemplateNoTimelineUrl;
};
