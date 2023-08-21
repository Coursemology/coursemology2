import courseDefaultLogoUrl from 'assets/images/course-default-logo.svg?url';

export const getCourseLogoUrl = (url?: string | null): string => {
  if (!url) {
    return courseDefaultLogoUrl;
  }
  return url;
};
