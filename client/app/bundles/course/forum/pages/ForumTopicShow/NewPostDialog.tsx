import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Add } from '@mui/icons-material';
import { Fab, Tooltip } from '@mui/material';
import { ForumTopicEntity } from 'types/course/forums';
import { AppDispatch } from 'types/store';

import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import FormDialogue from 'lib/components/form/FormDialogue';
import useTranslation from 'lib/hooks/useTranslation';

import { createForumTopicPost } from '../../operations';

interface Props {
  forumTopic: ForumTopicEntity;
}

const translations = defineMessages({
  header: {
    id: 'course.forum.topic.post.create.header',
    defaultMessage: 'Create a New Post',
  },
  creationSuccess: {
    id: 'course.forum.topic.post.create.success',
    defaultMessage: 'The post has been created.',
  },
  creationFailure: {
    id: 'course.forum.topic.post.create.fail',
    defaultMessage: 'Failed to create the post - {error}',
  },
});

const NewPostDialog: FC<Props> = (props) => {
  const { forumTopic } = props;
  const { t } = useTranslation();
  const { forumId, topicId } = useParams();
  const [open, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [post, setPost] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const canReplyTopic = forumTopic.permissions.canReplyTopic;
  const handleSubmit = (): void => {
    setIsSubmitting(true);
    if (post.trim() === '') {
      setIsSubmitting(false);
      toast.error('Post cannot be empty!');
      return;
    }
    dispatch(createForumTopicPost(forumId!, topicId!, post))
      .then(() => {
        toast.success(t(translations.creationSuccess));
        setPost('');
        // Scroll to bottom after creating a new post.
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth',
        });
        setIsSubmitting(false);
        setOpenDialog(false);
      })
      .catch((error) => {
        setIsSubmitting(false);
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.creationFailure, {
            error: errorMessage,
          }),
        );
      });
  };

  return (
    <>
      <Tooltip title={t(translations.header)}>
        <Fab
          className="new-post-button fixed bottom-20 right-20"
          color="primary"
          disabled={!canReplyTopic}
          onClick={(): void => setOpenDialog((prevValue) => !prevValue)}
        >
          <Add htmlColor="white" />
        </Fab>
      </Tooltip>

      {open && (
        <FormDialogue
          disabled={isSubmitting}
          hideForm={(): void => setOpenDialog(false)}
          open={open}
          skipConfirmation={true}
          submitForm={handleSubmit}
          title={t(translations.header)}
        >
          <CKEditorRichText
            disableMargins={true}
            inputId={forumTopic.id.toString()}
            name="postNewText"
            onChange={(nextValue): void => setPost(nextValue)}
            value={post}
          />
        </FormDialogue>
      )}
    </>
  );
};

export default NewPostDialog;
