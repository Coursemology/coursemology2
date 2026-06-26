import { FC, memo } from 'react';
import { defineMessages } from 'react-intl';
import { ArrowForward } from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { ConflictRow } from 'types/course/gradebook';

import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  name: {
    id: 'course.gradebook.ExternalGradeConflictTable.name',
    defaultMessage: 'Name',
  },
});

interface Props {
  rows: ConflictRow[];
  componentNames: string[];
  identifierLabel: string;
}

const formatGrade = (value: number | null): string =>
  value == null ? '—' : String(value);

const ExternalGradeConflictTable: FC<Props> = ({
  rows,
  componentNames,
  identifierLabel,
}) => {
  const { t } = useTranslation();
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{identifierLabel}</TableCell>
          <TableCell>{t(translations.name)}</TableCell>
          {componentNames.map((name) => (
            <TableCell key={name} sx={{ whiteSpace: 'nowrap' }}>
              {name}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.identifier}>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
              {row.identifier}
            </TableCell>
            <TableCell>{row.studentName}</TableCell>
            {componentNames.map((name) => {
              const cell = row.cells[name];
              if (cell?.changed) {
                return (
                  <TableCell key={name} sx={{ whiteSpace: 'nowrap' }}>
                    <Typography
                      component="span"
                      sx={{ textDecoration: 'line-through' }}
                      variant="body2"
                    >
                      {formatGrade(cell.existing)}
                    </Typography>
                    <ArrowForward
                      fontSize="inherit"
                      sx={{
                        mx: 0.5,
                        verticalAlign: 'middle',
                        display: 'inline-block',
                      }}
                    />
                    <Typography
                      component="span"
                      fontWeight="bold"
                      variant="body2"
                    >
                      {formatGrade(cell.inFile)}
                    </Typography>
                  </TableCell>
                );
              }
              // unchanged / new-fill / blank: show the value that will be stored
              const value = cell == null ? null : cell.inFile ?? cell.existing;
              return (
                <TableCell key={name} sx={{ whiteSpace: 'nowrap' }}>
                  {formatGrade(value)}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default memo(ExternalGradeConflictTable);
