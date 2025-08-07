import { ReactNode } from 'react';
import { Lock } from '@mui/icons-material';
import { Tooltip, Typography } from '@mui/material';
import { AssessmentUnlockRequirements } from 'types/course/assessment/assessments';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import { fetchAssessmentUnlockRequirements } from '../../operations/assessments';
import translations from '../../translations';

const ShakyLock = ({ title }: { title: string | ReactNode }): JSX.Element => (
  <div className="flex min-w-[8.5rem] justify-center">
    <Tooltip arrow placement="left" title={title}>
      <Lock
        className="text-neutral-500 hover?:animate-shake hover?:text-neutral-600"
        fontSize="small"
      />
    </Tooltip>
  </div>
);

const UnavailableMessage = ({
  isStartTimeBegin,
  hasConditions,
}: {
  isStartTimeBegin?: boolean;
  hasConditions?: {
    conditionSatisfied: boolean;
    assessmentId: number;
  };
}): JSX.Element | null => {
  const { t } = useTranslation();

  if (!isStartTimeBegin)
    return <ShakyLock title={t(translations.openingSoon)} />;

  if (hasConditions && !hasConditions.conditionSatisfied)
    return (
      <ShakyLock
        title={
          <section className="flex flex-col space-y-2 pb-1">
            <Typography variant="caption">
              {t(translations.unlockableHint)}
            </Typography>

            <Preload
              after={600}
              render={
                <LoadingIndicator bare className="text-white" size={15} />
              }
              while={(): Promise<AssessmentUnlockRequirements> =>
                fetchAssessmentUnlockRequirements(hasConditions.assessmentId)
              }
            >
              {(data): JSX.Element => (
                <ul className="m-0 pl-6">
                  {data.map((condition) => (
                    <Typography
                      key={condition}
                      component="li"
                      variant="caption"
                    >
                      {condition}
                    </Typography>
                  ))}
                </ul>
              )}
            </Preload>
          </section>
        }
      />
    );

  return null;
};

export default UnavailableMessage;
