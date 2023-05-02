import {
  Block,
  CheckCircle,
  FormatListBulleted,
  Key,
} from '@mui/icons-material';
import { Chip, Tooltip } from '@mui/material';
import { AssessmentListData } from 'types/course/assessment/assessments';

import PersonalTimeBooleanIcons from 'lib/components/extensions/PersonalTimeBooleanIcon';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface StatusBadgesProps {
  for: AssessmentListData;
}

const StatusBadges = (props: StatusBadgesProps): JSX.Element => {
  const { for: assessment } = props;
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-2 max-xl:mt-2 xl:ml-2">
      {!assessment.published && (
        <Tooltip disableInteractive title={t(translations.draftHint)}>
          <Chip
            color="warning"
            icon={<Block />}
            label={t(translations.draft)}
            size="small"
            variant="outlined"
          />
        </Tooltip>
      )}

      {assessment.autograded && (
        <Tooltip disableInteractive title={t(translations.autograded)}>
          <CheckCircle className="text-3xl text-neutral-500 hover?:text-neutral-600" />
        </Tooltip>
      )}

      {assessment.hasTodo && (
        <Tooltip disableInteractive title={t(translations.hasTodo)}>
          <FormatListBulleted className="text-3xl text-neutral-500 hover?:text-neutral-600" />
        </Tooltip>
      )}

      {assessment.passwordProtected && (
        <Tooltip disableInteractive title={t(translations.passwordProtected)}>
          <Key className="text-3xl text-neutral-500 hover?:text-neutral-600" />
        </Tooltip>
      )}

      <PersonalTimeBooleanIcons
        affectsPersonalTimes={assessment.affectsPersonalTimes}
        hasPersonalTimes={assessment.hasPersonalTimes}
      />
    </div>
  );
};

export default StatusBadges;
