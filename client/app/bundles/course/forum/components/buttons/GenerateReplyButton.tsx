import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { AutoAwesome } from '@mui/icons-material';
import { Chip, Tooltip } from '@mui/material';
import { ForumTopicPostEntity } from 'types/course/forums';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { generateNewReply } from '../../operations';

const translations = defineMessages({
  GenerateReply: {
    id: 'course.forum.GenerateReplyButton.generateReply',
    defaultMessage: 'Generate reply',
  },
  GeneratingReply: {
    id: 'course.forum.GenerateReplyButton.generatingReply',
    defaultMessage: 'Generating reply',
  },
  GenerateReplySuccess: {
    id: 'course.forum.GenerateReplyButton.generateReplySuccess',
    defaultMessage: 'A reply has been successfully generated.',
  },
  GenerateReplyFailure: {
    id: 'course.forum.publishButton.generateReplySuccess',
    defaultMessage: 'Failed to generate a reply.',
  },
  GenerateReplyTooltip: {
    id: 'course.forum.publishButton.generateReplyTooltip',
    defaultMessage: 'Generate a draft reply using AI',
  },
  GenerateReplyDisabledTooltip: {
    id: 'course.forum.publishButton.generateReplyDisabledTooltip',
    defaultMessage: 'Disabled for generated reply',
  },
});

interface Props {
  post: ForumTopicPostEntity;
  forumId: string;
  topicId: string;
}

const GenerateReplyButton: FC<Props> = ({ post, forumId, topicId }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleGenerateNewAnswer = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await dispatch(
        generateNewReply(
          forumId,
          topicId,
          post.id,
          post.postUrl,
          () => {
            setIsLoading(false);
            toast.success(t(translations.GenerateReplySuccess));
          },
          () => {
            setIsLoading(false);
            toast.error(t(translations.GenerateReplyFailure));
          },
        ),
      );
    } catch {
      toast.error(t(translations.GenerateReplyFailure));
    }
  };

  useEffect(() => {
    if (post.workflowState === POST_WORKFLOW_STATE.answering && !isLoading) {
      handleGenerateNewAnswer();
    }
  }, [isLoading]);

  return (
    <Tooltip
      title={
        post.isAiGenerated
          ? t(translations.GenerateReplyDisabledTooltip)
          : t(translations.GenerateReplyTooltip)
      }
    >
      <span>
        <Chip
          classes={{
            root: 'pr-2',
          }}
          color="primary"
          deleteIcon={
            isLoading ? <LoadingIndicator bare size={15} /> : <AutoAwesome />
          }
          disabled={isLoading || post.isAiGenerated}
          label={
            isLoading
              ? t(translations.GeneratingReply)
              : t(translations.GenerateReply)
          }
          onClick={handleGenerateNewAnswer}
          onDelete={(e) => {
            e.stopPropagation();
            handleGenerateNewAnswer();
          }}
          size="small"
        />
      </span>
    </Tooltip>
  );
};

export default GenerateReplyButton;
