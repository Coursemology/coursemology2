import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  CardHeader,
  IconButton,
  Rating,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { orange, grey } from '@mui/material/colors';
import { ArrowBack, Check, Clear, Reply } from '@mui/icons-material';
import { defineMessages, injectIntl } from 'react-intl';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import moment from 'lib/moment';
import { postShape } from '../../propTypes';

const translations = defineMessages({
  finalise: {
    id: 'course.assessment.submission.CodaveriCommentCard.approve',
    defaultMessage: 'Finalise and Post Feedback',
  },
  rejectConfirmation: {
    id: 'course.assessment.submission.CodaveriCommentCard.deleteConfirmation',
    defaultMessage:
      'Are you sure you wish to reject and delete this feedback? You will not be able to retrieve this anymore.',
  },
  pleaseImprove: {
    id: 'course.assessment.submission.CodaveriCommentCard.pleaseImprove',
    defaultMessage: 'Please help to improve the feedback below!',
  },
  pleaseRate: {
    id: 'course.assessment.submission.CodaveriCommentCard.pleaseRate',
    defaultMessage: 'Please rate to continue!',
  },
  reject: {
    id: 'course.assessment.submission.CodaveriCommentCard.reject',
    defaultMessage: 'Reject Feedback',
  },
  revert: {
    id: 'course.assessment.submission.CodaveriCommentCard.revert',
    defaultMessage: 'Revert Feedback',
  },
});

const styles = {
  avatar: {
    height: '25px',
    width: '25px',
  },
  card: {
    marginBottom: 10,
    borderStyle: 'solid',
    borderWidth: 0.2,
    borderColor: grey[400],
    borderRadius: 3,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: orange[100],
    borderRadius: 3,
  },
  cardHeader: {
    padding: 6,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginRight: 5,
    marginBottom: 2,
  },
  headerButton: {
    height: 35,
    width: 40,
    minWidth: 40,
  },
  headerButtonHidden: {
    height: 35,
    width: 40,
    minWidth: 40,
  },
  commentContent: {
    wordWrap: 'break-word',
    padding: 7,
  },
};

const editPostIdentifier = (field) => `edit_post_${field}`;

const formatDateTime = (dateTime) =>
  dateTime ? moment(dateTime).format('MMM DD, YYYY h:mma') : null;

const postIdentifier = (field) => `post_${field}`;

const CodaveriCommentCard = (props) => {
  const {
    editValue,
    handleChange,
    updateComment,
    deleteComment,
    post: {
      creator: { name, avatar },
      createdAt,
      canUpdate,
      formattedText,
      id,
      text,
      codaveriFeedback,
    },
    intl,
  } = props;
  const [editMode, setEditMode] = useState(false);
  const [rejectConfirmation, setRejectConfirmation] = useState(false);
  const [rating, setRating] = useState(0);

  const onConfirmReject = () => {
    deleteComment();
    setRejectConfirmation(false);
    setEditMode(false);
  };

  const onSave = () => {
    updateComment(id, codaveriFeedback.id, editValue, rating, 'accepted');
    setEditMode(false);
  };

  const renderRating = () => {
    if (!canUpdate) {
      return null;
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {editMode && (
          <IconButton
            onClick={() => {
              setRating(null);
              setEditMode(false);
              handleChange(text);
            }}
            size="small"
          >
            <ArrowBack />
          </IconButton>
        )}
        <Rating
          name={`codaveri-feedback-rating-${id}`}
          value={rating}
          max={5}
          onChange={(event, newValue) => {
            // To prevent the rating to be reset to null when clicking on the same previous rating
            if (newValue !== null) {
              setRating(newValue);
              if (!editMode) {
                setEditMode(true);
                handleChange(text);
              }
            }
          }}
          size="medium"
        />
        <Typography
          color={grey[600]}
          style={{ fontSize: 13, marginBottom: '5px' }}
        >
          {editMode
            ? intl.formatMessage(translations.pleaseImprove)
            : intl.formatMessage(translations.pleaseRate)}
        </Typography>
      </div>
    );
  };

  const renderCommentContent = () => {
    if (editMode) {
      return (
        <>
          {renderRating()}
          <TextField
            key={editPostIdentifier(id)}
            fullWidth
            multiline
            onChange={(event) => {
              handleChange(event.target.value);
            }}
            rows={2}
            sx={{
              '& legend': { display: 'none' },
              '& fieldset': { top: 0 },
            }}
            type="text"
            value={editValue}
          />
          <div style={styles.buttonContainer}>
            <div>
              {editValue !== text && (
                <Tooltip title={intl.formatMessage(translations.revert)}>
                  <IconButton
                    className="revert-comment"
                    onClick={() => handleChange(text)}
                    style={styles.headerButton}
                  >
                    <Reply />
                  </IconButton>
                </Tooltip>
              )}
            </div>
            <div>
              <Tooltip title={intl.formatMessage(translations.reject)}>
                <IconButton
                  className="reject-comment"
                  onClick={() => {
                    setRejectConfirmation(true);
                  }}
                  style={styles.headerButton}
                >
                  <Clear htmlColor="red" />
                </IconButton>
              </Tooltip>
              <Tooltip title={intl.formatMessage(translations.finalise)}>
                <IconButton
                  className="approve-comment"
                  onClick={onSave}
                  style={styles.headerButton}
                >
                  <Check htmlColor="green" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: formattedText }} />
        {renderRating()}
      </>
    );
  };

  return (
    <div id={postIdentifier(id)} style={styles.card}>
      <div style={styles.header}>
        <CardHeader
          avatar={<Avatar src={avatar} style={styles.avatar} />}
          title={name}
          titleTypographyProps={{ display: 'block', marginright: 20 }}
          subheader={formatDateTime(createdAt)}
          subheaderTypographyProps={{ display: 'block' }}
          style={styles.cardHeader}
        />
      </div>
      <div style={styles.commentContent}>{renderCommentContent()}</div>
      <ConfirmationDialog
        confirmDelete
        open={rejectConfirmation}
        message={intl.formatMessage(translations.rejectConfirmation)}
        onCancel={() => setRejectConfirmation(false)}
        onConfirm={onConfirmReject}
      />
    </div>
  );
};

CodaveriCommentCard.propTypes = {
  post: postShape.isRequired,
  editValue: PropTypes.string,

  handleChange: PropTypes.func,
  updateComment: PropTypes.func,
  deleteComment: PropTypes.func,

  intl: PropTypes.object,
};

export default injectIntl(CodaveriCommentCard);
