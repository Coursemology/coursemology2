import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Element, scroller } from 'react-scroll';
import { Button, Card, CardActions, CardContent } from '@mui/material';
import { ForumTopicPostFormData } from 'types/course/forums';

import Checkbox from 'lib/components/core/buttons/Checkbox';
import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { createForumTopicPost } from '../../operations';

interface ReplyValueProps {
  text: string;
  isAnonymous: boolean;
}

interface Props {
  postId: number;
  isReplying: boolean;
  isAnonymousEnabled: boolean;
  repliesTo: string;
  setIsReplying: Dispatch<SetStateAction<boolean>>;
  replyValue: ReplyValueProps;
  setReplyValue: Dispatch<SetStateAction<ReplyValueProps>>;
}

const translations = defineMessages({
  replySuccess: {
    id: 'course.forum.ReplyCard.replySuccess',
    defaultMessage: 'The reply post has been created.',
  },
  replyFailure: {
    id: 'course.forum.ReplyCard.replyFailure',
    defaultMessage: 'Failed to submit the post - {error}',
  },
  emptyPost: {
    id: 'course.forum.ReplyCard.emptyPost',
    defaultMessage: 'Post cannot be empty!',
  },
  replyTo: {
    id: 'course.forum.ReplyCard.replyTo',
    defaultMessage: 'Reply to {user}',
  },
  postAnonymously: {
    id: 'course.forum.ReplyCard.postAnonymously',
    defaultMessage: 'Anonymous post',
  },
});

const ReplyCard: FC<Props> = (props) => {
  const {
    postId,
    isReplying,
    isAnonymousEnabled,
    repliesTo: user,
    setIsReplying,
    replyValue,
    setReplyValue,
  } = props;
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const { t } = useTranslation();
  const { forumId: forumIdSlug, topicId: topicIdSlug } = useParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isReplying) {
      scroller.scrollTo(`postReplyElement_${postId}`, {
        duration: 200,
        smooth: true,
        offset: -400,
      });
    }
  }, [isReplying]);

  const handleReply = (): void => {
    setIsSubmittingReply(true);
    if (replyValue.text.trim() === '') {
      setIsSubmittingReply(false);
      toast.error(t(translations.emptyPost));
      return;
    }
    const forumPostFormData: ForumTopicPostFormData = {
      text: replyValue.text,
      isAnonymous: replyValue.isAnonymous,
      parentId: postId,
    };
    dispatch(
      createForumTopicPost(forumIdSlug!, topicIdSlug!, forumPostFormData),
    )
      .then((response) => {
        toast.success(t(translations.replySuccess));
        setIsReplying(false);
        setIsSubmittingReply(false);
        setReplyValue({
          text: '',
          isAnonymous: false,
        });
        scroller.scrollTo(`postElement_${response.postId}`, {
          duration: 200,
          smooth: true,
          offset: -400,
        });
      })
      .catch((error) => {
        setIsSubmittingReply(false);
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.replyFailure, {
            error: errorMessage,
          }),
        );
      });
  };

  return (
    <Element name={`postReplyElement_${postId}`}>
      <Card className="ml-20 mt-4">
        <CardContent className="pb-0">
          <CKEditorRichText
            autofocus
            disabled={isSubmittingReply}
            disableMargins
            inputId={postId.toString()}
            name={`postReplyText_${postId}`}
            onChange={(nextValue): void =>
              setReplyValue((prevState) => ({
                ...prevState,
                text: nextValue,
              }))
            }
            placeholder={t(translations.replyTo, { user })}
            value={replyValue.text}
          />
          {isAnonymousEnabled && (
            <Checkbox
              disabled={isSubmittingReply}
              label={t(translations.postAnonymously)}
              onChange={(event): void =>
                setReplyValue((prevState) => ({
                  ...prevState,
                  isAnonymous: event.target.checked,
                }))
              }
            />
          )}
        </CardContent>
        <CardActions className="pt-0">
          <Button
            className="cancel-reply-button"
            color="secondary"
            disabled={isSubmittingReply}
            id={`post_${postId}`}
            onClick={(): void => setIsReplying(false)}
          >
            {t(formTranslations.cancel)}
          </Button>
          <Button
            className="reply-button"
            color="primary"
            disabled={isSubmittingReply || replyValue.text === ''}
            id={`post_${postId}`}
            onClick={handleReply}
          >
            {t(formTranslations.reply)}
          </Button>
        </CardActions>
      </Card>
    </Element>
  );
};

export default ReplyCard;
