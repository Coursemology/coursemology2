import { defineMessages } from 'react-intl';

export default defineMessages({
  codaveriSettings: {
    id: 'course.admin.CodaveriSettings.codaveriSettings',
    defaultMessage: 'Codaveri settings',
  },
  codaveriSettingsSubtitle: {
    id: 'course.admin.CodaveriSettings.codaveriSettingsSubtitle',
    defaultMessage:
      "This is currently an experimental feature. \
      Codaveri provides code evaluation and automated code feedback services for students' codes.",
  },
  enableIsOnlyITSP: {
    id: 'course.admin.CodaveriSettings.enableIsOnlyITSP',
    defaultMessage: 'Enable ITSP',
  },
  errorOccurredWhenUpdating: {
    id: 'course.admin.CodaveriSettings.error',
    defaultMessage: 'An error occurred while updating the codaveri setting.',
  },
  codaveriEngine: {
    id: 'course.admin.CodaveriSettings.codaveriEngine',
    defaultMessage: 'Codaveri Engine',
  },
  codaveriEngineDescription: {
    id: 'course.admin.CodaveriSettings.codaveriEngineDescription',
    defaultMessage:
      'Type of codaveri engine used to generate programming code feedback',
  },
  defaultEngine: {
    id: 'course.admin.CodaveriSettings.defaultEngine',
    defaultMessage: 'Default Engine',
  },
  defaultEngineDescription: {
    id: 'course.admin.CodaveriSettings.defaultEngineDescription',
    defaultMessage: 'Uses generative AI and verification techniques',
  },
  itspEngine: {
    id: 'course.admin.CodaveriSettings.itspEngine',
    defaultMessage: 'ITSP Engine',
  },
  itspEngineDescription: {
    id: 'course.admin.CodaveriSettings.itspEngineDescription',
    defaultMessage: 'Uses automated program repair technique',
  },
});
