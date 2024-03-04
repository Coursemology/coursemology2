import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardContent, Slider, Typography } from '@mui/material';

import { CourseStudent, GroupManager } from 'course/statistics/types';
import LinearProgressWithLabel from 'lib/components/core/LinearProgressWithLabel';
import Link from 'lib/components/core/Link';
import Table, { ColumnTemplate } from 'lib/components/table';
import {
  DEFAULT_MINI_TABLE_ROWS_PER_PAGE,
  NUM_CELL_CLASS_NAME,
} from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  title: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.title',
    defaultMessage: 'Student Performance',
  },
  highlight: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.highlight',
    defaultMessage: 'Highlight top and bottom {percent}% based on {criteria}',
  },
  name: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.name',
    defaultMessage: 'Name',
  },
  studentType: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.studentType',
    defaultMessage: 'Student Type',
  },
  normal: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.studentType.normal',
    defaultMessage: 'Normal',
  },
  phantom: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.studentType.phantom',
    defaultMessage: 'Phantom',
  },
  groupManagers: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.groupManagers',
    defaultMessage: 'Tutors',
  },
  levelInfo: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.levelInfo',
    defaultMessage: 'Level (Max: {maxLevel})',
  },
  experiencePoints: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.experiencePoints',
    defaultMessage: 'Experience Points',
  },
  learningRate: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.learningRate',
    defaultMessage: 'Learning Rate',
  },
  numSubmissionsDetails: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.numSubmissionsDetails',
    defaultMessage: 'No. of Submissions (Total: {courseAssessmentCount})',
  },
  achievementCountDetails: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.achievementCountDetails',
    defaultMessage: 'No. of Achievements (Total: {courseAchievementCount})',
  },
  correctness: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.correctness',
    defaultMessage: 'Correctness',
  },
  videoSubmissionCountHeader: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.videoSubmissionCountHeader',
    defaultMessage: 'Videos Watched (Total: {courseVideoCount})',
  },
  videoPercentWatchedHeader: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.videoPercentWatchedHeader',
    defaultMessage: 'Average Video % Watched',
  },
  noData: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.noData',
    defaultMessage: 'No Data',
  },
  csvFileTitle: {
    id: 'course.statistics.StatisticsIndex.course.csvFileTitle',
    defaultMessage: 'Student Performance Statistics',
  },
  searchBar: {
    id: 'course.statistics.StatisticsIndex.course.searchBar',
    defaultMessage: 'Search by Student Name',
  },
});

interface Props {
  courseAchievementCount: number;
  courseAssessmentCount: number;
  courseVideoCount: number;
  hasGroupManagers: boolean;
  hasPersonalizedTimeline: boolean;
  isCourseGamified: boolean;
  maxLevel: number;
  showVideo: boolean;
  students: CourseStudent[];
}

