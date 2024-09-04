import { FC, ReactNode, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Box, Chip } from '@mui/material';
import palette from 'theme/palette';
import {
  AttemptInfo,
  MainSubmissionInfo,
} from 'types/course/statistics/assessmentStatistics';

import { workflowStates } from 'course/assessment/submission/constants';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import Note from 'lib/components/core/Note';
import GhostIcon from 'lib/components/icons/GhostIcon';
import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import TableLegends from 'lib/containers/TableLegends';
import { getEditSubmissionURL } from 'lib/helpers/url-builders';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import AllAttemptsIndex from './AnswerDisplay/AllAttempts';
import { getClassNameForAttemptCountCell } from './classNameUtils';
import { getAssessmentStatistics } from './selectors';

const translations = defineMessages({
  onlyForAutogradableAssessment: {
    id: 'course.assessment.statistics.onlyForAutogradableAssessment',
    defaultMessage:
      'This table is only displayed for Assessment with at least one Autograded Questions',
  },
  greenCellLegend: {
    id: 'course.assessment.statistics.greenCellLegend',
    defaultMessage: 'Correct',
  },
  redCellLegend: {
    id: 'course.assessment.statistics.redCellLegend',
    defaultMessage: 'Incorrect',
  },
  grayCellLegend: {
    id: 'course.assessment.statistics.grayCellLegend',
    defaultMessage: 'Undecided (question is Non-autogradable)',
  },
  name: {
    id: 'course.assessment.statistics.name',
    defaultMessage: 'Name',
  },
  group: {
    id: 'course.assessment.statistics.group',
    defaultMessage: 'Group',
  },
  searchText: {
    id: 'course.assessment.statistics.searchText',
    defaultMessage: 'Search by Name or Groups',
  },
  answers: {
    id: 'course.assessment.statistics.answers',
    defaultMessage: 'Answers',
  },
  questionIndex: {
    id: 'course.assessment.statistics.questionIndex',
    defaultMessage: 'Q{index}',
  },
  noSubmission: {
    id: 'course.assessment.statistics.noSubmission',
    defaultMessage: 'No Submission yet',
  },
  workflowState: {
    id: 'course.assessment.statistics.workflowState',
    defaultMessage: 'Status',
  },
  filename: {
    id: 'course.assessment.statistics.filename',
    defaultMessage: 'Question-level Attempt Statistics for {assessment}',
  },
  close: {
    id: 'course.assessment.statistics.close',
    defaultMessage: 'Close',
  },
});

interface Props {
  includePhantom: boolean;
}

const statusTranslations = {
  attempting: 'Attempting',
  submitted: 'Submitted',
  graded: 'Graded, unpublished',
  published: 'Graded',
  unstarted: 'Not Started',
};

