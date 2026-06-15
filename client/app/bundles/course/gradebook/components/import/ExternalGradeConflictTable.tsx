import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { WarningAmber } from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import type { ImportConflict } from 'types/course/gradebook';

import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  component: {
    id: 'course.gradebook.ExternalGradeConflictTable.component',
    defaultMessage: 'Component',
  },
  student: {
    id: 'course.gradebook.ExternalGradeConflictTable.student',
    defaultMessage: 'Student',
  },
  existing: {
    id: 'course.gradebook.ExternalGradeConflictTable.existing',
    defaultMessage: 'Existing grade',
  },
  inFile: {
    id: 'course.gradebook.ExternalGradeConflictTable.inFile',
    defaultMessage: 'In-file grade',
  },
  mismatch: {
    id: 'course.gradebook.ExternalGradeConflictTable.mismatch',
    defaultMessage:
      'This identifier now resolves to a different student than the existing grade was imported under.',
  },
});

interface Props {
  rows: ImportConflict[];
}

const ExternalGradeConflictTable: FC<Props> = ({ rows }) => {
  const { t } = useTranslation();
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{t(translations.component)}</TableCell>
          <TableCell>{t(translations.student)}</TableCell>
          <TableCell>{t(translations.existing)}</TableCell>
          <TableCell>{t(translations.inFile)}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={`${row.component}-${row.studentName}`}>
            <TableCell>{row.component}</TableCell>
            <TableCell>
              {row.studentName}
              {row.identifierMismatch && (
                <Tooltip title={t(translations.mismatch)}>
                  <WarningAmber
                    color="warning"
                    fontSize="inherit"
                    sx={{ ml: 0.5, verticalAlign: 'middle' }}
                  />
                </Tooltip>
              )}
            </TableCell>
            <TableCell>{row.existingGrade}</TableCell>
            <TableCell>
              <Typography fontWeight="bold" variant="body2">
                {row.inFileGrade}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ExternalGradeConflictTable;
