import { FC, ReactNode, useState } from 'react';
import { defineMessages } from 'react-intl';
import { ArrowBack, Check, Clear, Reply } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  CardHeader,
  IconButton,
  Rating,
  Tooltip,
  Typography,
} from '@mui/material';
import { grey, orange } from '@mui/material/colors';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import UserHTMLText from 'lib/components/core/UserHTMLText';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

interface RateableGeneratedCommentCardProps {
  postId: number;
  text: string;
  // Injected by the caller so the avatar matches the surrounding post cards on that page (submissions,
  // comments center and forum use different avatar sizes/styles).
  avatar?: ReactNode;
  createdAt: string | number | Date;
  canUpdate: boolean;
  currentRating: number | null;
  // Persist the numeric rating (or null to clear it via the "Back" action). Called before the accept/reject
  // post action.
  onRate: (rating: number | null) => Promise<void>;
  // Publish the post (take it out of draft); the server snapshots the edited content into the rating.
  onAccept: (editValue: string) => Promise<void>;
  // Persist the edit then delete the post; the before-destroy hook snapshots the edited content.
  onReject: (editValue: string) => Promise<void>;
}

const translations = defineMessages({
  title: {
    id: 'lib.components.RateableGeneratedCommentCard.title',
    defaultMessage: 'AI Generated Comment',
  },
  finalise: {
    id: 'lib.components.RateableGeneratedCommentCard.approve',
    defaultMessage: 'Finalise and Publish',
  },
  rejectConfirmation: {
    id: 'lib.components.RateableGeneratedCommentCard.deleteConfirmation',
    defaultMessage:
      'Are you sure you wish to reject and delete this message? You will not be able to retrieve this anymore.',
  },
  pleaseImprove: {
    id: 'lib.components.RateableGeneratedCommentCard.pleaseImprove',
    defaultMessage: 'Please help to improve the comment below!',
  },
  pleaseRate: {
    id: 'lib.components.RateableGeneratedCommentCard.pleaseRate',
    defaultMessage: 'Please rate to continue!',
  },
  reject: {
    id: 'lib.components.RateableGeneratedCommentCard.reject',
    defaultMessage: 'Reject',
  },
  revert: {
    id: 'lib.components.RateableGeneratedCommentCard.revert',
    defaultMessage: 'Revert Feedback',
  },
  publishSuccess: {
    id: 'lib.components.RateableGeneratedCommentCard.publishSuccess',
    defaultMessage: 'Successfully published feedback.',
  },
  publishFailure: {
    id: 'lib.components.RateableGeneratedCommentCard.publishFailure',
    defaultMessage: 'Failed to publish feedback.',
  },
  rejectSuccess: {
    id: 'lib.components.RateableGeneratedCommentCard.rejectSuccess',
    defaultMessage: 'Successfully rejected feedback.',
  },
  rejectFailure: {
    id: 'lib.components.RateableGeneratedCommentCard.rejectFailure',
    defaultMessage: 'Failed to reject feedback.',
  },
  emptyError: {
    id: 'lib.components.RateableGeneratedCommentCard.emptyError',
    defaultMessage: 'Feedback cannot be empty.',
  },
  clearFailure: {
    id: 'lib.components.RateableGeneratedCommentCard.clearFailure',
    defaultMessage: 'Failed to clear rating.',
  },
});

/**
 * Presentation-only card for rating and finalising an AI-generated feedback post. The staff member first
 * rates, which enables editing; they then accept (publish) or reject (delete). The rate/accept/reject actions
 * are injected so the same card serves both rubric feedback and RagWise answers -- each caller wires its own
 * endpoints (the server snapshots the edited content from the post lifecycle). Modelled on CodaveriCommentCard.
 */
