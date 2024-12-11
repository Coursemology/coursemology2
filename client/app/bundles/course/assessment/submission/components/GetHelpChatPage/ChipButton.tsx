import { Dispatch, SetStateAction, useEffect } from 'react';
import { defineMessages } from 'react-intl';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { Chip } from '@mui/material';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { GET_HELP_SYNC_STATUS } from 'lib/constants/sharedConstants';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import {
  createLiveFeedbackChat,
  fetchLiveFeedbackStatus,
} from '../../actions/answers';
import { getLiveFeedbackChatsForQuestionId } from '../../selectors/liveFeedbackChats';

interface ChipButtonIndicatorProps {
  questionId: number;
  syncStatus: keyof typeof GET_HELP_SYNC_STATUS;
  setSyncStatus: Dispatch<SetStateAction<keyof typeof GET_HELP_SYNC_STATUS>>;
}

const translations = defineMessages({
  syncingWithCodaveri: {
    id: 'course.assessment.submission.GetHelpChatPage.syncingWithCodaveri',
    defaultMessage: 'Connecting',
  },
  syncedWithCodaveri: {
    id: 'course.assessment.submission.GetHelpChatPage.syncedWithCodaveri',
    defaultMessage: 'Connected',
  },
  failedSyncingWithCodaveri: {
    id: 'course.assessment.submission.GetHelpChatPage.failedSyncingWithCodaveri',
    defaultMessage: 'Failed in Connecting',
  },
});

const GetHelpSyncIndicatorMap = {
  Syncing: {
    color: 'default' as const,
    icon: <LoadingIndicator bare size={20} />,
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
  const { questionId, syncStatus, setSyncStatus } = props;

  const submissionId = getSubmissionId();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const liveFeedbackChats = useAppSelector((state) =>
    getLiveFeedbackChatsForQuestionId(state, questionId),
  );

  const currentThreadId = liveFeedbackChats?.currentThreadId;

  const createChat = (): void => {
    dispatch(createLiveFeedbackChat({ submissionId, questionId }))
      .then(() => setSyncStatus(GET_HELP_SYNC_STATUS.Synced))
      .catch(() => setSyncStatus(GET_HELP_SYNC_STATUS.Failed));
  };

  const fetchChatStatus = (): void => {
    dispatch(
      fetchLiveFeedbackStatus({
        submissionId,
        questionId,
        threadId: currentThreadId,
      }),
    )
      .then(() => setSyncStatus(GET_HELP_SYNC_STATUS.Synced))
      .catch(() => setSyncStatus(GET_HELP_SYNC_STATUS.Failed));
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
      clickable={syncStatus === GET_HELP_SYNC_STATUS.Failed}
      color={chipProps.color}
      icon={chipProps.icon}
      label={t(chipProps.label)}
      onClick={() => {
        setSyncStatus(GET_HELP_SYNC_STATUS.Syncing);
        createChatOnDemand();
      }}
      size="medium"
      variant="outlined"
    />
  );
};

export default ChipButton;
