import { ReactNode, useState } from 'react';
import { Add } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { TimeData } from 'types/course/referenceTimelines';

import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';

import translations from '../../translations';
import { DAY_WIDTH_PIXELS, getSecondsFromDays } from '../../utils';

interface TimelineProps {
  default?: boolean;
  children?: ReactNode;
  defaultTime?: TimeData;
  canCreate?: boolean;
  selected?: boolean;
  onClickShadow?: (startTime: moment.Moment, target: HTMLElement) => void;
}

const Timeline = (props: TimelineProps): JSX.Element => {
  const { t } = useTranslation();

  const [hovered, setHovered] = useState(false);
  const [hoveredLeft, setHoveredLeft] = useState(0);

  return (
    <div
      className={`relative h-10 w-full transition-colors ${
        props.default
          ? '!-mt-0 box-content border-0 border-t border-solid border-neutral-200 first:!-mt-[1px]'
          : ''
      } ${props.selected ? 'bg-sky-50' : ''}`}
      {...(props.canCreate && {
        onMouseEnter: (): void => setHovered(true),
        onMouseLeave: (): void => setHovered(false),
        onMouseMove: (e): void => {
          const rectangle = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rectangle.left;
          setHoveredLeft(Math.floor(x / DAY_WIDTH_PIXELS) * DAY_WIDTH_PIXELS);
        },
      })}
    >
      {props.children}

      {props.canCreate && hovered && (
        <div
          className="absolute top-0 z-40 flex h-full select-none items-center space-x-4 rounded-lg bg-neutral-200 px-4 text-neutral-500 active:animate-none active:bg-sky-100 active:text-sky-700 active:outline"
          onClick={(e): void => {
            const startTime = moment.unix(
              getSecondsFromDays(Math.floor(hoveredLeft / DAY_WIDTH_PIXELS)),
            );

            props.onClickShadow?.(startTime, e.currentTarget);
          }}
          role="button"
          style={{ left: hoveredLeft }}
          tabIndex={0}
        >
          <Add fontSize="small" />

          <Typography variant="body2">
            {t(translations.clickToAssignTime)}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default Timeline;
