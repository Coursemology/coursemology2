import { FC, memo } from 'react';
import { TableBody, TableCell, TableHead } from '@mui/material';
import equal from 'fast-deep-equal';
import { ExperiencePointsRecordMiniEntity } from 'types/course/experiencePointsRecords';

import TableContainer from 'lib/components/core/layouts/TableContainer';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import ExperiencePointsTableRow from './ExperiencePointsTableRow';

interface Props {
  records: ExperiencePointsRecordMiniEntity[];
  disabled: boolean;
  isStudentPage?: boolean;
  isLoading: boolean;
}

const ExperiencePointsTable: FC<Props> = (props) => {
  const { isStudentPage, isLoading, disabled, records } = props;

  const { t } = useTranslation();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <TableContainer dense variant="bare">
      <TableHead>
        <TableCell>{t(tableTranslations.updatedAt)}</TableCell>
        {!isStudentPage && <TableCell>{t(tableTranslations.name)}</TableCell>}
        <TableCell>{t(tableTranslations.updater)}</TableCell>
        <TableCell>{t(tableTranslations.reason)}</TableCell>
        <TableCell>{t(tableTranslations.experiencePointsAwarded)}</TableCell>
        <TableCell />
      </TableHead>

      <TableBody>
        {records.map((record) => (
          <ExperiencePointsTableRow
            key={record.id}
            disabled={disabled}
            isStudentPage={isStudentPage}
            record={record}
          />
        ))}
      </TableBody>
    </TableContainer>
  );
};

export default memo(ExperiencePointsTable, equal);
