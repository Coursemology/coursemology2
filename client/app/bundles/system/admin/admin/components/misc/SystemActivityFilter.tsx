import { FC } from 'react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Button, ButtonGroup, IconButton, Typography } from '@mui/material';
import { ActivityGranularity } from 'types/system/activities';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations/activityStatistics';

const GRANULARITY_OPTIONS = [
  { value: 'month', label: translations.monthly },
  { value: 'year', label: translations.yearly },
] as const;

interface YearStepper {
  year: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onStep: (direction: -1 | 1) => void;
}

interface SystemActivityFilterProps {
  granularity: ActivityGranularity;
  onGranularityChange: (granularity: ActivityGranularity) => void;
  /** Omitted for views that are not scoped to a single year. */
  yearStepper?: YearStepper;
}

const SystemActivityFilter: FC<SystemActivityFilterProps> = (props) => {
  const { granularity, onGranularityChange, yearStepper } = props;
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Same treatment as the Timeline/Sequence View switch in AllAttempts: the selected option
          is filled, the other outlined. */}
      <ButtonGroup
        aria-label={t(translations.granularity)}
        color="primary"
        size="small"
        variant="outlined"
      >
        {/* `classes.root` is cleared, as in AllAttempts, so that the theme does not round the
            inner corners within the group. */}
        {GRANULARITY_OPTIONS.map(({ value, label }) => (
          <Button
            key={value}
            aria-pressed={granularity === value}
            classes={{ root: '' }}
            className="normal-case"
            disableElevation
            onClick={(): void => onGranularityChange(value)}
            variant={granularity === value ? 'contained' : 'outlined'}
          >
            {t(label)}
          </Button>
        ))}
      </ButtonGroup>

      {yearStepper && (
        <div className="flex items-center">
          <IconButton
            aria-label={t(translations.previousPeriod)}
            disabled={!yearStepper.canGoPrevious}
            onClick={(): void => yearStepper.onStep(-1)}
            size="small"
          >
            <ChevronLeft />
          </IconButton>
          <Typography
            aria-live="polite"
            className="min-w-[4rem] text-center"
            variant="body1"
          >
            {yearStepper.year}
          </Typography>
          <IconButton
            aria-label={t(translations.nextPeriod)}
            disabled={!yearStepper.canGoNext}
            onClick={(): void => yearStepper.onStep(1)}
            size="small"
          >
            <ChevronRight />
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default SystemActivityFilter;
