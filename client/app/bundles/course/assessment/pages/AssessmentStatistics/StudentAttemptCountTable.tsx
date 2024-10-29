import { FC, ReactNode, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Chip } from '@mui/material';
import palette from 'theme/palette';
import { MainSubmissionInfo } from 'types/course/statistics/assessmentStatistics';

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
import translations from './translations';
import { getJointGroupsName, translateStatus } from './utils';

interface Props {
  includePhantom: boolean;
}

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

  const answerColumns: ColumnTemplate<MainSubmissionInfo>[] = Array.from(
    { length: assessment?.questionCount ?? 0 },
    (_, index) => {
      return {
        searchProps: {
          getValue: (datum) =>
            datum.attemptStatus?.[index]?.attemptCount?.toString() ?? undefined,
        },
        title: t(translations.questionIndex, { index: index + 1 }),
        cell: (datum): ReactNode => {
          return typeof datum.attemptStatus?.[index].attemptCount ===
            'number' ? (
            renderAttemptCountClickableCell(index, datum)
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
      hidden: true,
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
      cell: (datum) => (
        <Link
          opensInNewTab
          to={getEditSubmissionURL(courseId, assessmentId, datum.id)}
        >
          <Chip
            className={`text-blue-800 ${palette.submissionStatusClassName[datum.workflowState ?? workflowStates.Unstarted]} w-full`}
            label={translateStatus(
              datum.workflowState ?? workflowStates.Unstarted,
            )}
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
      <Table
        columns={columns}
        csvDownload={{
          filename: t(translations.attemptsFilename, {
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
        search={{ searchPlaceholder: t(translations.nameGroupsSearchText) }}
        toolbar={{ show: true }}
      />
      <Prompt
        cancelLabel={t(translations.closePrompt)}
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
