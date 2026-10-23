import { createIntl } from 'react-intl';

import moment, { formatHumanizedDuration } from '../moment';

const intl = createIntl({ locale: 'en', messages: {}, onError: () => {} });

const ms = ({
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
}: {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}): number => (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000;

const format = (parts: Parameters<typeof ms>[0]): string =>
  formatHumanizedDuration(intl, ms(parts));

describe('formatHumanizedDuration', () => {
  it('lists every unit down to seconds', () => {
    expect(format({ days: 3, hours: 2, minutes: 10, seconds: 5 })).toBe(
      '3 days, 2 hours, 10 minutes, and 5 seconds',
    );
  });

  it('uses singular unit names for a count of one', () => {
    expect(format({ days: 1, hours: 1, minutes: 1, seconds: 1 })).toBe(
      '1 day, 1 hour, 1 minute, and 1 second',
    );
  });

  it('omits units larger than the duration', () => {
    expect(format({ minutes: 1, seconds: 30 })).toBe('1 minute and 30 seconds');
    expect(format({ seconds: 45 })).toBe('45 seconds');
  });

  it('omits zero units in the middle of the duration', () => {
    expect(format({ days: 3, seconds: 5 })).toBe('3 days and 5 seconds');
  });

  it('renders a single unit on its own', () => {
    expect(format({ days: 3 })).toBe('3 days');
  });

  // moment normalises days into months, so reading `days()` instead of `asDays()` would report
  // "9 days" here, and humanize() would round the whole thing to "a month".
  it('counts whole days past a month rather than rolling into months', () => {
    expect(format({ days: 40, hours: 3 })).toBe('40 days and 3 hours');
  });

  // There is no unit left to name below a second. Callers switch messages at that point rather
  // than render a countdown, so an empty string is never displayed.
  it('formats a duration under a second as nothing', () => {
    expect(formatHumanizedDuration(intl, 400)).toBe('');
    expect(formatHumanizedDuration(intl, 0)).toBe('');
    expect(formatHumanizedDuration(intl, -5000)).toBe('');
  });

  // Unit names come from moment's locale data rather than being maintained per locale here, so
  // switching moment's locale (as I18nProvider does) must change them. This also guards against
  // the locale data being dropped from the bundle, which would silently fall back to English.
  describe('in a non-English locale', () => {
    afterEach(() => moment.locale('en'));

    it('takes its unit names from moment, and its joining from the locale', () => {
      moment.locale('ko');
      const korean = createIntl({
        locale: 'ko',
        messages: {},
        onError: () => {},
      });

      expect(
        formatHumanizedDuration(korean, ms({ days: 3, minutes: 10 })),
      ).toBe('3일 및 10분');
    });

    it('needs no plural handling in locales without plural forms', () => {
      moment.locale('zh-cn');
      const chinese = createIntl({
        locale: 'zh',
        messages: {},
        onError: () => {},
      });

      expect(formatHumanizedDuration(chinese, ms({ days: 1, hours: 1 }))).toBe(
        '1 天和1 小时',
      );
    });
  });
});
