// the case where the grade is null is handled separately inside the column
// (refer to the definition of answerColumns below)

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
import SubmissionWorkflowState from 'course/assessment/submission/components/SubmissionWorkflowState';
import { workflowStates } from 'course/assessment/submission/constants';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
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

import LastAttemptIndex from './AnswerDisplay/LastAttempt';
import { getClassNameForMarkCell } from './classNameUtils';
import { getAssessmentStatistics, getSubmissionStatistics } from './selectors';
import translations from './translations';
import { getJointGroupsName, sortSubmissionsByWorkflowState } from './utils';

interface Props {
  includePhantom: boolean;
}

interface AnswerInfoState {
  index: number;
  answerId: number;
  questionId: number;
  submissionId: number;
  studentName: string;
  workflowState?: WorkflowState | typeof workflowStates.Unstarted;
}

const StudentGradesPerQuestionTable: FC<Props> = ({ includePhantom }) => {
  const { t } = useTranslation();
  const { courseId, assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const assessmentStatistics = useAppSelector(getAssessmentStatistics);
  const submissionStatistics = useAppSelector(getSubmissionStatistics);

  const [openAnswer, setOpenAnswer] = useState(false);
  const [answerDisplayInfo, setAnswerDisplayInfo] = useState<AnswerInfoState>({
    index: 0,
    answerId: 0,
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

  // the case where the grade is null is handled separately inside the column
  // (refer to the definition of answerColumns below)
  const renderAnswerGradeClickableCell = (
    index: number,
    datum: MainSubmissionInfo,
  ): ReactNode => {
    const className = getClassNameForMarkCell(
      datum.answers![index].grade,
      datum.answers![index].maximumGrade,
    );
    return (
      <div
        className={`cursor-pointer ${className}`}
        onClick={(): void => {
          setOpenAnswer(true);
          setAnswerDisplayInfo({
            index: index + 1,
            answerId: datum.answers![index].lastAttemptAnswerId,
            questionId: assessmentStatistics!.questionIds[index],
            submissionId: datum.id,
            studentName: datum.courseUser.name,
            workflowState: datum.workflowState,
          });
        }}
      >
        {datum.answers![index].grade.toFixed(1)}
      </div>
    );
  };

  const renderTotalGradeCell = (
    totalGrade: number,
    maxGrade: number,
  ): ReactNode => {
    const className = getClassNameForMarkCell(totalGrade, maxGrade);
    return <div className={className}>{totalGrade.toFixed(1)}</div>;
  };

  const answerColumns: ColumnTemplate<MainSubmissionInfo>[] = Array.from(
    { length: assessmentStatistics?.questionCount ?? 0 },
    (_, index) => {
      return {
        searchProps: {
          getValue: (datum) =>
            datum.answers?.[index]?.grade?.toString() ?? undefined,
        },
        title: t(translations.questionIndex, { index: index + 1 }),
        cell: (datum): ReactNode => {
          return typeof datum.answers?.[index]?.grade === 'number' ? (
            renderAnswerGradeClickableCell(index, datum)
          ) : (
            <div />
          );
        },
        sortable: true,
        csvDownloadable: true,
        className: 'text-right',
        sortProps: {
          undefinedPriority: 'last',
        },
      };
    },
  );

  const columns: ColumnTemplate<MainSubmissionInfo>[] = [
    {
      searchProps: {
        getValue: (datum) => datum.courseUser.name,
      },
      title: t(translations.name),
      sortable: true,
      searchable: true,
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
      csvDownloadable: true,
    },
    {
      searchProps: {
        getValue: (datum) => datum.courseUser.email,
      },
      title: t(translations.email),
      className: 'hidden',
      cell: (datum) => (
        <div className="flex grow items-center">{datum.courseUser.email}</div>
      ),
      csvDownloadable: true,
    },
    {
      of: 'groups',
      title: t(translations.group),
      sortable: true,
      searchable: true,
      searchProps: {
        getValue: (datum) => getJointGroupsName(datum.groups),
      },
      cell: (datum) => getJointGroupsName(datum.groups),
      csvDownloadable: true,
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
    ...answerColumns,
    {
      searchProps: {
        getValue: (datum) => datum.totalGrade?.toString() ?? undefined,
      },
      title: t(translations.total),
      sortable: true,
      cell: (datum): ReactNode => {
        const isGradedOrPublished =
          datum.workflowState === workflowStates.Graded ||
          datum.workflowState === workflowStates.Published;
        return typeof datum.totalGrade === 'number' && isGradedOrPublished ? (
          renderTotalGradeCell(
            datum.totalGrade,
            assessmentStatistics!.maximumGrade,
          )
        ) : (
          <div />
        );
      },

      className: 'text-right',
      sortProps: {
        undefinedPriority: 'last',
      },
      csvDownloadable: true,
    },
    {
      searchProps: {
        getValue: (datum) => datum.grader?.name ?? '',
      },
      title: t(translations.grader),
      sortable: true,
      searchable: true,
      cell: (datum): JSX.Element | string => {
        if (datum.grader && datum.grader.id !== 0) {
          return (
            <Link to={`/courses/${courseId}/users/${datum.grader.id}`}>
              {datum.grader.name}
            </Link>
          );
        }
        return datum.grader?.name ?? '';
      },
      csvDownloadable: true,
    },
  ];

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchAndSetAssessmentAndSubmissionStatistics}
    >
      <>
        <TableLegends
          legends={[
            {
              key: 'correct',
              backgroundColor: 'bg-green-500',
              description: t(translations.marksGreenCellLegend),
            },
            {
              key: 'incorrect',
              backgroundColor: 'bg-red-500',
              description: t(translations.marksRedCellLegend),
            },
          ]}
        />
        <Table
          columns={columns}
          csvDownload={{
            filename: t(translations.marksFilename, {
              assessment: assessmentStatistics?.title ?? '',
            }),
          }}
          data={filteredAndSortedSubmissions}
          getRowClassName={(datum): string =>
            `data_${datum.courseUser.id} bg-slot-1 hover?:bg-slot-2 slot-1-white slot-2-neutral-100`
          }
          getRowEqualityData={(datum): MainSubmissionInfo => datum}
          getRowId={(datum): string => datum.courseUser.id.toString()}
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
        <Prompt
          cancelLabel={t(translations.closePrompt)}
          maxWidth="lg"
          onClose={(): void => setOpenAnswer(false)}
          open={openAnswer}
          title={
            <span className="flex items-center">
              {t(submissionTranslations.historyTitle, {
                number: answerDisplayInfo.index,
                studentName: answerDisplayInfo.studentName,
              })}
              <SubmissionWorkflowState
                className="ml-3"
                linkTo={getEditSubmissionQuestionURL(
                  courseId,
                  assessmentId,
                  answerDisplayInfo.submissionId,
                  answerDisplayInfo.index,
                )}
                opensInNewTab
                workflowState={
                  answerDisplayInfo.workflowState ?? workflowStates.Unstarted
                }
              />
            </span>
          }
        >
          <LastAttemptIndex
            curAnswerId={answerDisplayInfo.answerId}
            questionId={answerDisplayInfo.questionId}
            submissionId={answerDisplayInfo.submissionId}
          />
        </Prompt>
      </>
    </Preload>
  );
};

export default StudentGradesPerQuestionTable;
