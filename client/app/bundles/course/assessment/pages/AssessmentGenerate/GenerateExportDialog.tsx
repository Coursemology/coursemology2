import {
  Dispatch,
  FC,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
} from 'react';
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
import {
  LanguageData,
  PackageImportResultError,
} from 'types/course/assessment/question/programming';

import GlobalAPI from 'api';
import buildFormData from 'course/assessment/question/programming/commons/builder';
import { ImportResultErrorMapper } from 'course/assessment/question/programming/components/common/ImportResult';
import {
  create,
  fetchImportResult,
  update,
} from 'course/assessment/question/programming/operations';
import { generationActions as actions } from 'course/assessment/reducers/generation';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getAssessmentGenerateQuestionsData } from './selectors';
import { ConversationState } from './types';
import { buildQuestionDataFromPrototype } from './utils';

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  languages: LanguageData[];
  saveActiveFormData: () => void;
}

const translations = defineMessages({
  exportDialogHeader: {
    id: 'course.assessment.generation.exportDialogHeader',
    defaultMessage: 'Export Questions ({exportCount} selected)',
  },
  exportAction: {
    id: 'course.assessment.generation.exportAction',
    defaultMessage: 'Export',
  },
  exportClose: {
    id: 'course.assessment.generation.exportClose',
    defaultMessage: 'Close',
  },
  exportError: {
    id: 'course.assessment.generation.exportError',
    defaultMessage: 'An error occured in exporting this question: {error}',
  },
});

const GenerateExportDialog: FC<Props> = (props) => {
  const { open, setOpen, saveActiveFormData, languages } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const generatePageData = useAppSelector(getAssessmentGenerateQuestionsData);
  const interval: MutableRefObject<NodeJS.Timer | undefined> =
    useRef<NodeJS.Timer>();

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
    let exportError = PackageImportResultError.GENERIC_ERROR;
    if (conversation.questionId) {
      const importResult = await fetchImportResult(conversation.questionId);
      exportError = importResult.error ?? exportError;
      // exportErrorMessage in arguments will take precedence, in case a new error happens somewhere other than the import job.
      exportErrorMessage = exportErrorMessage ?? importResult.message;
    }
    dispatch(
      actions.exportConversationError({
        conversationId: conversation.id,
        exportError,
        exportErrorMessage,
      }),
    );
  };

  const pollQuestionExportJobs = (): void => {
    Object.values(generatePageData.conversations)
      .filter(
        (conversation) =>
          conversation.exportStatus === 'importing' &&
          conversation.importJobUrl,
      )
      .forEach((conversation) => {
        GlobalAPI.jobs
          .get(conversation.importJobUrl!)
          .then((response) => {
            if (response.data.status === 'completed') {
              dispatch(
                actions.exportConversationSuccess({
                  conversationId: conversation.id,
                }),
              );
            } else if (response.data.status === 'errored') {
              handleExportError(conversation);
            }
          })
          .catch((error) => {
            handleExportError(conversation, error.message);
          });
      });
  };

  useEffect(() => {
    interval.current = setInterval(pollQuestionExportJobs, 5000);
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  });

  const exportErrorMessage = (conversation: ConversationState): string => {
    if (
      !conversation.exportError ||
      conversation.exportError === PackageImportResultError.GENERIC_ERROR
    ) {
      return t(translations.exportError, {
        error: conversation.exportErrorMessage ?? '',
      });
    }
    // We reuse the same error messages as the main programming question page,
    // though the user should never see INVALID_PACKAGE error because it's entirely managed by us.
    return t(ImportResultErrorMapper[conversation.exportError]);
  };

  return (
    <Dialog
      className="top-10"
      fullWidth
      maxWidth="lg"
      onClose={() => {}}
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
                  {questionData.title}
                </Typography>

                <Box className="flex-1 full-width" />
                {(conversation.exportStatus === 'importing' ||
                  conversation.exportStatus === 'pending') && (
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
                <Typography
                  className={`${conversation.toExport ? '' : 'line-through'}`}
                  color={conversation.toExport ? 'default' : 'gray'}
                  dangerouslySetInnerHTML={{
                    __html: questionData.description,
                  }}
                  variant="body2"
                />
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
          onClick={() => setOpen(false)}
        >
          {t(translations.exportClose)}
        </Button>
        <Button
          className="btn-submit"
          color="primary"
          disabled={generatePageData.exportCount === 0}
          onClick={() => {
            saveActiveFormData();
            generatePageData.conversationIds
              .map((id) => {
                const conversation = generatePageData.conversations[id];
                const snapshot = conversation
                  ? conversation.snapshots[conversation.activeSnapshotId]
                  : undefined;
                return {
                  conversation,
                  snapshot,
                };
              })
              .filter(
                ({ conversation, snapshot }) =>
                  conversation?.toExport &&
                  snapshot &&
                  snapshot.state !== 'sentinel',
              )
              .forEach(({ conversation }, index) => {
                const questionData = conversation.activeSnapshotEditedData;
                const { codaveriData } =
                  conversation.snapshots[conversation.activeSnapshotId];
                const { id: languageId, editorMode: languageMode } =
                  languages.find(
                    (lang) => lang.id === codaveriData!.languageId,
                  )!;
                const formData = buildFormData(
                  buildQuestionDataFromPrototype(
                    questionData!,
                    languageId,
                    languageMode,
                  ),
                );
                dispatch(
                  actions.exportConversation({
                    conversationId: conversation.id,
                  }),
                );
                const operation =
                  conversation.questionId === undefined
                    ? create(formData)
                    : update(conversation.questionId, formData);
                operation
                  .then((response) => {
                    if (response.importJobUrl) {
                      dispatch(
                        actions.exportConversationPendingImport({
                          conversationId: conversation.id,
                          data: response,
                        }),
                      );
                    } else {
                      dispatch(
                        actions.exportConversationSuccess({
                          conversationId: conversation.id,
                          data: response,
                        }),
                      );
                    }
                  })
                  .catch((error) => {
                    handleExportError(conversation, error.message);
                  });
              });
          }}
          variant="contained"
        >
          {t(translations.exportAction)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateExportDialog;
