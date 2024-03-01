import { FC, useMemo, useState } from 'react';
import { defineMessages } from 'react-intl';
import { FormControlLabel, Switch } from '@mui/material';
import { TableColumns, TableOptions } from 'types/components/DataTable';

import { Metadata, Student } from 'course/statistics/types';
import DataTable from 'lib/components/core/layouts/DataTable';
import LinearProgressWithLabel from 'lib/components/core/LinearProgressWithLabel';
import Link from 'lib/components/core/Link';
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
  tutorFilter: {
    id: 'course.statistics.StatisticsIndex.students.tutorFilter',
    defaultMessage: 'Tutor: {name}',
  },
  showMyStudentsOnly: {
    id: 'course.statistics.StatisticsIndex.students.showMyStudentsOnly',
    defaultMessage: 'Show My Students Only',
  },
  searchBar: {
    id: 'course.statistics.StatisticsIndex.students.searchBar',
    defaultMessage: 'Search by Students Name',
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
      hasMyStudents,
    },
    students,
  } = props;
  const { t } = useTranslation();

  const [showMyStudentsOnly, setShowMyStudentsOnly] = useState(hasMyStudents);
  const filteredStudents = useMemo(() => {
    if (showMyStudentsOnly) {
      return students.filter((student) => student.isMyStudent);
    }
    return students;
  }, [showMyStudentsOnly, students]);
  const numStudentType = useMemo(() => {
    const numStudents = filteredStudents.filter(
      (s) => s.studentType === 'Normal',
    ).length;
    const numPhantom = filteredStudents.filter(
      (s) => s.studentType === 'Phantom',
    ).length;

    return { numStudents, numPhantom };
  }, [filteredStudents]);

  const options: TableOptions = useMemo(
    () => ({
      customToolbar: (): JSX.Element => {
        if (hasMyStudents)
          return (
            <FormControlLabel
              checked={showMyStudentsOnly}
              className="mb-0"
              control={<Switch />}
              label={t(translations.showMyStudentsOnly)}
              onChange={(_, checked) => setShowMyStudentsOnly(checked)}
            />
          );
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
      },
      downloadOptions: {
        filename: 'students_statistics',
      },
      pagination: false,
      print: false,
      selectableRows: 'none',
      sortOrder: {
        name: 'experiencePoints',
        direction: 'desc',
      },
    }),
    [hasMyStudents, showMyStudentsOnly, setShowMyStudentsOnly],
  );

  const columns: TableColumns[] = [
    {
      name: 'name',
      label: t(translations.name),
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: 'studentType',
      label: t(translations.studentType),
      options: {
        filter: false,
        sort: true,
      },
    },
  ];

  if (hasGroupManagers) {
    columns.push({
      name: 'groupManagers',
      label: t(translations.groupManagers),
      options: {
        filter: true,
        filterType: 'multiselect',
        filterOptions: {
          logic: (managers, filters) => {
            if (filters) {
              const filterSet = new Set(filters);
              return !managers
                .map((m) => m.name)
                .some((name) => filterSet.has(name));
            }
            return false;
          },
          fullWidth: true,
        },
        customFilterListOptions: {
          render: (name) => t(translations.tutorFilter, { name }),
        },
        sort: true,
        customBodyRenderLite: (dataIndex) => {
          const groupManagers = filteredStudents[dataIndex].groupManagers;
          if (!groupManagers) {
            return '';
          }
          return (
            <>
              {groupManagers.map((m, index) => (
                <span key={m.id}>
                  <Link opensInNewTab to={m.nameLink}>
                    {m.name}
                  </Link>
                  {index < groupManagers.length - 1 && ', '}
                </span>
              ))}
            </>
          );
        },
      },
    });
  }
  if (isCourseGamified) {
    columns.push({
      name: 'level',
      label: t(translations.level),
      options: {
        filter: true,
        sort: true,
      },
    });
    columns.push({
      name: 'experiencePoints',
      label: t(translations.experiencePoints),
      options: {
        filter: false,
        sort: true,
        alignCenter: true,
        customBodyRenderLite: (dataIndex) => {
          const student = filteredStudents[dataIndex];
          return (
            <Link
              key={student.id}
              opensInNewTab
              to={student.experiencePointsLink}
            >
              {student.experiencePoints}
            </Link>
          );
        },
      },
    });
  }
  if (showVideo) {
    columns.push({
      name: 'videoSubmissionCount',
      label: t(translations.videoSubmissionCount, {
        courseVideoCount,
      }),
      options: {
        alignCenter: true,
        customBodyRenderLite: (dataIndex) => {
          const student = filteredStudents[dataIndex];
          return (
            <Link
              key={student.id}
              opensInNewTab
              to={student.videoSubmissionLink}
            >
              {student.videoSubmissionCount}
            </Link>
          );
        },
      },
    });
    columns.push({
      name: 'videoPercentWatched',
      label: t(translations.videoPercentWatched),
      options: {
        filter: false,
        sort: true,
        alignCenter: true,
        customBodyRender: (value) => <LinearProgressWithLabel value={value} />,
      },
    });
  }

  return (
    <DataTable
      columns={columns}
      data={filteredStudents}
      height="30px"
      includeRowNumber
      options={options}
      title={t(translations.tableTitle, numStudentType)}
    />
  );
};

export default StudentsStatisticsTable;
