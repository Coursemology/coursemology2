import { Dispatch, FC, SetStateAction, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button } from '@mui/material';
import { ForumTopicEntity, ForumTopicPostEntity } from 'types/course/forums';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { updateForumTopicPost } from '../../operations';

import MarkAnswerAndPublishButton from './MarkAnswerAndPublishButton';

interface Props {
  post: ForumTopicPostEntity;
  topic: ForumTopicEntity;
  editValue: string;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
}

const translations = defineMessages({
  emptyPost: {
    id: 'course.forum.ForumTopicPostEditActionButtons.emptyPost',
    defaultMessage: 'Post cannot be empty!',
  },
  updateSuccess: {
    id: 'course.forum.ForumTopicPostEditActionButtons.updateSuccess',
    defaultMessage: 'The post has been updated.',
  },
  updateFailure: {
    id: 'course.forum.ForumTopicPostEditActionButtons.updateFailure',
    defaultMessage: 'Failed to update the post - {error}',
  },
  discardEditPostPromptTitle: {
    id: 'course.forum.ForumTopicPostEditActionButtons.discardEditPostPromptTitle',
    defaultMessage: 'Discard unsaved changes?',
  },
  discardEditPostPromptMessage: {
    id: 'course.forum.ForumTopicPostEditActionButtons.discardEditPostPromptMessage',
    defaultMessage:
      'You have edited this post and there are unsaved changes. Do you wish to proceed?',
  },
  discardEditPostPromptAction: {
    id: 'course.forum.ForumTopicPostEditActionButtons.discardEditPostPromptAction',
    defaultMessage: 'Discard',
  },
});

const ForumTopicPostEditActionButtons: FC<Props> = (props) => {
  const { post, topic, editValue, setIsEditing } = props;
  const [discardEditPrompt, setDiscardEditPrompt] = useState(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleUpdate = (): void => {
    dispatch(updateForumTopicPost(post.postUrl, editValue))
      .then(() => {
        toast.success(t(translations.updateSuccess));
        setIsEditing(false);
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors ?? '';
        toast.error(
          t(translations.updateFailure, {
            error: errorMessage,
          }),
        );
      });
  };

  const handleSaveUpdate = (): void => {
    if (editValue.trim() === '') {
      toast.error(t(translations.emptyPost));
      return;
    }
    if (editValue === post.text) {
      setIsEditing(false);
    } else {
      handleUpdate();
    }
  };

  return (
    <>
      <Button
        color="secondary"
        id={`post_${post.id}`}
        onClick={(): void => {
          if (editValue === post.text) setIsEditing(false);
          else setDiscardEditPrompt(true);
        }}
      >
        {t(formTranslations.cancel)}
      </Button>

      {post.isAiGenerated &&
      post.workflowState === POST_WORKFLOW_STATE.draft ? (
        <MarkAnswerAndPublishButton
          post={post}
          save={handleSaveUpdate}
          topic={topic}
        />
      ) : (
        <Button
          className="save-button"
          color="primary"
          disabled={editValue === post.text}
          id={`post_${post.id}`}
          onClick={handleSaveUpdate}
        >
          {t(formTranslations.save)}
        </Button>
      )}

      <Prompt
        onClickPrimary={(): void => {
          setIsEditing(false);
          setDiscardEditPrompt(false);
        }}
        onClose={(): void => setDiscardEditPrompt(false)}
        open={discardEditPrompt}
        primaryColor="error"
        primaryLabel={t(translations.discardEditPostPromptAction)}
        title={t(translations.discardEditPostPromptTitle)}
      >
        <PromptText>{t(translations.discardEditPostPromptMessage)}</PromptText>
      </Prompt>
    </>
  );
};

export default ForumTopicPostEditActionButtons;
