import { FC, useMemo } from 'react';
import { defineMessages } from 'react-intl';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Tooltip, Typography } from '@mui/material';

import { GroupManager, Metadata, Student } from 'course/statistics/types';
import { processStudent } from 'course/statistics/utils/parseStudentsResponse';
import LinearProgressWithLabel from 'lib/components/core/LinearProgressWithLabel';
import Link from 'lib/components/core/Link';
import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import {
  DEFAULT_TABLE_ROWS_PER_PAGE,
  NUM_CELL_CLASS_NAME,
} from 'lib/constants/sharedConstants';
import {
  getCourseUserURL,
  getStudentSubmissionDueURL,
} from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  name: {
    id: 'course.statistics.StatisticsIndex.students.name',
    defaultMessage: 'Name',
  },
  studentType: {
    id: 'course.statistics.StatisticsIndex.students.studentsType',
    defaultMessage: 'Student Type',
  },
  groupManagers: {
    id: 'course.statistics.StatisticsIndex.students.groupManagers',
    defaultMessage: 'Tutors',
  },
  level: {
    id: 'course.statistics.StatisticsIndex.students.level',
    defaultMessage: 'Level',
  },
  experiencePoints: {
    id: 'course.statistics.StatisticsIndex.students.experiencePoints',
    defaultMessage: 'Experience Points',
  },
  videoSubmissionCount: {
    id: 'course.statistics.StatisticsIndex.students.videoSubmissionCount',
    defaultMessage: 'Videos Watched (Total: {courseVideoCount})',
  },
  videoPercentWatched: {
    id: 'course.statistics.StatisticsIndex.students.videoPercentWatched',
    defaultMessage: 'Average % Watched',
  },
  csvFileTitle: {
    id: 'course.statistics.StatisticsIndex.students.csvFileTitle',
    defaultMessage: 'Student Statistics',
  },
  tableTitle: {
    id: 'course.statistics.StatisticsIndex.students.tableTitle',
    defaultMessage:
      'Student Statistics ({numStudents} students, {numPhantom} phantom)',
  },
  searchBar: {
    id: 'course.statistics.StatisticsIndex.students.searchBar',
    defaultMessage: 'Search by Students Name or Student Type',
  },
  lateAssessmentClick: {
    id: 'course.statistics.StatisticsIndex.students.lateAssessmentClick',
    defaultMessage: 'Click to see all Late Assessments by {name}',
  },
  lateAssessment: {
    id: 'course.statistics.StatisticsIndex.students.lateAssessment',
    defaultMessage: ' ',
  },
});

interface Props {
  metadata: Metadata;
  students: Student[];
}

