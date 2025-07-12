import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Done, Launch } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from '@mui/material';
import { red } from '@mui/material/colors';

import { generationActions as actions } from 'course/assessment/reducers/generation';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import {
  create,
  updateMcqMrq,
} from '../../../question/multiple-responses/operations';
import { getAssessmentGenerateQuestionsData } from '../selectors';
import { ConversationState, MrqPrototypeFormData } from '../types';
import { buildMrqQuestionDataFromPrototype } from '../utils';

interface Props {
  open: boolean;
  onClose: () => void;
}

const translations = defineMessages({
  exportDialogHeader: {
    id: 'course.assessment.generation.mrq.exportDialogHeader',
    defaultMessage: 'Export Questions ({exportCount} selected)',
  },
  exportAction: {
    id: 'course.assessment.generation.exportAction',
    defaultMessage: 'Export',
  },
  exportError: {
    id: 'course.assessment.generation.exportError',
    defaultMessage: 'An error occurred in exporting this question: {error}',
  },
  requireNonEmptyOptionError: {
    id: 'course.assessment.generation.requireNonEmptyOptionError',
    defaultMessage: 'Question must have at least one non-empty option',
  },
  untitledQuestion: {
    id: 'course.assessment.generation.untitledQuestion',
    defaultMessage: 'Untitled Question',
  },
});

const GenerateMrqExportDialog: FC<Props> = (props) => {
  const { open, onClose } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const generatePageData = useAppSelector(getAssessmentGenerateQuestionsData);

  const setToExport = (
    conversation: ConversationState,
    toExport: boolean,
  ): void => {
    dispatch(
      actions.setConversationToExport({
        conversationId: conversation.id,
        toExport,
      }),
    );
  };

  const handleExportError = async (
    conversation: ConversationState,
    exportErrorMessage?: string,
  ): Promise<void> => {
    dispatch(
      actions.exportConversationError({
        conversationId: conversation.id,
        exportErrorMessage,
      }),
    );
  };

  const handleExport = async (): Promise<void> => {
    // Only export conversations that have data AND are marked for export
    const conversationsToExport = Object.values(
      generatePageData.conversations,
    ).filter((conversation) => {
      const metadata = generatePageData.conversationMetadata[conversation.id];
      return conversation.toExport && metadata?.hasData;
    });

    conversationsToExport.forEach((conversation) => {
      dispatch(
        actions.exportConversation({
          conversationId: conversation.id,
        }),
      );

      // Build the question data from the conversation
      const questionData = buildMrqQuestionDataFromPrototype(
        conversation.activeSnapshotEditedData as MrqPrototypeFormData,
      );

      // Validate that we have at least one non-empty option
      const validOptions =
        questionData.options?.filter(
          (option) => option.option && option.option.trim().length > 0,
        ) || [];

      if (validOptions.length === 0) {
        handleExportError(
          conversation,
          t(translations.requireNonEmptyOptionError),
        );
        return;
      }

      // Create or update the question
      const operation =
        conversation.questionId === undefined
          ? create(questionData)
          : updateMcqMrq(conversation.questionId, questionData);

      operation
        .then((response) => {
          dispatch(
            actions.exportMrqConversationSuccess({
              conversationId: conversation.id,
              data: { redirectEditUrl: response.redirectUrl },
            }),
          );
        })
        .catch((error) => {
          handleExportError(
            conversation,
            error instanceof Error ? error.message : 'Unknown error',
          );
        });
    });
  };

  const exportErrorMessage = (conversation: ConversationState): string => {
    return t(translations.exportError, {
      error: conversation.exportErrorMessage ?? '',
    });
  };

  return (
    <Dialog
      className="top-10"
      fullWidth
      maxWidth="lg"
      onClose={onClose}
      open={open}
    >
      <DialogTitle>
        {t(translations.exportDialogHeader, {
          exportCount: generatePageData.exportCount,
        })}
      </DialogTitle>
      <DialogContent>
        {generatePageData.conversationIds.map((conversationId, index) => {
          const conversation = generatePageData.conversations[conversationId];
          const questionData = conversation?.activeSnapshotEditedData.question;
          const metadata =
            generatePageData.conversationMetadata[conversationId];
          if (!conversation || !questionData || !metadata?.hasData) return null;

          const title = metadata.title || t(translations.untitledQuestion);
          // Remove HTML tags from description
          const description = questionData.description
            ? questionData.description.replace(/<(\/)?[^>]+(>|$)/g, '')
            : '';

          return (
            <Paper
              key={conversationId}
              onClick={() => setToExport(conversation, !conversation.toExport)}
              variant="outlined"
            >
              <div className="flex flex-nowrap px-6 py-3 items-center">
                <Checkbox
                  checked={conversation.toExport}
                  className="py-0 pr-2 pl-0"
                />

                <Typography
                  className={conversation.toExport ? '' : 'line-through'}
                  color={conversation.toExport ? 'default' : 'gray'}
                >
                  {title}
                </Typography>

                <Box className="flex-1 full-width" />
                {conversation.exportStatus === 'pending' && (
                  <LoadingIndicator
                    bare
                    className="mr-2 text-gray-600"
                    size={15}
                  />
                )}
                {conversation.exportStatus === 'exported' && (
                  <Done className="mr-1 text-gray-600" fontSize="small" />
                )}
                {conversation.exportStatus === 'exported' &&
                  conversation.redirectEditUrl && (
                    <Link
                      onClick={(e) => e.stopPropagation()}
                      opensInNewTab
                      to={conversation.redirectEditUrl}
                      variant="subtitle1"
                    >
                      <Launch className="mt-2 ml-1" fontSize="small" />
                    </Link>
                  )}
              </div>

              <section className="space-y-4 px-6 mb-4">
                {description && (
                  <Typography
                    className={`${conversation.toExport ? '' : 'line-through'}`}
                    color={conversation.toExport ? 'default' : 'gray'}
                    variant="body2"
                  >
                    {description}
                  </Typography>
                )}
                {conversation.exportStatus === 'error' && (
                  <Typography color={red[700]} variant="caption">
                    {exportErrorMessage(conversation)}
                  </Typography>
                )}
              </section>
            </Paper>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button
          key="form-dialog-cancel-button"
          className="btn-cancel"
          color="secondary"
          onClick={onClose}
        >
          {t(formTranslations.close)}
        </Button>
        <Button
          className="btn-submit"
          color="primary"
          disabled={generatePageData.exportCount === 0}
          onClick={handleExport}
          variant="contained"
        >
          {t(translations.exportAction)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateMrqExportDialog;
