import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Alert, Typography } from '@mui/material';

import { getUserEntity } from 'bundles/users/selectors';
import { useAppSelector } from 'lib/hooks/store';
import useDismissibleOnce from 'lib/hooks/useDismissibleOnce';
import useTranslation from 'lib/hooks/useTranslation';

export const GRADE_LINK_HINT_KEY = 'gradebook_grade_link_hint';

const translations = defineMessages({
  hint: {
    id: 'course.gradebook.GradeLinkHint.hint',
    defaultMessage:
      "Each grade is the total of the marks in a student's submission. Click any grade to open that submission and adjust the marks.",
  },
});

/**
 * One-time, dismissable nudge explaining that each grade in the "All assessments"
 * table is a link into the student's submission. Grades have no gradebook-level edit
 * (an assessment's total is always the sum of its question marks), so clicking into the
 * submission is the only path to changing a grade — an affordance that surprises users
 * because a number is not expected to be clickable.
 * Dismissal is remembered per user via localStorage (see useDismissibleOnce).
 */
const GradeLinkHint: FC = () => {
  const { t } = useTranslation();
  const userId = useAppSelector(getUserEntity).id;
  const { dismissed, dismiss } = useDismissibleOnce(
    GRADE_LINK_HINT_KEY,
    userId,
  );

  if (dismissed) return null;

  return (
    <div className="px-5 pt-3">
      <Alert onClose={dismiss} severity="info">
        <Typography variant="body2">{t(translations.hint)}</Typography>
      </Alert>
    </div>
  );
};

export default GradeLinkHint;
