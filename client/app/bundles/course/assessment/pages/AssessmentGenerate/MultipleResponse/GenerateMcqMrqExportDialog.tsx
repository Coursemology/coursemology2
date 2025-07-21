import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Done, ExpandLess, ExpandMore, Launch } from '@mui/icons-material';
import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Radio,
  Typography,
} from '@mui/material';
import { red } from '@mui/material/colors';

import { generationActions as actions } from 'course/assessment/reducers/generation';
import Checkbox from 'lib/components/core/buttons/Checkbox';
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
import { ConversationState, McqMrqPrototypeFormData } from '../types';
import { buildMcqMrqQuestionDataFromPrototype } from '../utils';

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
    id: 'course.assessment.generation.mrq.exportAction',
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
  showOptions: {
    id: 'course.assessment.question.multipleResponses.showOptions',
    defaultMessage: 'Show Options',
  },
  hideOptions: {
    id: 'course.assessment.question.multipleResponses.hideOptions',
    defaultMessage: 'Hide Options',
  },
  noOptions: {
    id: 'course.assessment.question.multipleResponses.noOptions',
    defaultMessage: 'No options',
  },
});

const GenerateMcqMrqExportDialog: FC<Props> = (props) => {
  const { open, onClose } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const generatePageData = useAppSelector(getAssessmentGenerateQuestionsData);

  // State to track which questions have expanded options
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set(),
  );

  const toggleExpanded = (conversationId: string): void => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(conversationId)) {
      newExpanded.delete(conversationId);
    } else {
      newExpanded.add(conversationId);
    }
    setExpandedQuestions(newExpanded);
  };

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
    // Only export conversations that are marked for export
    const conversationsToExport = Object.values(
      generatePageData.conversations,
    ).filter((conversation) => conversation.toExport);

    conversationsToExport.forEach((conversation) => {
      dispatch(
        actions.exportConversation({
          conversationId: conversation.id,
        }),
      );

      // Build the question data from the conversation
      const isCreate = conversation.questionId === undefined;
      const questionData = buildMcqMrqQuestionDataFromPrototype(
        conversation.activeSnapshotEditedData as McqMrqPrototypeFormData,
        isCreate,
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
            actions.exportMcqMrqConversationSuccess({
              conversationId: conversation.id,
              data: response.redirectEditUrl
                ? { redirectEditUrl: response.redirectEditUrl }
                : undefined,
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

          // Get options from the conversation data
          const options =
            (conversation.activeSnapshotEditedData as McqMrqPrototypeFormData)
              ?.options || [];
          const hasOptions = options.length > 0;
          const isExpanded = expandedQuestions.has(conversationId);

          return (
            <Paper key={conversationId} variant="outlined">
              <div className="flex flex-wrap px-6 py-3 items-start">
                <Checkbox
                  checked={conversation.toExport}
                  className="py-0 pr-2 pl-0 flex-shrink-0"
                  onClick={() =>
                    setToExport(conversation, !conversation.toExport)
                  }
                />

                <Typography
                  className={`${conversation.toExport ? '' : 'line-through'} flex-1 min-w-0`}
                  color={conversation.toExport ? 'default' : 'gray'}
                >
                  {title}
                </Typography>

                <div className="flex-shrink-0 ml-auto">
                  {/* Options expand/collapse button */}
                  {hasOptions && (
                    <Button
                      className="mr-2 whitespace-nowrap"
                      endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(conversationId);
                      }}
                      size="small"
                      variant="outlined"
                    >
                      {isExpanded
                        ? t(translations.hideOptions)
                        : t(translations.showOptions)}
                    </Button>
                  )}
                </div>

                {conversation.exportStatus === 'pending' && (
                  <LoadingIndicator
                    bare
                    className="mr-2 text-gray-600"
                    size={15}
                  />
                )}
                {conversation.exportStatus === 'exported' && (
                  <Done className="mr-1 mt-2 text-green-600" fontSize="small" />
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

                {/* Collapsible options section */}
                <Collapse in={isExpanded}>
                  <div className="space-y-2 mt-4">
                    {hasOptions ? (
                      options.map((option) => {
                        // Determine if this is MCQ or MRQ based on gradingScheme
                        const isMcq =
                          (
                            conversation.activeSnapshotEditedData as McqMrqPrototypeFormData
                          )?.gradingScheme === 'any_correct';

                        return (
                          <Checkbox
                            key={option.id}
                            checked={option.correct}
                            className="text-neutral-500"
                            component={isMcq ? Radio : undefined}
                            dangerouslySetInnerHTML={{ __html: option.option }}
                            labelClassName="items-start"
                            readOnly
                            variant="body2"
                          />
                        );
                      })
                    ) : (
                      <Typography
                        className="italic text-neutral-500"
                        variant="body2"
                      >
                        {t(translations.noOptions)}
                      </Typography>
                    )}
                  </div>
                </Collapse>

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

export default GenerateMcqMrqExportDialog;
