import { MouseEventHandler, ReactNode, TouchEventHandler } from 'react';

import moment from 'lib/moment';

import {
  DAY_WIDTH_PIXELS,
  getDaysFromSeconds,
  getDaysFromWidth,
  getDurationDays,
} from '../../utils';
import HorizontallyResizable from '../HorizontallyResizable';

import TimeBarHandle from './TimeBarHandle';

type TimeObject = moment.Moment;

type TimeChangeEventHandler = (deltaDays: number) => void;

interface DurationBarProps {
  starts: TimeObject;
  children?: ReactNode;
  bonusEnds?: TimeObject;
  ends?: TimeObject;
  showTimes?: boolean;
  shadow?: boolean;
  disabled?: boolean;
  selected?: boolean;
  onChangeStartTime?: TimeChangeEventHandler;
  onChangeBonusEndTime?: TimeChangeEventHandler;
  onChangeEndTime?: TimeChangeEventHandler;
  onChangeResizeState?: (resizing: boolean) => void;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  onMouseUp?: MouseEventHandler<HTMLDivElement>;
  onTouchEnd?: TouchEventHandler<HTMLDivElement>;
}

export const DURATION_BAR_HEIGHT_PIXELS = 25;

const DurationBar = (props: DurationBarProps): JSX.Element => {
  const start = moment(props.starts).startOf('day');
  const bonus = props.bonusEnds && moment(props.bonusEnds).startOf('day');
  const end = props.ends && moment(props.ends).startOf('day');

  const startFromEpoch = getDaysFromSeconds(start.unix()) + 1;
  const left = DAY_WIDTH_PIXELS * startFromEpoch;

  const bonusDuration = bonus && getDurationDays(start, bonus);
  const bonusWidth = bonusDuration && DAY_WIDTH_PIXELS * bonusDuration;

  const duration = end && getDurationDays(start, end);
  const width = DAY_WIDTH_PIXELS * ((end ? duration : bonusDuration) ?? 1);

  return (
    <HorizontallyResizable
      className={`absolute z-10 mb-1 h-10 bg-sky-200 ${
        !end ? 'rounded-l-lg rounded-r-3xl' : 'rounded-lg'
      } ${
        props.shadow
          ? 'border-2 border-dashed border-neutral-400 bg-neutral-100 hover?:bg-neutral-100/80'
          : ''
      } ${!props.disabled ? 'hover?:bg-sky-200/80' : ''} ${
        props.selected ? 'z-40 shadow-lg' : ''
      }`}
      disabled={props.disabled}
      handleLeft={(handleRef, resizing): JSX.Element => (
        <TimeBarHandle.Start
          ref={handleRef}
          persistent={resizing || props.showTimes}
          time={start}
        />
      )}
      handleRight={
        end
          ? (handleRef, resizing): JSX.Element => (
              <TimeBarHandle.End
                ref={handleRef}
                persistent={resizing || props.showTimes}
                time={end}
              />
            )
          : undefined
      }
      height={DURATION_BAR_HEIGHT_PIXELS}
      left={left}
      onChangeResizeState={props.onChangeResizeState}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
      onResizeLeft={(deltaWidth): void =>
        props.onChangeStartTime?.(-getDaysFromWidth(deltaWidth))
      }
      onResizeRight={
        end
          ? (deltaWidth): void =>
              props.onChangeEndTime?.(getDaysFromWidth(deltaWidth))
          : undefined
      }
      onTouchEnd={props.onTouchEnd}
      snapsBy={DAY_WIDTH_PIXELS}
      width={width}
    >
      {bonus && bonusWidth && (
        <HorizontallyResizable
          className={`relative h-full bg-sky-400 ${
            !end ? 'rounded-l-lg rounded-r-3xl' : 'rounded-lg'
          } ${props.shadow ? 'bg-neutral-300 hover?:bg-neutral-300/80' : ''} ${
            !props.disabled ? 'hover?:bg-sky-400/80' : ''
          }`}
          disabled={props.disabled}
          handleRight={(handleRef, resizing): JSX.Element => (
            <TimeBarHandle.End
              ref={handleRef}
              persistent={resizing || props.showTimes}
              time={bonus}
            />
          )}
          height={DURATION_BAR_HEIGHT_PIXELS}
          onChangeResizeState={props.onChangeResizeState}
          onResizeRight={(deltaWidth): void =>
            props.onChangeBonusEndTime?.(getDaysFromWidth(deltaWidth))
          }
          snapsBy={DAY_WIDTH_PIXELS}
          width={bonusWidth}
        />
      )}

      {props.children}
    </HorizontallyResizable>
  );
};

export default DurationBar;
