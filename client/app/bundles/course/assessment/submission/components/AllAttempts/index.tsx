import {
  FC,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { LinearScale, TableRows } from '@mui/icons-material';
import { Alert, Button, ButtonGroup, Tooltip } from '@mui/material';

import { fetchSubmissionQuestionDetails } from 'course/assessment/operations/statistics';
import Prompt from 'lib/components/core/dialogs/Prompt';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';
import messagesTranslations from 'lib/translations/messages';

import { historyActions } from '../../reducers/history';
import { getSubmissionQuestionHistory } from '../../selectors/history';

import AllAttemptsQuestion from './AllAttemptsQuestion';
import AllAttemptsSequenceView from './AllAttemptsSequenceView';
import AllAttemptsTimelineView from './AllAttemptsTimelineView';
import Comment from './Comment';

type ViewType = 'timeline' | 'sequence';
interface ViewTypeButtonProps {
  title: string;
  children: ReactElement;
  onClick: MouseEventHandler<HTMLButtonElement>;
  selected: boolean;
}

const ViewTypeButton: FC<ViewTypeButtonProps> = (props) => (
  <Button
    // override default styles to prevent rounding inner corners in button group
    classes={{ root: '' }}
    disableElevation
    onClick={props.onClick}
    variant={props.selected ? 'contained' : 'outlined'}
  >
    <Tooltip title={props.title}>{props.children}</Tooltip>
  </Button>
);

interface ContentProps {
  questionId: number;
  submissionId: number;
  graderView: boolean;
  viewType: ViewType;
}

const AllAttemptsContent: FC<ContentProps> = (props) => {
  const { questionId, submissionId, graderView, viewType } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const history = useAppSelector(
    getSubmissionQuestionHistory(submissionId, questionId),
  );
  const pastAnswersLoaded = history.status === 'completed';

  useEffect(() => {
    if (!pastAnswersLoaded) {
      dispatch(
        historyActions.updateSubmissionQuestionHistory({
          submissionId,
          questionId,
          status: 'submitted',
          details: null,
        }),
      );
      fetchSubmissionQuestionDetails(submissionId, questionId)
        .then(({ allAnswers, comments }) =>
          dispatch(
            historyActions.updateSubmissionQuestionHistory({
              submissionId,
              questionId,
              status: 'completed',
              details: { allAnswers, comments },
            }),
          ),
        )
        .catch(() => {
          dispatch(
            historyActions.updateSubmissionQuestionHistory({
              submissionId,
              questionId,
              status: 'errored',
              details: null,
            }),
          );
        });
    }
  }, [dispatch, questionId, submissionId, pastAnswersLoaded]);

  if (pastAnswersLoaded) {
    return (
      <>
        {graderView && (
          <AllAttemptsQuestion
            questionId={questionId}
            submissionId={submissionId}
          />
        )}
        {viewType === 'sequence' && (
          <AllAttemptsSequenceView
            graderView={graderView}
            questionId={questionId}
            submissionId={submissionId}
          />
        )}
        {viewType === 'timeline' && (
          <AllAttemptsTimelineView
            questionId={questionId}
            submissionId={submissionId}
          />
        )}
        {history.comments.length > 0 && <Comment comments={history.comments} />}
      </>
    );
  }
  if (history.status === 'errored') {
    return (
      <Alert severity="error">{t(messagesTranslations.fetchingError)}</Alert>
    );
  }
  return <LoadingIndicator />;
};

interface Props {
  questionId: number;
  submissionId: number;
  graderView: boolean;

  onClose: () => void;
  open: boolean;
  title: ReactNode;
}

const AllAttemptsPrompt: FC<Props> = (props) => {
  const { onClose, open, title, ...contentProps } = props;
  const { t } = useTranslation();
  const [viewType, setViewType] = useState<ViewType>('timeline');

  return (
    <Prompt
      cancelLabel={t(formTranslations.close)}
      maxWidth="lg"
      onClose={onClose}
      open={open}
      title={
        <span className="flex items-center space-x-5">
          {title}
          <div className="flex-1"> </div>
          <ButtonGroup className="h-full" color="primary" variant="outlined">
            <ViewTypeButton
              onClick={() => setViewType('timeline')}
              selected={viewType === 'timeline'}
              title="Timeline View"
            >
              <LinearScale />
            </ViewTypeButton>
            <ViewTypeButton
              onClick={() => setViewType('sequence')}
              selected={viewType === 'sequence'}
              title="Sequence View"
            >
              <TableRows />
            </ViewTypeButton>
          </ButtonGroup>
        </span>
      }
    >
      <AllAttemptsContent {...contentProps} viewType={viewType} />
    </Prompt>
  );
};

export default AllAttemptsPrompt;
