import { FC } from 'react';
import { defineMessages } from 'react-intl';
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

const formatAssessmentNames = (names: string[]): string => {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;

  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
};

const OutOfRangeAlert: FC<Props> = ({ gradeCount, assessmentNames, weightedViewEnabled }) => {
  const { t } = useTranslation();
  if (gradeCount === 0) return null;
  if (weightedViewEnabled) {
    return (
      <Alert severity="warning" sx={{ mx: 2, my: 1 }}>
        {t(translations.warningWeighted, {
          gradeCount,
          assessmentCount: assessmentNames.length,
          assessmentNames: formatAssessmentNames(assessmentNames),
        })}
      </Alert>
    )
  } else {
    return (
      <Alert severity="warning" sx={{ mx: 2, my: 1 }}>
        {t(translations.warning, {
          gradeCount,
          assessmentCount: assessmentNames.length,
          assessmentNames: formatAssessmentNames(assessmentNames),
        })}
      </Alert>
    );
  }
};

export default OutOfRangeAlert;
