import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { ArrowBack, Check, Clear, Reply } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Avatar,
  CardHeader,
  IconButton,
  Rating,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { grey, orange } from '@mui/material/colors';
import { CommentPostMiniEntity } from 'types/course/comments';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import { useAppDispatch } from 'lib/hooks/store';
import { formatLongDateTime } from 'lib/moment';

import { deletePost, updatePostCodaveri } from '../../operations';

interface Props extends WrappedComponentProps {
  post: CommentPostMiniEntity;
}

const translations = defineMessages({
  finalise: {
    id: 'course.discussion.topics.CodaveriCommentCard.approve',
    defaultMessage: 'Finalise and Post Feedback',
  },
  rejectConfirmation: {
    id: 'course.discussion.topics.CodaveriCommentCard.deleteConfirmation',
    defaultMessage:
      'Are you sure you wish to reject and delete this feedback? You will not be able to retrieve this anymore.',
  },
  pleaseImprove: {
    id: 'course.discussion.topics.CodaveriCommentCard.pleaseImprove',
    defaultMessage: 'Please help to improve the feedback below!',
  },
  pleaseRate: {
    id: 'course.discussion.topics.CodaveriCommentCard.pleaseRate',
    defaultMessage: 'Please rate to continue!',
  },
  reject: {
    id: 'course.discussion.topics.CodaveriCommentCard.reject',
    defaultMessage: 'Reject Feedback',
  },
  revert: {
    id: 'course.discussion.topics.CodaveriCommentCard.revert',
    defaultMessage: 'Revert Feedback',
  },
  publishSuccess: {
    id: 'course.discussion.topics.CommentCard.publishSuccess',
    defaultMessage: 'Successfully published feedback.',
  },
  publishFailure: {
    id: 'course.discussion.topics.CommentCard.publishFailure',
    defaultMessage: 'Failed to publish feedback.',
  },
  rejectSuccess: {
    id: 'course.discussion.topics.CommentCard.rejectSuccess',
    defaultMessage: 'Successfully rejected feedback.',
  },
  rejectFailure: {
    id: 'course.discussion.topics.CommentCard.rejectFailure',
    defaultMessage: 'Failed to reject feedback.',
  },
});

const CodaveriCommentCard: FC<Props> = (props) => {
  const { intl, post } = props;
  const dispatch = useAppDispatch();
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectConfirmation, setRejectConfirmation] = useState(false);
  const [editValue, setEditValue] = useState(post.text);
  const [rating, setRating] = useState(0);

  const editPostIdentifier = (field: string): string => {
    return `edit_post_${field}`;
  };
  const postIdentifier = (field: string): string => {
    return `post_${field}`;
  };

  const updateComment = (): void => {
    dispatch(updatePostCodaveri(post, editValue, rating))
      .then(() => {
        toast.success(intl.formatMessage(translations.publishSuccess));
      })
      .catch(() => {
        toast.error(intl.formatMessage(translations.publishFailure));
        setIsSaving(false);
      });
  };

  const onConfirmReject = (): void => {
    setIsRejecting(true);
    dispatch(deletePost(post))
      .then(() => {
        toast.success(intl.formatMessage(translations.rejectSuccess));
      })
      .catch(() => {
        toast.error(intl.formatMessage(translations.rejectFailure));
        setRejectConfirmation(false);
        setIsRejecting(false);
      });
  };

  const onSave = (): void => {
    setIsSaving(true);
    if (editValue.trim() === '') {
      toast.error('Cannot be empty');
      setIsSaving(false);
      return;
    }
    updateComment();
  };

  const renderRating = (): JSX.Element | null => {
    if (!post.canUpdate) {
      return null;
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {editMode && (
          <IconButton
            onClick={(): void => {
              setRating(0);
              setEditMode(false);
            }}
            size="small"
          >
            <ArrowBack />
          </IconButton>
        )}
        <Rating
          max={5}
          name={`codaveri-feedback-rating-${post.id}`}
          onChange={(_event, newValue): void => {
            // To prevent the rating to be reset to null when clicking on the same previous rating
            if (newValue !== null) {
              setRating(newValue);
              if (!editMode) {
                setEditMode(true);
                setEditValue(post.text);
              }
            }
          }}
          size="medium"
          value={rating}
        />
        <Typography color={grey[800]} variant="subtitle1">
          {editMode
            ? intl.formatMessage(translations.pleaseImprove)
            : intl.formatMessage(translations.pleaseRate)}
        </Typography>
      </div>
    );
  };

  const renderCommentContent = (): JSX.Element => {
    if (editMode) {
      return (
        <>
          {renderRating()}
          <TextField
            key={editPostIdentifier(post.id.toString())}
            disabled={isSaving}
            fullWidth
            multiline
            onChange={(event): void => {
              setEditValue(event.target.value);
            }}
            rows={2}
            sx={{
              '& legend': { display: 'none' },
              '& fieldset': { top: 0 },
            }}
            type="text"
            value={editValue}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginRight: 5,
              marginBottom: 2,
            }}
          >
            <div>
              {editValue !== post.text && (
                <Tooltip title={intl.formatMessage(translations.revert)}>
                  <LoadingButton
                    className="revert-comment"
                    onClick={(): void => setEditValue(post.text)}
                  >
                    <Reply />
                  </LoadingButton>
                </Tooltip>
              )}
            </div>
            <div>
              <Tooltip title={intl.formatMessage(translations.reject)}>
                <LoadingButton
                  className="reject-comment"
                  disabled={isRejecting || isSaving}
                  loading={isRejecting}
                  onClick={(): void => {
                    setRejectConfirmation(true);
                  }}
                >
                  <Clear htmlColor={isRejecting || isSaving ? 'grey' : 'red'} />
                </LoadingButton>
              </Tooltip>
              <Tooltip title={intl.formatMessage(translations.finalise)}>
                <LoadingButton
                  className="approve-comment"
                  disabled={isRejecting || isSaving}
                  loading={isSaving}
                  onClick={onSave}
                >
                  <Check
                    htmlColor={isRejecting || isSaving ? 'grey' : 'green'}
                  />
                </LoadingButton>
              </Tooltip>
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: post.text }} />
        {renderRating()}
      </>
    );
  };

  return (
    <div
      id={postIdentifier(post.id.toString())}
      style={{
        marginBottom: 10,
        borderStyle: 'solid',
        borderWidth: 0.2,
        borderColor: grey[400],
        borderRadius: '5px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: orange[100],
          borderRadius: '5px 5px 0px 0px',
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              src={post.creator.imageUrl}
              style={{ height: '25px', width: '25px' }}
            />
          }
          style={{ padding: 6 }}
          subheader={formatLongDateTime(post.createdAt)}
          subheaderTypographyProps={{ display: 'block' }}
          title={post.creator.name}
          titleTypographyProps={{ display: 'block', marginright: 20 }}
        />
      </div>
      <div
        style={{
          wordWrap: 'break-word',
          padding: 7,
        }}
      >
        {renderCommentContent()}
      </div>
      <ConfirmationDialog
        confirmDelete
        disableCancelButton={isRejecting}
        disableConfirmButton={isRejecting}
        loadingConfirmButton={isRejecting}
        message={intl.formatMessage(translations.rejectConfirmation)}
        onCancel={(): void => setRejectConfirmation(false)}
        onConfirm={onConfirmReject}
        open={rejectConfirmation}
      />
    </div>
  );
};

export default injectIntl(CodaveriCommentCard);
