import { object, string, bool, number, date, ref, mixed } from 'yup';
import translations from './translations';

const validationSchema = object({
  title: string().required(translations.titleRequired),
  description: string(),
  published: bool(),
  enrollable: bool(),
  startAt: date()
    .required(translations.startTimeRequired)
    .typeError(translations.invalidTimeFormat),
  endAt: date()
    .min(ref('startAt'), translations.endMustAfterStartTime)
    .typeError(translations.invalidTimeFormat),
  gamified: bool(),
  showPersonalizedTimelineFeatures: bool(),
  defaultTimelineAlgorithm: mixed().oneOf([
    'fixed',
    'fomo',
    'stragglers',
    'otot',
  ]),
  timeZone: string(),
  advanceStartAtDurationDays: number().transform((value) => value ?? 0),
});

export default validationSchema;
