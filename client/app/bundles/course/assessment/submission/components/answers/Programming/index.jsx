import { useRef, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { Close, ThumbDown, ThumbUp } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { green, grey, orange, red, yellow } from '@mui/material/colors';
import PropTypes from 'prop-types';

import { getIsSavingAnswer } from 'course/assessment/submission/selectors/answerFlags';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';

import actionTypes from '../../../constants';
import CodaveriFeedbackStatus from '../../../containers/CodaveriFeedbackStatus';
import ProgrammingImportEditor from '../../../containers/ProgrammingImport/ProgrammingImportEditor';
import { questionShape } from '../../../propTypes';
import { parseLanguages } from '../../../utils';

import ProgrammingFile from './ProgrammingFile';

const styles = {
  card: {
    marginBottom: 1,
    borderStyle: 'solid',
    borderWidth: 1.0,
    borderColor: grey[400],
    borderRadius: 2,
    boxShadow: 'none',
    minWidth: '300px',
    maxWidth: '300px',
  },
  cardActions: {
    px: 0,
    paddingTop: 0.5,
    paddingBottom: 0,
    display: 'flex',
  },
  cardContent: {
    px: 1,
    paddingTop: 0,
    '&:last-child': {
      paddingBottom: 1,
    },
  },
  cardSelected: {
    backgroundColor: yellow[100],
  },
  headerSelected: {
    backgroundColor: orange.A100,
  },
  cardResolved: {
    borderColor: '#cecece',
    backgroundColor: green[100],
    color: grey[600],
  },
  cardDismissed: {
    borderColor: '#cecece',
    backgroundColor: red[100],
    color: grey[600],
  },
  cardActionButton: {
    opacity: 1.0,
    marginX: -0.5,
    padding: 0.4,
    transform: 'scale(0.86)',
    transformOrigin: 'right',
  },
  cardActionButtonHighlightOnResolve: {
    '&:disabled': {
      color: green.A700,
    },
  },
  cardActionButtonHighlightOnDismiss: {
    '&:disabled': {
      color: red.A700,
    },
  },
  drawerPaper: {
    position: 'absolute',
    width: '315px',
    alignContent: 'start',
    border: 0,
  },
  drawerModal: {
    alignContent: 'start',
    position: 'absolute',
  },
};

const translations = defineMessages({
  lineHeader: {
    id: 'course.assessment.submission.answers.Programming.ProgrammingFiles.liveFeedbackItemLineHeading',
    defaultMessage: 'Line {linenum}',
  },
  likeItem: {
    id: 'course.assessment.submission.answers.Programming.ProgrammingFiles.liveFeedbackItemLike',
    defaultMessage: 'Like',
  },
  dislikeItem: {
    id: 'course.assessment.submission.answers.Programming.ProgrammingFiles.liveFeedbackItemDislike',
    defaultMessage: 'Dislike',
  },
  deleteItem: {
    id: 'course.assessment.submission.answers.Programming.ProgrammingFiles.liveFeedbackItemDelete',
    defaultMessage: 'Dismiss',
  },
});

const ProgrammingFiles = ({
  readOnly,
  questionId,
  answerId,
  language,
  feedbackFiles,
  saveAnswerAndUpdateClientVersion,
}) => {
  const { control } = useFormContext();

  const { fields } = useFieldArray({
    control,
    name: `${answerId}.files_attributes`,
  });

  const currentField = useWatch({
    control,
    name: `${answerId}.files_attributes`,
  });

  const editorRef = useRef(null);
  const [selectedLine, setSelectedLine] = useState(null);

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const onEditorCursorChange = (selection) => {
    const selectedRow = selection?.cursor?.row;
    if (selectedRow || selectedRow === 0) {
      setSelectedLine(selectedRow + 1);
    }
  };

  const renderFeedbackCard = (feedbackItem) => {
    let cardStyle = styles.card;
    if (feedbackItem.state === 'resolved') {
      cardStyle = { ...styles.card, ...styles.cardResolved };
    } else if (feedbackItem.state === 'dismissed') {
      cardStyle = { ...styles.card, ...styles.cardDismissed };
    } else if (selectedLine === feedbackItem.linenum) {
      cardStyle = { ...styles.card, ...styles.cardSelected };
    }

    const feedbackTooltipProps = {
      placement: 'top',
      slotProps: {
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -6],
              },
            },
          ],
        },
      },
    };

    const focusEditorOnFeedbackLine = () => {
      editorRef.current?.editor?.gotoLine(feedbackItem.linenum, 0);
      editorRef.current?.editor?.selection?.setAnchor(
        feedbackItem.linenum - 1,
        0,
      );
      editorRef.current?.editor?.selection?.moveCursorTo(
        feedbackItem.linenum - 1,
        0,
      );
      editorRef.current?.editor?.focus();
    };

    const renderLikeButton = () => (
      <Tooltip title={t(translations.likeItem)} {...feedbackTooltipProps}>
        <IconButton
          disabled={feedbackItem.state === 'resolved'}
          onClick={() => {
            dispatch({
              type: actionTypes.LIVE_FEEDBACK_ITEM_MARK_RESOLVED,
              payload: {
                questionId,
                path: 'main.py',
                lineId: feedbackItem.id,
              },
            });
          }}
          sx={{
            ...styles.cardActionButton,
            ...styles.cardActionButtonHighlightOnResolve,
          }}
        >
          <ThumbUp />
        </IconButton>
      </Tooltip>
    );

    const renderDislikeButton = () => (
      <Tooltip title={t(translations.dislikeItem)} {...feedbackTooltipProps}>
        <IconButton
          disabled={feedbackItem.state === 'dismissed'}
          onClick={() => {
            dispatch({
              type: actionTypes.LIVE_FEEDBACK_ITEM_MARK_DISMISSED,
              payload: {
                questionId,
                path: 'main.py',
                lineId: feedbackItem.id,
              },
            });
          }}
          sx={{
            ...styles.cardActionButton,
            ...styles.cardActionButtonHighlightOnDismiss,
          }}
        >
          <ThumbDown />
        </IconButton>
      </Tooltip>
    );

    const renderDeleteButton = () => (
      <Tooltip title={t(translations.deleteItem)} {...feedbackTooltipProps}>
        <IconButton
          onClick={() => {
            dispatch({
              type: actionTypes.LIVE_FEEDBACK_ITEM_DELETE,
              payload: {
                questionId,
                path: 'main.py',
                lineId: feedbackItem.id,
              },
            });
          }}
          sx={{ ...styles.cardActionButton, marginRight: 1 }}
        >
          <Close />
        </IconButton>
      </Tooltip>
    );

    return (
      <Card sx={cardStyle}>
        <CardActions
          onClick={focusEditorOnFeedbackLine}
          sx={styles.cardActions}
        >
          <Typography fontWeight="bold" sx={{ ml: 1 }} variant="subtitle1">
            {t(translations.lineHeader, { linenum: feedbackItem.linenum })}
          </Typography>
          <Box sx={{ flex: '1', width: '100%' }} />
          {renderLikeButton()}
          {renderDislikeButton()}
          {renderDeleteButton()}
        </CardActions>
        <CardContent
          onClick={focusEditorOnFeedbackLine}
          sx={styles.cardContent}
        >
          <Typography variant="body2">{feedbackItem.feedback}</Typography>
        </CardContent>
      </Card>
    );
  };

  const renderFeedbackDrawer = (keyString, annotations) => (
    <Drawer
      anchor="right"
      ModalProps={{
        container: document.getElementById(keyString),
        style: styles.drawerModal,
      }}
      // as long as the drawer is rendered, it is open
      open
      PaperProps={{ style: styles.drawerPaper }}
      variant="persistent"
    >
      <div>{annotations.map(renderFeedbackCard)}</div>
    </Drawer>
  );

  const controlledProgrammingFields = fields.map((field, index) => ({
    ...field,
    ...currentField[index],
  }));

  return controlledProgrammingFields.map((field, index) => {
    const file = {
      id: field.id,
      filename: field.filename,
      content: field.content,
      highlightedContent: field.highlightedContent,
    };

    let annotations = feedbackFiles[field.filename] ?? [];
    // TODO: remove special casing around Codaveri name coercion issue
    if (
      index === 0 &&
      !controlledProgrammingFields.some((elem) => elem.filename === 'main.py')
    ) {
      annotations = feedbackFiles['main.py'] ?? [];
    }
    const keyString = `editor-container-${index}`;
    const shouldRenderDrawer = annotations.length > 0;

    return (
      <div key={keyString} id={keyString} style={{ position: 'relative' }}>
        <Box marginRight={shouldRenderDrawer ? '315px' : '0px'}>
          <ProgrammingFile
            key={field.id}
            answerId={answerId}
            editorRef={editorRef}
            fieldName={`${answerId}.files_attributes.${index}.content`}
            file={file}
            language={language}
            onCursorChange={onEditorCursorChange}
            readOnly={readOnly}
            saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
          />
        </Box>
        {shouldRenderDrawer && renderFeedbackDrawer(keyString, annotations)}
      </div>
    );
  });
};

