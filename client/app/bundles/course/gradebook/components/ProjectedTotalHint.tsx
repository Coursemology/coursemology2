import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Alert, Typography } from '@mui/material';

import { getUserEntity } from 'bundles/users/selectors';
import { useAppSelector } from 'lib/hooks/store';
import useDismissibleOnce from 'lib/hooks/useDismissibleOnce';
import useTranslation from 'lib/hooks/useTranslation';

export const PROJECTED_TOTAL_POLICY_HINT_KEY =
  'gradebook_projected_total_policy_hint';

// Single source for the projected-total policy sentence: the one-time banner
// below and the ⓘ tooltip on the Total header (in WeightedGradebookTable) both
// render this exact message, so the explanation never drifts between the two.
export const projectedTotalPolicyTranslations = defineMessages({
  policy: {
    id: 'course.gradebook.ProjectedTotalHint.policy',
    defaultMessage: 'Totals count ungraded assessments as 0.',
  },
});

/**
 * One-time, dismissable banner shown the first time a manager opens the weighted
 * (Weighted Total) gradebook view. It teaches the projected-total policy — ungraded
 * assessments are counted as 0 — so a low total isn't mistaken for a bug. After
 * dismissal the policy stays available via the ⓘ tooltip on the Total header.
 * Dismissal is remembered per user via localStorage (see useDismissibleOnce).
 */
const ProjectedTotalHint: FC = () => {
  const { t } = useTranslation();
  const userId = useAppSelector(getUserEntity).id;
  const { dismissed, dismiss } = useDismissibleOnce(
    PROJECTED_TOTAL_POLICY_HINT_KEY,
    userId,
  );

  if (dismissed) return null;

  return (
    <div className="px-5 pt-3">
      <Alert onClose={dismiss} severity="info">
        <Typography variant="body2">
          {t(projectedTotalPolicyTranslations.policy)}
        </Typography>
      </Alert>
    </div>
  );
};

export default ProjectedTotalHint;
