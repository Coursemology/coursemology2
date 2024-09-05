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
import { LanguageData } from 'types/course/assessment/question/programming';

import GlobalAPI from 'api';
import buildFormData from 'course/assessment/question/programming/commons/builder';
import {
  create,
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
  assessmentAutograded: boolean;
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
    defaultMessage: 'An error occured in exporting this question.',
  },
});

const GenerateExportDialog: FC<Props> = (props) => {
  const { open, setOpen, saveActiveFormData, assessmentAutograded, languages } =
    props;
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
              dispatch(
                actions.exportConversationError({
                  conversationId: conversation.id,
                }),
              );
            }
          })
          .catch((error) => {
            dispatch(
              actions.exportConversationError({
                conversationId: conversation.id,
              }),
            );
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
                    {t(translations.exportError)}
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
                  conversation?.toExport && snapshot,
              )
              .forEach(({ conversation }) => {
                saveActiveFormData();
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
                    assessmentAutograded,
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
                    dispatch(
                      actions.exportConversationError({
                        conversationId: conversation.id,
                      }),
                    );
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