const StudentsStatisticsTable: FC<Props> = (props) => {
  const {
    metadata: {
      isCourseGamified,
      showVideo,
      courseVideoCount,
      hasGroupManagers,
    },
    students,
  } = props;

  const { t } = useTranslation();
  const formattedStudents: Student[] = students.map(processStudent);
  const courseId = getCourseId();

  const numStudentType = useMemo(() => {
    const numStudents = formattedStudents.filter(
      (s) => s.studentType === 'Normal',
    ).length;
    const numPhantom = formattedStudents.filter(
      (s) => s.studentType === 'Phantom',
    ).length;

    return { numStudents, numPhantom };
  }, [formattedStudents]);

  const columns: ColumnTemplate<Student>[] = [
    {
      of: 'name',
      title: t(translations.name),
      sortable: true,
      searchable: true,
      cell: (student) => (
        <Link opensInNewTab to={getCourseUserURL(courseId!, student.id)}>
          {student.name}
        </Link>
      ),
      csvDownloadable: true,
    },
    {
      of: 'studentType',
      title: t(translations.studentType),
      sortable: true,
      filterable: true,
      filterProps: {
        shouldInclude: (student, filterValue?: string[]): boolean => {
          if (!filterValue?.length) return true;

          const filterSet = new Set(filterValue);
          return filterSet.has(student.studentType);
        },
      },
      cell: (student) => student.studentType,
      csvDownloadable: true,
    },
  ];

  if (hasGroupManagers) {
    columns.push({
      of: 'groupManagers',
      title: t(translations.groupManagers),
      sortable: true,
      filterable: true,
      filterProps: {
        getValue: (student) =>
          student.groupManagers?.map((manager) => manager.name) ?? [],
        shouldInclude: (student, filterValue?: string[]): boolean => {
          if (!student.groupManagers) return false;
          if (!filterValue?.length) return true;

          const filterSet = new Set(filterValue);
          return student.groupManagers.some((manager) =>
            filterSet.has(manager.name),
          );
        },
      },
      cell: (student) => (
        <ul className="m-0 list-none p-0">
          {student.groupManagers?.map((manager) => (
            <Link key={manager.id} opensInNewTab to={manager.nameLink}>
              <Typography component="li" variant="body2">
                {manager.name}
              </Typography>
            </Link>
          ))}
        </ul>
      ),
      csvDownloadable: true,
      csvValue: (managers: GroupManager[]) => {
        return managers?.map((manager) => manager.name).join(', ') ?? '';
      },
      sortProps: {
        sort: (student1, student2) => {
          const managerNamesStudent1 =
            student1.groupManagers?.map((manager) => manager.name) ?? [];
          const managerNamesStudent2 =
            student2.groupManagers?.map((manager) => manager.name) ?? [];
          return managerNamesStudent1
            .join(';')
            .localeCompare(managerNamesStudent2.join(';'));
        },
      },
    });
  }

  if (isCourseGamified) {
    columns.push({
      of: 'level',
      title: t(translations.level),
      sortable: true,
      filterable: true,
      filterProps: {
        getValue: (student) => [student.level?.toString() ?? ''],
        shouldInclude: (student, filterValue?: string[]) => {
          if (!student.level) return false;
          if (!filterValue?.length) return true;

          const filterSet = new Set(filterValue);
          return filterSet.has(student.level.toString());
        },
      },
      cell: (student) => (
        <div className={NUM_CELL_CLASS_NAME}>{student.level}</div>
      ),
      className: NUM_CELL_CLASS_NAME,
      csvDownloadable: true,
    });
    columns.push({
      of: 'experiencePoints',
      title: t(translations.experiencePoints),
      sortable: true,
      cell: (student) => (
        <Link key={student.id} opensInNewTab to={student.experiencePointsLink}>
          <div className={NUM_CELL_CLASS_NAME}>{student.experiencePoints}</div>
        </Link>
      ),
      className: NUM_CELL_CLASS_NAME,
      csvDownloadable: true,
    });
  }

  if (showVideo) {
    columns.push({
      of: 'videoSubmissionCount',
      title: t(translations.videoSubmissionCount, {
        courseVideoCount,
      }),
      cell: (student) => (
        <Link key={student.id} opensInNewTab to={student.videoSubmissionLink}>
          <div className={NUM_CELL_CLASS_NAME}>
            {student.videoSubmissionCount}
          </div>
        </Link>
      ),
      className: NUM_CELL_CLASS_NAME,
      csvDownloadable: true,
    });
    columns.push({
      of: 'videoPercentWatched',
      title: t(translations.videoPercentWatched),
      sortable: true,
      cell: (student) => (
        <div className="align-center">
          <LinearProgressWithLabel value={student.videoPercentWatched ?? 0} />
        </div>
      ),
      csvDownloadable: true,
    });
  }

  columns.push({
    id: 'actions',
    title: t(translations.lateAssessment),
    searchable: false,
    cell: (student) => (
      <Tooltip
        title={t(translations.lateAssessmentClick, { name: student.name })}
      >
        <Link
          opensInNewTab
          to={getStudentSubmissionDueURL(courseId!, student.id)}
        >
          <AssignmentIcon className="fill-red-500" />
        </Link>
      </Tooltip>
    ),
  });

  return (
    <>
      <Typography className="ml-2" variant="h6">
        {t(translations.tableTitle, {
          numStudents: numStudentType.numStudents,
          numPhantom: numStudentType.numPhantom,
        })}
      </Typography>
      <Table
        className="border-none"
        columns={columns}
        csvDownload={{ filename: t(translations.csvFileTitle) }}
        data={formattedStudents}
        getRowClassName={(student): string =>
          `student_statistics_${student.id}`
        }
        getRowEqualityData={(student): Student => student}
        getRowId={(student): string => student.id.toString()}
        indexing={{ indices: true }}
        pagination={{
          rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
          showAllRows: true,
        }}
        search={{
          searchPlaceholder: t(translations.searchBar),
          searchProps: {
            shouldInclude: (student, filterValue?: string): boolean => {
              if (!student.name && !student.studentType) return false;
              if (!filterValue) return true;

              return (
                student.name
                  .toLowerCase()
                  .trim()
                  .includes(filterValue.toLowerCase().trim()) ||
                student.studentType
                  .toLowerCase()
                  .trim()
                  .includes(filterValue.toLowerCase().trim())
              );
            },
          },
        }}
        toolbar={{ show: true }}
      />
    </>
  );
};

export default StudentsStatisticsTable;
