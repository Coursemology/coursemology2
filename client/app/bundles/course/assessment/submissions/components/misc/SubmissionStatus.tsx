const statusTranslations = {
  unreleased: 'Not Released',
  unstarted: 'Not Started',
  attempting: 'Attempting',
  submitted: 'Submitted',
  graded: 'Graded, unpublished',
  published: 'Graded',
  unknown: 'Unknown status, please contact administrator',
};

export const translateStatus: (var1: string) => string = (oldStatus) => {
  switch (oldStatus) {
    case 'attempting':
      return statusTranslations.attempting;
    case 'submitted':
      return statusTranslations.submitted;
    case 'graded':
      return statusTranslations.graded;
    case 'published':
      return statusTranslations.published;
    case 'unreleased':
      return statusTranslations.unreleased;
    case 'unstarted':
      return statusTranslations.unstarted;
    default:
      return statusTranslations.unknown;
  }
};
