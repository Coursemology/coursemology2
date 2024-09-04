import { defineMessages } from 'react-intl';

export default defineMessages({
  blocksAccessesFromInvalidSUS: {
    id: 'course.assessment.monitoring.blocksAccessesFromInvalidSUS',
    defaultMessage: 'Block accesses from browsers with invalid UA',
  },
  blocksAccessesFromInvalidSUSHint: {
    id: 'course.assessment.monitoring.blocksAccessesFromInvalidSUSHint',
    defaultMessage:
      'If enabled, examinees using browsers with invalid UA (does not contain the specified SUS below) will be blocked ' +
      'from accessing this assessment. Instructors can override access with the session unlock password. Heartbeats ' +
      'from an overridden browser session will be flagged as valid in the PulseGrid.',
  },
  needSUSAndSessionUnlockPassword: {
    id: 'course.assessment.monitoring.needSUSAndSessionUnlockPassword',
    defaultMessage:
      'You need to specify a SUS and session unlock password to enable this.',
  },
  examMonitoring: {
    id: 'course.assessment.monitoring.examMonitoring',
    defaultMessage: 'Enable exam monitoring',
  },
  examMonitoringHint: {
    id: 'course.assessment.monitoring.examMonitoringHint',
    defaultMessage:
      "If enabled, examinees' sessions will be monitored in real time from the moment they attempt the exam, until they " +
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
      "If provided, the <pulsegrid>PulseGrid</pulsegrid> automatically checks if the examinee's browser's User Agent (UA) " +
      'contains this secret, and marks connections that do not as invalid. This string is case-sensitive.',
  },
  milliseconds: {
    id: 'course.assessment.monitoring.milliseconds',
    defaultMessage: 'ms',
  },
});