const RateableGeneratedCommentCard: FC<RateableGeneratedCommentCardProps> = (
  props,
) => {
  const {
    postId,
    text,
    avatar,
    createdAt,
    canUpdate,
    currentRating,
    onRate,
    onAccept,
    onReject,
  } = props;
  const { t } = useTranslation();
  // A rating already exists when the staff member rated (phase 1) but hasn't yet accepted/rejected. Resume
  // directly in edit mode so they can adjust and decide; the un-rated flow instead starts collapsed (rate to
  // continue). Without this, re-entering edit would require changing the score -- and re-clicking the same
  // star deselects it in MUI -- leaving a resumed rating unable to reach the accept/reject controls.
  const hasExistingRating = currentRating !== null;
  const [editMode, setEditMode] = useState(hasExistingRating);
  const [isSaving, setIsSaving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectConfirmation, setRejectConfirmation] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const [rating, setRating] = useState(currentRating ?? 0);

  const onSave = (): void => {
    if (editValue.trim() === '') {
      toast.error(t(translations.emptyError));
      return;
    }
    setIsSaving(true);
    onRate(rating)
      .then(() => onAccept(editValue))
      .then(() => {
        toast.success(t(translations.publishSuccess));
      })
      .catch(() => {
        toast.error(t(translations.publishFailure));
        setIsSaving(false);
      });
  };

  const onConfirmReject = (): void => {
    setIsRejecting(true);
    onRate(rating)
      .then(() => onReject(editValue))
      .then(() => {
        toast.success(t(translations.rejectSuccess));
      })
      .catch(() => {
        toast.error(t(translations.rejectFailure));
        setRejectConfirmation(false);
        setIsRejecting(false);
      });
  };

  // "Back" clears the rating: nullify it on the server and collapse to the un-rated (rate-to-continue) state.
  const onClearRating = (): void => {
    onRate(null)
      .then(() => {
        setRating(0);
        setEditMode(false);
        setEditValue(text);
      })
      .catch(() => {
        toast.error(t(translations.clearFailure));
      });
  };

  const renderRating = (): JSX.Element | null => {
    if (!canUpdate) {
      return null;
    }
    return (
      <div className="flex items-center">
        {editMode && (
          <IconButton
            disabled={isSaving || isRejecting}
            onClick={onClearRating}
            size="small"
          >
            <ArrowBack />
          </IconButton>
        )}
        <Rating
          max={5}
          name={`ai-generated-rating-${postId}`}
          onChange={(_event, newValue): void => {
            // Avoid resetting to null when the same rating is clicked again.
            if (newValue !== null) {
              setRating(newValue);
              if (!editMode) {
                setEditMode(true);
                setEditValue(text);
              }
            }
          }}
          size="medium"
          value={rating}
        />
        <Typography className="text-gray-600 px-3" variant="caption">
          {editMode
            ? t(translations.pleaseImprove)
            : t(translations.pleaseRate)}
        </Typography>
      </div>
    );
  };

  const renderCommentContent = (): JSX.Element => {
    if (editMode) {
      return (
        <>
          {renderRating()}
          <CKEditorRichText
            disabled={isSaving || isRejecting}
            disableMargins
            inputId={`edit_post_${postId}`}
            name={`edit_post_${postId}`}
            onChange={(nextValue): void => setEditValue(nextValue)}
            value={editValue}
          />
          <div className="flex items-center justify-between mb-2">
            <div>
              {editValue !== text && (
                <Tooltip title={t(translations.revert)}>
                  <LoadingButton
                    className="revert-comment"
                    onClick={(): void => setEditValue(text)}
                  >
                    <Reply />
                  </LoadingButton>
                </Tooltip>
              )}
            </div>
            <div>
              <Tooltip title={t(translations.reject)}>
                <LoadingButton
                  className="reject-comment"
                  color="error"
                  disabled={isRejecting || isSaving}
                  loading={isRejecting}
                  onClick={(): void => setRejectConfirmation(true)}
                >
                  <Clear htmlColor={isRejecting || isSaving ? 'grey' : 'red'} />
                </LoadingButton>
              </Tooltip>
              <Tooltip title={t(translations.finalise)}>
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
        <UserHTMLText html={text} />
        {renderRating()}
      </>
    );
  };

  return (
    <div
      id={`post_${postId}`}
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
          avatar={avatar}
          className="p-2"
          subheader={formatLongDateTime(createdAt)}
          subheaderTypographyProps={{ display: 'block' }}
          title={t(translations.title)}
          titleTypographyProps={{ display: 'block', marginright: 20 }}
        />
      </div>
      <div style={{ wordWrap: 'break-word', padding: 7 }}>
        {renderCommentContent()}
      </div>
      <ConfirmationDialog
        confirmDelete
        disableCancelButton={isRejecting}
        disableConfirmButton={isRejecting}
        loadingConfirmButton={isRejecting}
        message={t(translations.rejectConfirmation)}
        onCancel={(): void => setRejectConfirmation(false)}
        onConfirm={onConfirmReject}
        open={rejectConfirmation}
      />
    </div>
  );
};

export default RateableGeneratedCommentCard;
