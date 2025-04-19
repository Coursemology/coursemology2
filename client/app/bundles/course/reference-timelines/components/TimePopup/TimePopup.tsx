import { Typography } from '@mui/material';
import {
  ItemWithTimeData,
  TimelineData,
} from 'types/course/referenceTimelines';

import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';

import { useSetLastSaved } from '../../contexts';
import { createTime, deleteTime, updateTime } from '../../operations';
import translations from '../../translations';
import { DraftableTimeData } from '../../utils';
import SeriouslyAnchoredPopup from '../SeriouslyAnchoredPopup';

import TimePopupForm from './TimePopupForm';
import TimePopupTopBar from './TimePopupTopBar';

interface TimePopupProps {
  for?: Partial<DraftableTimeData>;
  assignedIn?: TimelineData;
  assignedTo?: ItemWithTimeData;
  anchorsOn?: HTMLElement;
  default?: boolean;
  gamified?: boolean;
  newTime?: boolean;
  onClose?: () => void;
}

const TimePopup = (props: TimePopupProps): JSX.Element => {
  const {
    anchorsOn: anchorElement,
    for: time,
    assignedIn: timeline,
    assignedTo: item,
  } = props;

  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const { startLoading, abortLoading, setLastSavedToNow } = useSetLastSaved();

  const handleCreateTime = (data: {
    startAt: moment.Moment;
    bonusEndAt?: moment.Moment;
    endAt?: moment.Moment;
  }): void => {
    if (!timeline || !item) return;

    startLoading();

    dispatch(
      createTime(timeline.id, item.id, {
        startAt: data.startAt.toISOString(),
        bonusEndAt: data.bonusEndAt?.toISOString(),
        endAt: data.endAt?.toISOString(),
      }),
    )
      .then(() => {
        props.onClose?.();
        setLastSavedToNow();
      })
      .catch((error) => {
        abortLoading();
        toast.error(error ?? t(translations.errorCreatingTime));
      });
  };

  const handleUpdateTime = (data: {
    startAt: moment.Moment;
    bonusEndAt?: moment.Moment;
    endAt?: moment.Moment;
  }): void => {
    if (!timeline || !item || !time?.id) return;

    startLoading();

    dispatch(
      updateTime(timeline.id, item.id, time.id, {
        startAt: data.startAt.toISOString(),
        bonusEndAt: data.bonusEndAt?.toISOString() ?? null,
        endAt: data.endAt?.toISOString() ?? null,
      }),
    )
      .then(() => {
        props.onClose?.();
        setLastSavedToNow();
      })
      .catch((error) => {
        abortLoading();
        toast.error(error ?? t(translations.errorUpdatingTime));
      });
  };

  const handleDeleteTime = (): void => {
    if (!timeline || !item || !time?.id) return;

    startLoading();

    dispatch(deleteTime(timeline.id, item.id, time.id))
      .then(() => {
        props.onClose?.();
        setLastSavedToNow();
      })
      .catch((error) => {
        abortLoading();
        toast.error(error ?? t(translations.errorDeletingTime));
      });
  };

  return (
    <SeriouslyAnchoredPopup
      anchorEl={anchorElement}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      classes={{
        paper: 'w-[36rem] shadow-xl border border-solid border-neutral-200',
      }}
      elevation={0}
      onClose={props.onClose}
      open={Boolean(anchorElement)}
    >
      <TimePopupTopBar
        default={timeline?.default}
        new={props.newTime}
        onClickClose={props.onClose}
        onClickDelete={handleDeleteTime}
      />

      <main className="space-y-4 px-4 pb-4">
        <section>
          <Typography className="text-neutral-500" variant="caption">
            {props.newTime
              ? t(translations.assigningToItem)
              : t(translations.assignedToItem)}
          </Typography>

          <Typography className="line-clamp-3">{item?.title}</Typography>
        </section>

        <section>
          <Typography className="text-neutral-500" variant="caption">
            {props.newTime
              ? t(translations.assigningInTimeline)
              : t(translations.assignedInTimeline)}
          </Typography>

          <Typography className="line-clamp-3">{timeline?.title}</Typography>
        </section>

        <TimePopupForm
          for={time}
          new={props.newTime}
          onSubmit={props.newTime ? handleCreateTime : handleUpdateTime}
          showsBonus={props.gamified}
        />
      </main>
    </SeriouslyAnchoredPopup>
  );
};

export default TimePopup;
