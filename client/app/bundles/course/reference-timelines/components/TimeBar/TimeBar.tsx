import { useEffect, useState } from 'react';

import moment from 'lib/moment';

import { DAY_WIDTH_PIXELS, getDaysFromWidth } from '../../utils';
import HorizontallyDraggable from '../HorizontallyDraggable';

import DurationBar from './DurationBar';

interface TimeBarProps {
  startsAt: string | moment.Moment;
  bonusEndsAt?: string | moment.Moment;
  endsAt?: string | moment.Moment;
  shadow?: boolean;
  disabled?: boolean;
  selected?: boolean;
  onClick?: (target: HTMLElement | null) => void;
  onChangeTime?: (newTime: TimeTriplet, rollback: () => void) => void;
}

interface TimeTriplet {
  start: moment.Moment;
  bonus?: moment.Moment;
  end?: moment.Moment;
}

const isValidTimeTriplet = ({ start, bonus, end }: TimeTriplet): boolean => {
  const isBonusSameOrAfterStart = bonus?.isSameOrAfter(start);
  const isEndSameOrAfterBonus = bonus ? end?.isSameOrAfter(bonus) : undefined;
  const isEndAfterStart = end?.isAfter(start);

  return (
    (isBonusSameOrAfterStart ?? true) &&
    (isEndSameOrAfterBonus ?? true) &&
    (isEndAfterStart ?? true)
  );
};

const isSameTimeTriplet = (time1: TimeTriplet, time2: TimeTriplet): boolean => {
  const isStartSame = time1.start.isSame(time2.start);

  const isBonusSame =
    time1.bonus === time2.bonus || Boolean(time1.bonus?.isSame(time2.bonus));

  const isEndSame =
    time1.end === time2.end || Boolean(time1.end?.isSame(time2.end));

  return isStartSame && isBonusSame && isEndSame;
};

const generateTriplet = (
  start: TimeBarProps['startsAt'],
  bonus: TimeBarProps['bonusEndsAt'],
  end: TimeBarProps['endsAt'],
): TimeTriplet => ({
  start: moment(start),
  bonus: bonus ? moment(bonus) : undefined,
  end: end ? moment(end) : undefined,
});

const TimeBar = (props: TimeBarProps): JSX.Element => {
  const [{ start, bonus, end }, setTime] = useState<TimeTriplet>(
    generateTriplet(props.startsAt, props.bonusEndsAt, props.endsAt),
  );

  const [dragging, setDragging] = useState(false);
  const [oldTime, setOldTime] = useState<TimeTriplet>();

  useEffect(() => {
    setTime(generateTriplet(props.startsAt, props.bonusEndsAt, props.endsAt));
  }, [props.startsAt, props.bonusEndsAt, props.endsAt]);

  const validateAndSetTime = (
    transform: (time: TimeTriplet) => TimeTriplet,
  ): void =>
    setTime((time) => {
      const newTime = transform(time);
      return isValidTimeTriplet(newTime) ? newTime : time;
    });

  const handleChangeTime = (changing: boolean): void => {
    if (changing) {
      setOldTime({ start, bonus, end });
    } else {
      const newTime = { start, bonus, end };
      if (!oldTime || isSameTimeTriplet(oldTime, newTime)) return;

      props.onChangeTime?.(newTime, () => setTime(oldTime));
    }
  };

  return (
    <HorizontallyDraggable
      disabled={props.disabled}
      handleClassName="handle"
      onChangeDragState={(dragState): void => {
        setDragging(dragState);
        handleChangeTime(dragState);
      }}
      onClick={props.onClick}
      onDrag={(deltaX): void => {
        const deltaDays = getDaysFromWidth(deltaX);

        validateAndSetTime((time) => ({
          start: time.start.clone().add(deltaDays, 'days'),
          bonus: time.bonus?.clone().add(deltaDays, 'days'),
          end: time.end?.clone().add(deltaDays, 'days'),
        }));
      }}
      snapsBy={DAY_WIDTH_PIXELS}
    >
      <DurationBar
        bonusEnds={bonus}
        disabled={props.disabled}
        ends={end}
        onChangeBonusEndTime={(deltaDays): void =>
          validateAndSetTime((time) => ({
            ...time,
            bonus: time.bonus?.clone().add(deltaDays, 'days'),
          }))
        }
        onChangeEndTime={(deltaDays): void =>
          validateAndSetTime((time) => ({
            ...time,
            end: time.end?.clone().add(deltaDays, 'days'),
          }))
        }
        onChangeResizeState={handleChangeTime}
        onChangeStartTime={(deltaDays): void =>
          validateAndSetTime((time) => ({
            ...time,
            start: time.start.clone().add(deltaDays, 'days'),
          }))
        }
        selected={props.selected}
        shadow={props.shadow}
        showTimes={dragging}
        starts={start}
      >
        {!props.disabled && (
          <div
            className="handle absolute left-0 top-0 h-full w-full"
            role="button"
            tabIndex={0}
          />
        )}
      </DurationBar>
    </HorizontallyDraggable>
  );
};

export default TimeBar;
