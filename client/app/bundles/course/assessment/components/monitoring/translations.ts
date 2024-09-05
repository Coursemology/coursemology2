import { defineMessages } from 'react-intl';

export default defineMessages({
  blocksAccessesFromInvalidSUS: {
    id: 'course.assessment.monitoring.blocksAccessesFromInvalidSUS',
    defaultMessage: 'Block accesses from unauthorised browsers',
  },
  blocksAccessesFromInvalidSUSHint: {
    id: 'course.assessment.monitoring.blocksAccessesFromInvalidSUSHint',
    defaultMessage:
      "If enabled, examinees using unauthorised browsers can't access this assessment. " +
      'Instructors can override access with the session unlock password. Heartbeats ' +
      'from overridden browser sessions will always be valid (green) in the PulseGrid.',
  },
  needSUSAndSessionUnlockPassword: {
    id: 'course.assessment.monitoring.needSUSAndSessionUnlockPassword',
    defaultMessage:
      'You must enable browser authorisation and set a session unlock password to enable this.',
  },
  examMonitoring: {
    id: 'course.assessment.monitoring.examMonitoring',
    defaultMessage: 'Enable exam monitoring',
  },
  examMonitoringHint: {
    id: 'course.assessment.monitoring.examMonitoringHint',
    defaultMessage:
      "If enabled, examinees' sessions will be monitored in real time from when they attempt the exam until they " +
      'finalise it or the first 24 hours since their attempt, whichever is earlier. Instructors can monitor these ' +
      'sessions in <pulsegrid>PulseGrid</pulsegrid>.',
  },
  minInterval: {
    id: 'course.assessment.monitoring.minInterval',
    defaultMessage: 'Min interval',
  },
  maxInterval: {
    id: 'course.assessment.monitoring.maxInterval',
    defaultMessage: 'Max interval',
  },
  intervalHint: {
    id: 'course.assessment.monitoring.intervalHint',
    defaultMessage:
      "Controls how frequent heartbeats are sent from the examinees' browsers. Intervals are randomised between these " +
      'two ranges.',
  },
  offset: {
    id: 'course.assessment.monitoring.offset',
    defaultMessage: 'Inter-heartbeat offset',
  },
  offsetHint: {
    id: 'course.assessment.monitoring.offsetHint',
    defaultMessage:
      'Controls how long PulseGrid should wait after the frequency interval before flagging a session as late.',
  },
  secret: {
    id: 'course.assessment.monitoring.secret',
    defaultMessage: 'Secret UA Substring (SUS)',
  },
  secretHint: {
    id: 'course.assessment.monitoring.secretHint',
    defaultMessage:
      "If an examinee's browser's User Agent (UA) contains this case-sensitive secret, PulseGrid " +
      'will flag that session as valid, and invalid otherwise. If you leave this blank, all sessions will be flagged as valid.',
  },
  milliseconds: {
    id: 'course.assessment.monitoring.milliseconds',
    defaultMessage: 'ms',
  },
  enableBrowserAuthorization: {
    id: 'course.assessment.monitoring.enableBrowserAuthorization',
    defaultMessage: 'Authorise browsers that access this assessment',
  },
  enableBrowserAuthorizationHint: {
    id: 'course.assessment.monitoring.enableBrowserAuthorizationHint',
    defaultMessage:
      'If enabled, PulseGrid will additionally check if an examinee is ' +
      'accessing this assessment from an authorised browser, based on the authorisation method you choose.',
  },
  userAgent: {
    id: 'course.assessment.monitoring.userAgent',
    defaultMessage: 'User Agent (UA)',
  },
  userAgentHint: {
    id: 'course.assessment.monitoring.userAgentHint',
    defaultMessage:
      "Flags a session as valid if the examinee's browser's <ua>User Agent (UA)</ua> contains a secret substring.",
  },
  sebConfigKeyFieldLabel: {
    id: 'course.assessment.monitoring.sebConfigKeyFieldLabel',
    defaultMessage: 'SEB Config Key',
  },
  sebConfigKeyFieldHint: {
    id: 'course.assessment.monitoring.sebConfigKeyFieldHint',
    defaultMessage:
      'Your <sebConfigKey>SEB Config Key</sebConfigKey>, <i>not the Browser Exam Key</i>, is generated from your ' +
      'specific SEB configuration. It stays the same across operating systems and SEB versions. Ensure this field ' +
      'is updated if you change your SEB configuration.',
  },
  sebConfigKey: {
    id: 'course.assessment.monitoring.sebConfigKey',
    defaultMessage: 'Safe Exam Browser (SEB) Config Key',
  },
  sebConfigKeyHint: {
    id: 'course.assessment.monitoring.sebConfigKeyHint',
    defaultMessage:
      'Flags a session as valid if the examinee is using <seb>Safe Exam Browser (SEB)</seb> with a valid configuration. ' +
      'SEB generates a unique <sebConfigKey>Config Key</sebConfigKey> for a specific configuration. This method requires ' +
      'SEB 3.4 for Windows and SEB 3.0 for iOS and macOS, or later.',
  },
  browserAuthorizationMethod: {
    id: 'course.assessment.monitoring.browserAuthorizationMethod',
    defaultMessage: 'Browser authorisation method',
  },
  browserAuthorizationMethodHint: {
    id: 'course.assessment.monitoring.browserAuthorizationMethodHint',
    defaultMessage:
      'Choose how sessions are authorised as valid or invalid. Changes apply to all sessions and heartbeats ' +
      'immediately and updates live in PulseGrid.',
  },
});