const Programming = (props) => {
  const { question, readOnly, answerId, saveAnswerAndUpdateClientVersion } =
    props;
  const fileSubmission = question.fileSubmission;
  const isSavingAnswer = useAppSelector((state) =>
    getIsSavingAnswer(state, answerId),
  );

  const feedbackFiles = useAppSelector(
    (state) =>
      state.assessments.submission.liveFeedback?.feedbackByQuestion?.[
        question.id
      ]?.feedbackFiles ?? [],
  );

  return (
    <div className="mt-5">
      {fileSubmission ? (
        <ProgrammingImportEditor
          key={question.id}
          answerId={answerId}
          isSavingAnswer={isSavingAnswer}
          question={question}
          readOnly={readOnly}
          saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
        />
      ) : (
        <ProgrammingFiles
          key={question.id}
          answerId={answerId}
          feedbackFiles={feedbackFiles}
          language={parseLanguages(question.language)}
          questionId={question.id}
          readOnly={readOnly}
          saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
        />
      )}
      <CodaveriFeedbackStatus answerId={answerId} questionId={question.id} />
    </div>
  );
};

Programming.propTypes = {
  question: questionShape.isRequired,
  readOnly: PropTypes.bool.isRequired,
  answerId: PropTypes.number.isRequired,
  saveAnswerAndUpdateClientVersion: PropTypes.func.isRequired,
};

export default Programming;
