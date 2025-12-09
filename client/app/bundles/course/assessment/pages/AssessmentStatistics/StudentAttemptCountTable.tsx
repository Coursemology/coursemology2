import { FC, ReactNode, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  PossiblyUnstartedWorkflowState,
  WorkflowState,
} from 'types/course/assessment/submission/submission';
import { MainSubmissionInfo } from 'types/course/statistics/assessmentStatistics';

import {
  fetchAssessmentStatistics,
  fetchSubmissionStatistics,
} from 'course/assessment/operations/statistics';
import AllAttemptsPrompt from 'course/assessment/submission/components/AllAttempts';
import SubmissionWorkflowState from 'course/assessment/submission/components/SubmissionWorkflowState';
import { workflowStates } from 'course/assessment/submission/constants';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import GhostIcon from 'lib/components/icons/GhostIcon';
import Table, { ColumnTemplate } from 'lib/components/table';
import Preload from 'lib/components/wrappers/Preload';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import TableLegends from 'lib/containers/TableLegends';
import {
  getEditSubmissionQuestionURL,
  getEditSubmissionURL,
} from 'lib/helpers/url-builders';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import submissionTranslations, {
  submissionStatusTranslation,
} from '../../submission/translations';

import { getClassNameForAttemptCountCell } from './classNameUtils';
import { getAssessmentStatistics, getSubmissionStatistics } from './selectors';
import translations from './translations';
import { getJointGroupsName, sortSubmissionsByWorkflowState } from './utils';

interface Props {
  includePhantom: boolean;
}

interface AnswerInfoState {
  index: number;
  questionId: number;
  submissionId: number;
  studentName: string;
  workflowState?: WorkflowState | typeof workflowStates.Unstarted;
}

const AttemptTableLegends: FC = () => {
  const { t } = useTranslation();
  return (
    <TableLegends
      legends={[
        {
          key: 'correct',
          backgroundColor: 'bg-green-300',
          description: t(translations.attemptsGreenCellLegend),
        },
        {
          key: 'incorrect',
          backgroundColor: 'bg-red-300',
          description: t(translations.attemptsRedCellLegend),
        },
        {
          key: 'undecided',
          backgroundColor: 'bg-gray-300',
          description: t(translations.grayCellLegend),
        },
      ]}
    />
  );
};

const AttemptsModal: FC<{
  open: boolean;
  onClose: () => void;
  answerInfo: AnswerInfoState;
}> = ({ open, onClose, answerInfo }) => {
  const { t } = useTranslation();
  const { courseId, assessmentId } = useParams();
  return (
    <AllAttemptsPrompt
      graderView
      onClose={onClose}
      open={open}
      questionId={answerInfo.questionId}
      submissionId={answerInfo.submissionId}
      title={
        <span className="flex items-center space-x-5">
          <span>
            {t(submissionTranslations.historyTitle, {
              number: answerInfo.index,
              studentName: answerInfo.studentName,
            })}
          </span>
          <SubmissionWorkflowState
            linkTo={getEditSubmissionQuestionURL(
              courseId!,
              assessmentId!,
              answerInfo.submissionId,
              answerInfo.index,
            )}
            opensInNewTab
            workflowState={answerInfo.workflowState ?? workflowStates.Unstarted}
          />
        </span>
      }
    />
  );
};