const StudentAttemptCountTable: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { courseId, assessmentId } = useParams();
  const { includePhantom } = props;

  const statistics = useAppSelector(getAssessmentStatistics);
  const [openPastAnswers, setOpenPastAnswers] = useState(false);
  const [answerInfo, setAnswerInfo] = useState({
    index: 0,
    answerId: 0,
    studentName: '',
  });
  const assessment = statistics.assessment;
  const submissions = statistics.submissions;

  if (!assessment?.isAutograded) {
    return <Note message={t(translations.onlyForAutogradableAssessment)} />;
  }

  // since submissions come from Redux store, it is immutable, and hence
  // toggling between includePhantom status will render typeError if we
  // use submissions. Hence the reason of using slice in here, basically
  // creating a new array and use this instead for the display.
  const filteredSubmissions = includePhantom
    ? submissions.slice()
    : submissions.slice().filter((s) => !s.courseUser.isPhantom);

  const sortedSubmission = filteredSubmissions
    .sort((datum1, datum2) =>
      datum1.courseUser.name.localeCompare(datum2.courseUser.name),
    )
    .sort(
      (datum1, datum2) =>
        Number(datum1.courseUser.isPhantom) -
        Number(datum2.courseUser.isPhantom),
    );

  // the case where the attempt count is null is handled separately inside the column
  // (refer to the definition of answerColumns below)
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
        onClick={(): void => {
          setOpenPastAnswers(true);
          setAnswerInfo({
            index: index + 1,
            answerId: datum.attemptStatus![index].lastAttemptAnswerId,
            studentName: datum.courseUser.name,
          });
        }}
      >
        <Box>{datum.attemptStatus![index].attemptCount}</Box>
      </div>
    );
  };

  // the customised sorting for grades to ensure null always is less than any non-null grade
  const sortNullableAttemptCount = (
    attempt1: AttemptInfo | null,
    attempt2: AttemptInfo | null,
  ): number => {
    if (!attempt1 && !attempt2) {
      return 0;
    }
    if (!attempt1) {
      return -1;
    }
    if (!attempt2) {
      return 1;
    }

    const convertedAttempt1 =
      attempt1.attemptCount * (attempt1.correct ? 1 : -1);
    const convertedAttempt2 =
      attempt2.attemptCount * (attempt2.correct ? 1 : -1);
    return convertedAttempt1 - convertedAttempt2;
  };

  const answerColumns: ColumnTemplate<MainSubmissionInfo>[] = Array.from(
    { length: assessment?.questionCount ?? 0 },
    (_, index) => {
      return {
        searchProps: {
          getValue: (datum) =>
            datum.attemptStatus?.[index]?.attemptCount?.toString() ?? '',
        },
        title: t(translations.questionIndex, { index: index + 1 }),
        cell: (datum): ReactNode => {
          return typeof datum.attemptStatus?.[index].attemptCount === 'number'
            ? renderAttemptCountClickableCell(index, datum)
            : null;
        },
        sortable: true,
        csvDownloadable: true,
        className: 'text-right',
        sortProps: {
          sort: (datum1, datum2): number => {
            return sortNullableAttemptCount(
              datum1.attemptStatus?.[index] ?? null,
              datum2.attemptStatus?.[index] ?? null,
            );
          },
        },
      };
    },
  );

  const jointGroupsName = (datum: MainSubmissionInfo): string =>
    datum.groups ? datum.groups.map((g) => g.name).join(', ') : '';

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
      of: 'groups',
      title: t(translations.group),
      sortable: true,
      searchable: true,
      searchProps: {
        getValue: (datum) => jointGroupsName(datum),
      },
      cell: (datum) => jointGroupsName(datum),
      csvDownloadable: true,
    },
    {
      of: 'workflowState',
      title: t(translations.workflowState),
      sortable: true,
      cell: (datum) => (
        <Link
          opensInNewTab
          to={getEditSubmissionURL(courseId, assessmentId, datum.id)}
        >
          <Chip
            className={`text-blue-800 ${palette.submissionStatusClassName[datum.workflowState ?? workflowStates.Unstarted]} w-full`}
            label={
              statusTranslations[
                datum.workflowState ?? workflowStates.Unstarted
              ]
            }
            variant="filled"
          />
        </Link>
      ),
      className: 'center',
    },
    ...answerColumns,
  ];

  return (
    <>
      <TableLegends
        legends={[
          {
            key: 'correct',
            backgroundColor: 'bg-green-300',
            description: t(translations.greenCellLegend),
          },
          {
            key: 'incorrect',
            backgroundColor: 'bg-red-300',
            description: t(translations.redCellLegend),
          },
          {
            key: 'undecided',
            backgroundColor: 'bg-gray-300',
            description: t(translations.grayCellLegend),
          },
        ]}
      />
      <Table
        columns={columns}
        csvDownload={{
          filename: t(translations.filename, {
            assessment: assessment?.title ?? '',
          }),
        }}
        data={sortedSubmission}
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
        search={{ searchPlaceholder: t(translations.searchText) }}
        toolbar={{ show: true }}
      />
      <Prompt
        cancelLabel={t(translations.close)}
        maxWidth="lg"
        onClose={(): void => setOpenPastAnswers(false)}
        open={openPastAnswers}
        title={answerInfo.studentName}
      >
        <AllAttemptsIndex
          curAnswerId={answerInfo.answerId}
          index={answerInfo.index}
        />
      </Prompt>
    </>
  );
};

export default StudentAttemptCountTable;
