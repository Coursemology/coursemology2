import {
  Block,
  CheckCircle,
  FormatListBulleted,
  HourglassTop,
  Key,
} from '@mui/icons-material';
import { Chip, Tooltip } from '@mui/material';
import { AssessmentListData } from 'types/course/assessment/assessments';
import { TimelineAlgorithm } from 'types/course/personalTimes';

import PersonalTimeBooleanIcons from 'lib/components/extensions/PersonalTimeBooleanIcon';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface NonStudentStatusBadgesProps {
  for: AssessmentListData;
}

interface StatusBadgesProps extends NonStudentStatusBadgesProps {
  isStudent: boolean;
  timelineAlgorithm: TimelineAlgorithm | undefined;
}

const NonStudentStatusBadges = (
  props: NonStudentStatusBadgesProps,
): JSX.Element => {
  const { for: assessment } = props;
  const { t } = useTranslation();

  return (
    <>
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

      {assessment.isKoditsuAssessmentEnabled && (
        <Chip
          color="info"
          label={t(translations.koditsuMode)}
          size="small"
          variant="outlined"
        />
      )}
    </>
  );
};

const StatusBadges = (props: StatusBadgesProps): JSX.Element => {
  const { for: assessment, isStudent, timelineAlgorithm } = props;
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-2 max-xl:mt-2 xl:ml-2">
      {assessment.timeLimit && (
        <Tooltip
          disableInteractive
          title={t(translations.timeLimitIcon, {
            timeLimit: assessment.timeLimit,
          })}
        >
          <HourglassTop className="text-3xl text-neutral-500 hover?:text-neutral-600" />
        </Tooltip>
      )}

      {!isStudent && <NonStudentStatusBadges for={assessment} />}

      <PersonalTimeBooleanIcons
        affectsPersonalTimes={assessment.affectsPersonalTimes}
        hasPersonalTimes={assessment.hasPersonalTimes}
        isStudent={isStudent}
        timelineAlgorithm={timelineAlgorithm}
      />
    </div>
  );
};

export default StatusBadges;
