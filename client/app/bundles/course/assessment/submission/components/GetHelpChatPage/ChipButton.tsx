import { Dispatch, SetStateAction, useEffect } from 'react';
import { defineMessages } from 'react-intl';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { Chip } from '@mui/material';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { SYNC_STATUS } from 'lib/constants/sharedConstants';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import {
  createLiveFeedbackChat,
  fetchLiveFeedbackStatus,
} from '../../actions/answers';
import { getLiveFeedbackChatsForAnswerId } from '../../selectors/liveFeedbackChats';

interface ChipButtonIndicatorProps {
  answerId: number;
  syncStatus: keyof typeof SYNC_STATUS;
  setSyncStatus: Dispatch<SetStateAction<keyof typeof SYNC_STATUS>>;
}

const translations = defineMessages({
  syncingWithCodaveri: {
    id: 'course.assessment.submission.GetHelpChatPage.syncingWithCodaveri',
    defaultMessage: 'Preparing',
  },
  syncedWithCodaveri: {
    id: 'course.assessment.submission.GetHelpChatPage.syncedWithCodaveri',
    defaultMessage: 'Ready',
  },
  failedSyncingWithCodaveri: {
    id: 'course.assessment.submission.GetHelpChatPage.failedSyncingWithCodaveri',
    defaultMessage: 'Unavailable',
  },
});

const GetHelpSyncIndicatorMap = {
  Syncing: {
    color: 'default' as const,
    icon: <LoadingIndicator bare size={15} />,
    label: translations.syncingWithCodaveri,
  },
  Synced: {
    color: 'success' as const,
    icon: <CheckCircle />,
    label: translations.syncedWithCodaveri,
  },
  Failed: {
    color: 'error' as const,
    icon: <Cancel />,
    label: translations.failedSyncingWithCodaveri,
  },
};

const ChipButton = (props: ChipButtonIndicatorProps): JSX.Element | null => {
  const { answerId, syncStatus, setSyncStatus } = props;

  const submissionId = getSubmissionId();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const liveFeedbackChats = useAppSelector((state) =>
    getLiveFeedbackChatsForAnswerId(state, answerId),
  );

  const currentThreadId = liveFeedbackChats?.currentThreadId;

  const createChat = (): void => {
    dispatch(createLiveFeedbackChat({ submissionId, answerId }))
      .then(() => setSyncStatus(SYNC_STATUS.Synced))
      .catch(() => setSyncStatus(SYNC_STATUS.Failed));
  };

  const fetchChatStatus = (): void => {
    dispatch(
      fetchLiveFeedbackStatus({
        answerId,
        threadId: currentThreadId,
      }),
    )
      .then(() => setSyncStatus(SYNC_STATUS.Synced))
      .catch(() => setSyncStatus(SYNC_STATUS.Failed));
  };

  const createChatOnDemand = (): void => {
    if (!currentThreadId) {
      createChat();
    } else {
      fetchChatStatus();
    }
  };

  useEffect(() => {
    createChatOnDemand();
  }, [currentThreadId]);

  const chipProps = GetHelpSyncIndicatorMap[syncStatus];
  if (!chipProps) return null;

  return (
    <Chip
      className="self-center"
      clickable={syncStatus === SYNC_STATUS.Failed}
      color={chipProps.color}
      icon={chipProps.icon}
      label={t(chipProps.label)}
      onClick={() => {
        if (syncStatus === SYNC_STATUS.Failed) {
          setSyncStatus(SYNC_STATUS.Syncing);
          createChatOnDemand();
        }
      }}
      size="small"
      variant="outlined"
    />
  );
};

export default ChipButton;
