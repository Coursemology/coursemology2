import { defineMessages } from 'react-intl';

export default defineMessages({
  codaveriSettings: {
    id: 'course.admin.CodaveriSettings.codaveriSettings',
    defaultMessage: 'Codaveri settings',
  },
  codaverSettingsSubtitle: {
    id: 'course.admin.CodaveriSettings.codaverSettingsSubtitle',
    defaultMessage:
      "This is currently an experimental feature. \
      Codaveri provides code evaluation and automated code feedback services for students' codes.",
  },
  enableIsOnlyITSP: {
    id: 'course.admin.CodaveriSettings.enableIsOnlyITSP',
    defaultMessage: 'Enable ITSP',
  },
  isSolutionRequired: {
    id: 'course.admin.CodaveriSettings.isSolutionRequired',
    defaultMessage: 'Require a solution when creating a Codaveri question',
  },
  errorOccurredWhenUpdating: {
    id: 'course.admin.CodaveriSettings.error',
    defaultMessage: 'An error occurred while updating the codaveri setting.',
  },
});
