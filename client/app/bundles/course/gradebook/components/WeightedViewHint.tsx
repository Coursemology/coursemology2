import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Alert, Typography } from '@mui/material';

import { getUserEntity } from 'bundles/users/selectors';
import Link from 'lib/components/core/Link';
import { useAppSelector } from 'lib/hooks/store';
import useDismissibleOnce from 'lib/hooks/useDismissibleOnce';
import useTranslation from 'lib/hooks/useTranslation';

export const WEIGHTED_VIEW_HINT_KEY = 'gradebook_weighted_view_hint';

const translations = defineMessages({
  hint: {
    id: 'course.gradebook.WeightedViewHint.hint',
    defaultMessage:
      'Want to set how much each item contributes to students’ total grades? Enable Weighted Total view in {link}.',
  },
  settingsLink: {
    id: 'course.gradebook.WeightedViewHint.settingsLink',
    defaultMessage: 'Gradebook settings',
  },
});

interface Props {
  courseId: number;
}

/**
 * One-time, dismissable nudge shown to managers in the (always-visible) gradebook view
 * when the weighted view is turned off. It advertises the capability and links to the
 * setting that enables it, since that setting is otherwise buried in course admin.
 * Dismissal is remembered per user via localStorage (see useDismissibleOnce).
 */
const WeightedViewHint: FC<Props> = ({ courseId }) => {
  const { t } = useTranslation();
  const userId = useAppSelector(getUserEntity).id;
  const { dismissed, dismiss } = useDismissibleOnce(
    WEIGHTED_VIEW_HINT_KEY,
    userId,
  );

  if (dismissed) return null;

  return (
    <div className="px-5 pt-3">
      <Alert onClose={dismiss} severity="info">
        <Typography variant="body2">
          {t(translations.hint, {
            link: (
              <Link
                to={`/courses/${courseId}/admin/gradebook`}
                underline="hover"
              >
                {t(translations.settingsLink)}
              </Link>
            ),
          })}
        </Typography>
      </Alert>
    </div>
  );
};

export default WeightedViewHint;