const StudentPerformanceTable: FC<Props> = (props) => {
  const {
    students,
    hasPersonalizedTimeline,
    isCourseGamified,
    showVideo,
    courseVideoCount,
    courseAchievementCount,
    courseAssessmentCount,
    maxLevel,
    hasGroupManagers,
  } = props;

  const { t } = useTranslation();
  const [highlightPercentage, setHighlightPercentage] = useState(5);

  const numHighlightedStudents = Math.floor(
    (students.length * highlightPercentage) / 100,
  );

  if (isCourseGamified) {
    students.sort(
      (s1, s2) => (s2.experiencePoints ?? 0) - (s1.experiencePoints ?? 0),
    );
  } else {
    students.sort((s1, s2) => (s2.correctness ?? 0) - (s1.correctness ?? 0));
  }

  const studentsWithHighlight = students.map((student, index) => ({
    ...student,
    isTopStudent: index <= numHighlightedStudents,
    isBottomStudent: index >= students.length - numHighlightedStudents,
  }));

  const getStudentHighlightColor = (student: CourseStudent): string => {
    if (student.isTopStudent) {
      return 'bg-green-100';
    }

    if (student.isBottomStudent) {
      return 'bg-red-100';
    }

    return '';
  };

  const columns: ColumnTemplate<CourseStudent>[] = [
    {
      of: 'name',
      title: t(translations.name),
      sortable: true,
      cell: (student) => (
        <Link key={student.id} opensInNewTab to={student.nameLink}>
          {student.name}
        </Link>
      ),
      csvDownloadable: true,
    },
    {
      of: 'isPhantom',
      title: t(translations.studentType),
      sortable: true,
      filterable: true,
      sortProps: {
        sort: (student1, student2) =>
          Number(student1.isPhantom) - Number(student2.isPhantom),
      },
      filterProps: {
        getValue: (student) => [
          student.isPhantom ? t(translations.phantom) : t(translations.normal),
        ],
        shouldInclude: (student, filterValue?: string[]): boolean => {
          const studentType = student.isPhantom
            ? t(translations.phantom)
            : t(translations.normal);
          if (!filterValue?.length) return true;

          const filterSet = new Set(filterValue);
          return filterSet.has(studentType);
        },
      },
      cell: (student) =>
        student.isPhantom ? t(translations.phantom) : t(translations.normal),
      csvDownloadable: true,
      csvValue: (value: boolean) =>
        value ? t(translations.phantom) : t(translations.normal),
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
      title: t(translations.levelInfo, { maxLevel }),
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
      csvDownloadable: true,
      className: NUM_CELL_CLASS_NAME,
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
    });
    columns.push({
      of: 'achievementCount',
      title: t(translations.achievementCountDetails, {
        courseAchievementCount,
      }),
      sortable: true,
      className: NUM_CELL_CLASS_NAME,
      cell: (student) => (
        <div className={NUM_CELL_CLASS_NAME}>{student.achievementCount}</div>
      ),
    });
  }

  columns.push({
    of: 'numSubmissions',
    title: t(translations.numSubmissionsDetails, {
      courseAssessmentCount,
    }),
    sortable: true,
    className: NUM_CELL_CLASS_NAME,
    cell: (student) => (
      <div className={NUM_CELL_CLASS_NAME}>{student.numSubmissions}</div>
    ),
  });

  columns.push({
    of: 'correctness',
    title: t(translations.correctness),
    sortable: true,
    className: NUM_CELL_CLASS_NAME,
    cell: (student) => (
      <div className={NUM_CELL_CLASS_NAME}>
        {student.correctness
          ? `${(student.correctness * 100).toFixed(3) ?? ''}%`
          : t(translations.noData)}
      </div>
    ),
  });

  if (hasPersonalizedTimeline) {
    columns.push({
      of: 'learningRate',
      title: t(translations.learningRate),
      sortable: true,
      className: NUM_CELL_CLASS_NAME,
      cell: (student) => (
        <div className={NUM_CELL_CLASS_NAME}>
          {student.learningRate
            ? `${student.learningRate.toFixed(3)}%`
            : t(translations.noData)}
        </div>
      ),
    });
  }

  if (showVideo) {
    columns.push({
      of: 'videoSubmissionCount',
      title: t(translations.videoSubmissionCountHeader, {
        courseVideoCount,
      }),
      sortable: true,
      className: NUM_CELL_CLASS_NAME,
      cell: (student) => (
        <Link key={student.id} opensInNewTab to={student.videoSubmissionLink}>
          <div className={NUM_CELL_CLASS_NAME}>
            {student.videoSubmissionCount}
          </div>
        </Link>
      ),
    });
    columns.push({
      of: 'videoPercentWatched',
      title: t(translations.videoPercentWatchedHeader),
      sortable: true,
      cell: (student) => (
        <LinearProgressWithLabel value={student.videoPercentWatched ?? 0} />
      ),
    });
  }

  return (
    <Card style={{ margin: '2rem 0' }} variant="outlined">
      <CardContent>
        <Typography gutterBottom variant="h6">
          {t(translations.title)}
        </Typography>

        <Typography className="mr-2" variant="body2">
          {t(translations.highlight, {
            percent: highlightPercentage,
            criteria: isCourseGamified
              ? t(translations.experiencePoints)
              : t(translations.correctness),
          })}
        </Typography>
        <Slider
          aria-label="Highlight Percentage"
          className="flex flex-row align-right max-w-[500px] min-w-[300px] mb-2"
          defaultValue={highlightPercentage}
          getAriaValueText={(value) => `${value}%`}
          marks
          max={20}
          min={1}
          onChange={(_, value) => setHighlightPercentage(value as number)}
          step={1}
          valueLabelDisplay="auto"
        />
        <Table
          className="border-none"
          columns={columns}
          csvDownload={{ filename: t(translations.csvFileTitle) }}
          data={studentsWithHighlight}
          getRowClassName={(student): string =>
            `student_statistics_${student.id} ${getStudentHighlightColor(student)}`
          }
          getRowEqualityData={(student): CourseStudent => student}
          getRowId={(student): string => student.id.toString()}
          indexing={{ indices: true }}
          pagination={{
            rowsPerPage: [DEFAULT_MINI_TABLE_ROWS_PER_PAGE],
            showAllRows: true,
          }}
          search={{
            searchPlaceholder: t(translations.searchBar),
            searchProps: {
              shouldInclude: (student, filterValue?: string): boolean => {
                if (!student.name) return false;
                if (!filterValue) return true;

                return student.name
                  .toLowerCase()
                  .trim()
                  .includes(filterValue.toLowerCase().trim());
              },
            },
          }}
          toolbar={{ show: true }}
        />
      </CardContent>
    </Card>
  );
};

export default StudentPerformanceTable;
