import { FC } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Alert } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  warning: {
    id: 'course.gradebook.OutOfRangeAlert.warning',
    defaultMessage:
      '{gradeCount, plural, one {# grade} other {# grades}} in the external {assessmentCount, plural, one {assessment} other {assessments}} {assessmentNames} {gradeCount, plural, one {is} other {are}} outside their range. Review before exporting.',
  },
  warningWeighted: {
    id: 'course.gradebook.OutOfRangeAlert.warningWeighted',
    defaultMessage:
      '{gradeCount, plural, one {# grade} other {# grades}} in the external {assessmentCount, plural, one {assessment} other {assessments}} {assessmentNames} {gradeCount, plural, one {is} other {are}} outside their range and {gradeCount, plural, one {is} other {are}} being capped or floored in the weighted total. Review before exporting.',
  },
});

interface Props {
  gradeCount: number;
  assessmentNames: string[];
  weightedViewEnabled: boolean;
}

const OutOfRangeAlert: FC<Props> = ({
  gradeCount,
  assessmentNames,
  weightedViewEnabled,
}) => {
  const { t } = useTranslation();
  const intl = useIntl();
  if (gradeCount === 0) return null;

  const listLocale = intl.locale.toLowerCase().startsWith('en')
    ? 'en-GB'
    : intl.locale;
  const names = new Intl.ListFormat(listLocale, { type: 'conjunction' }).format(
    assessmentNames,
  );

  return (
    <Alert severity="warning" sx={{ mx: 2, my: 1 }}>
      {t(
        weightedViewEnabled
          ? translations.warningWeighted
          : translations.warning,
        {
          gradeCount,
          assessmentCount: assessmentNames.length,
          assessmentNames: names,
        },
      )}
    </Alert>
  );
};

export default OutOfRangeAlert;
