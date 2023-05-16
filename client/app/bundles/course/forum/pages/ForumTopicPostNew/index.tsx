import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { scroller } from 'react-scroll';
import { toast } from 'react-toastify';
import { Add } from '@mui/icons-material';
import { Fab, Tooltip } from '@mui/material';
import { ForumTopicEntity, ForumTopicPostFormData } from 'types/course/forums';

import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import ForumTopicPostForm from '../../components/forms/ForumTopicPostForm';
import { createForumTopicPost } from '../../operations';

interface Props {
  forumTopic: ForumTopicEntity;
}

const translations = defineMessages({
  newPost: {
    id: 'course.forum.ForumTopicPostNew.newPost',
    defaultMessage: 'Create a New Post',
  },
  creationSuccess: {
    id: 'course.forum.ForumTopicPostNew.creationSuccess',
    defaultMessage: 'The post has been created.',
  },
  creationFailure: {
    id: 'course.forum.ForumTopicPostNew.creationFailure',
    defaultMessage: 'Failed to create the post - {error}',
  },
});

const initialValues = {
  text: '',
  parentId: null,
  isAnonymous: false,
};

const ForumTopicPostNew: FC<Props> = (props) => {
  const { forumTopic } = props;
  const { t } = useTranslation();
  const { forumId, topicId } = useParams();
  const [open, setOpenDialog] = useState(false);
  const dispatch = useAppDispatch();

  const handleSubmit = (data: ForumTopicPostFormData): Promise<void> =>
    dispatch(createForumTopicPost(forumId!, topicId!, data))
      .then((response) => {
        toast.success(t(translations.creationSuccess));
        setOpenDialog(false);
        scroller.scrollTo(`post_${response.postId}`, {
          duration: 200,
          smooth: true,
          offset: -400,
        });
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.creationFailure, {
            error: errorMessage,
          }),
        );
      });

  return (
    <>
      <Tooltip title={t(translations.newPost)}>
        <Fab
          className="new-post-button fixed bottom-20 right-20"
          color="primary"
          disabled={!forumTopic.permissions.canReplyTopic}
          onClick={(): void => setOpenDialog((prevValue) => !prevValue)}
        >
          <Add htmlColor="white" />
        </Fab>
      </Tooltip>

      {open && (
        <ForumTopicPostForm
          editing={false}
          initialValues={initialValues}
          isAnonymousEnabled={forumTopic.permissions.isAnonymousEnabled}
          onClose={(): void => setOpenDialog(false)}
          onSubmit={handleSubmit}
          open={open}
          title={t(translations.newPost)}
        />
      )}
    </>
  );
};

export default ForumTopicPostNew;
