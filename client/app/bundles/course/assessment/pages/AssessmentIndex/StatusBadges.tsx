import {
  Block,
  CheckCircle,
  Key,
  Schedule,
  Shuffle,
} from '@mui/icons-material';
import { Chip, Tooltip, Typography } from '@mui/material';
import { AssessmentListData } from 'types/course/assessment/assessments';

import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

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

      {assessment.passwordProtected && (
        <Tooltip disableInteractive title={t(translations.passwordProtected)}>
          <Key className="text-3xl text-neutral-500 hover?:text-neutral-600" />
        </Tooltip>
      )}

      {assessment.hasPersonalTimes && (
        <Tooltip
          disableInteractive
          title={
            <section className="flex flex-col space-y-2">
              <Typography variant="body2">
                {t(translations.hasPersonalTimes)}
              </Typography>

              <Typography variant="caption">
                {t(translations.hasPersonalTimesHint)}
              </Typography>
            </section>
          }
        >
          <Schedule className="text-3xl text-neutral-500 hover?:text-neutral-600" />
        </Tooltip>
      )}

      {assessment.affectsPersonalTimes && (
        <Tooltip
          disableInteractive
          title={
            <section className="flex flex-col space-y-2">
              <Typography variant="body2">
                {t(translations.affectsPersonalTimes)}
              </Typography>

              <Typography variant="caption">
                {t(translations.affectsPersonalTimesHint)}
              </Typography>
            </section>
          }
        >
          <Shuffle className="text-3xl text-neutral-500 hover?:text-neutral-600" />
        </Tooltip>
      )}
    </div>
  );
};

export default StatusBadges;
