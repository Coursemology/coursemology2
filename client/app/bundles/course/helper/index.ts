import courseDefaultLogoUrl from 'assets/images/course-default-logo.svg?url';
import courseUserInvitationTemplateUrl from 'assets/templates/course-user-invitation-template.csv?url';

export const getCourseLogoUrl = (url?: string | null): string => {
  if (!url) {
    return courseDefaultLogoUrl;
  }
  return url;
};

export const getCourseUserInviteTemplatePath = (): string => {
  return courseUserInvitationTemplateUrl;
};