const StudentAttemptCountTable: FC<Props> = ({ includePhantom }) => {
  const { t } = useTranslation();
  const { courseId, assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const assessmentStatistics = useAppSelector(getAssessmentStatistics);
  const submissionStatistics = useAppSelector(getSubmissionStatistics);

  const [openPastAnswers, setOpenPastAnswers] = useState(false);
  const [answerInfo, setAnswerInfo] = useState<AnswerInfoState>({
    index: 0,
    questionId: 0,
    submissionId: 0,
    studentName: '',
  });

  const fetchAndSetAssessmentAndSubmissionStatistics =
    async (): Promise<void> => {
      const promises: Promise<void>[] = [];
      if (!assessmentStatistics) {
        promises.push(fetchAssessmentStatistics(parsedAssessmentId));
      }
      if (submissionStatistics.length === 0) {
        promises.push(fetchSubmissionStatistics(parsedAssessmentId));
      }
      await Promise.all(promises);
    };

  // since submissions come from Redux store, it is immutable, and hence
  // toggling between includePhantom status will render typeError if we
  // use submissions. Hence the reason of using slice in here, basically
  // creating a new array and use this instead for the display.
  const filteredAndSortedSubmissions = useMemo(() => {
    return submissionStatistics
      .filter((s) => includePhantom || !s.courseUser.isPhantom)
      .slice()
      .sort((a, b) => {
        const phantomDiff =
          Number(a.courseUser.isPhantom) - Number(b.courseUser.isPhantom);
        return (
          phantomDiff || a.courseUser.name.localeCompare(b.courseUser.name)
        );
      });
  }, [submissionStatistics, includePhantom]);

  const handleClickAttemptCell = (
    index: number,
    datum: MainSubmissionInfo,
  ): void => {
    setOpenPastAnswers(true);
    setAnswerInfo({
      index: index + 1,
      questionId: assessmentStatistics!.questionIds[index],
      submissionId: datum.id,
      studentName: datum.courseUser.name,
      workflowState: datum.workflowState,
    });
  };

  // the case where the attempt count is null is handled separately inside the column
  // (refer to the definition of buildAnswerColumns below)
  const renderAttemptCountClickableCell = (
    index: number,
    datum: MainSubmissionInfo,
  ): ReactNode => {
    const className = getClassNameForAttemptCountCell(
      datum.attemptStatus![index],
    );

    return (
      <div
        className={`cursor-pointer ${className}`}
        onClick={(): void => handleClickAttemptCell(index, datum)}
      >
        {datum.attemptStatus![index].attemptCount}
      </div>
    );
  };

  const buildAnswerColumns = (): ColumnTemplate<MainSubmissionInfo>[] => {
    return Array.from(
      { length: assessmentStatistics?.questionCount ?? 0 },
      (_, index) => ({
        title: t(translations.questionIndex, { index: index + 1 }),
        className: 'text-right',
        sortable: true,
        csvDownloadable: true,
        sortProps: { undefinedPriority: 'last' },
        searchProps: {
          getValue: (datum) =>
            datum.attemptStatus?.[index]?.attemptCount?.toString() ?? undefined,
        },
        cell: (datum): ReactNode =>
          typeof datum.attemptStatus?.[index]?.attemptCount === 'number' ? (
            renderAttemptCountClickableCell(index, datum)
          ) : (
            <div />
          ),
      }),
    );
  };

  const baseColumns: ColumnTemplate<MainSubmissionInfo>[] = [
    {
      title: t(translations.name),
      sortable: true,
      searchable: true,
      csvDownloadable: true,
      searchProps: { getValue: (datum) => datum.courseUser.name },
      cell: (datum) => (
        <div className="flex grow items-center">
          <Link to={`/courses/${courseId}/users/${datum.courseUser.id}`}>
            {datum.courseUser.name}
          </Link>
          {datum.courseUser.isPhantom && (
            <GhostIcon className="ml-2" fontSize="small" />
          )}
        </div>
      ),
    },
    {
      title: t(translations.email),
      hidden: true,
      csvDownloadable: true,
      searchProps: { getValue: (datum) => datum.courseUser.email },
      cell: (datum) => (
        <div className="flex grow items-center">{datum.courseUser.email}</div>
      ),
    },
    {
      title: t(translations.group),
      of: 'groups',
      sortable: true,
      searchable: true,
      csvDownloadable: true,
      searchProps: { getValue: (datum) => getJointGroupsName(datum.groups) },
      cell: (datum) => getJointGroupsName(datum.groups),
    },
    {
      of: 'workflowState',
      title: t(translations.workflowState),
      sortable: true,
      sortProps: {
        sort: sortSubmissionsByWorkflowState,
      },
      searchProps: {
        getValue: (datum) => datum.workflowState ?? workflowStates.Unstarted,
      },
      cell: (datum) => (
        <SubmissionWorkflowState
          linkTo={getEditSubmissionURL(courseId, assessmentId, datum.id)}
          opensInNewTab
          workflowState={datum.workflowState ?? workflowStates.Unstarted}
        />
      ),
      className: 'text-left',
      csvDownloadable: true,
      csvValue: (workflowState: PossiblyUnstartedWorkflowState) =>
        t(submissionStatusTranslation(workflowState)),
    },
  ];

  const columns = useMemo(
    () => [...baseColumns, ...buildAnswerColumns()],
    [assessmentStatistics],
  );

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchAndSetAssessmentAndSubmissionStatistics}
    >
      {!assessmentStatistics?.isAutograded ? (
        <Note message={t(translations.onlyForAutogradableAssessment)} />
      ) : (
        <>
          <AttemptTableLegends />
          <Table
            columns={columns}
            csvDownload={{
              filename: t(translations.attemptsFilename, {
                assessment: assessmentStatistics?.title ?? '',
              }),
            }}
            data={filteredAndSortedSubmissions}
            getRowClassName={(datum) =>
              `data_${datum.courseUser.id} bg-slot-1 hover?:bg-slot-2 slot-1-white slot-2-neutral-100`
            }
            getRowEqualityData={(datum) => datum}
            getRowId={(datum) => datum.courseUser.id.toString()}
            indexing={{ indices: true }}
            pagination={{
              rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
              showAllRows: true,
            }}
            search={{
              searchPlaceholder: t(translations.nameGroupsGraderSearchText),
            }}
            toolbar={{ show: true }}
          />
          <AttemptsModal
            answerInfo={answerInfo}
            onClose={(): void => setOpenPastAnswers(false)}
            open={openPastAnswers}
          />
        </>
      )}
    </Preload>
  );
};

export default StudentAttemptCountTable;
