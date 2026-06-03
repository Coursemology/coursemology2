import { FC } from 'react';
import { defineMessages } from 'react-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { InvitationUpdatedItem } from 'types/course/userInvitations';

import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

interface Props {
  rows: InvitationUpdatedItem[];
}

const translations = defineMessages({
  currentExternalId: {
    id: 'lib.translations.table.column.currentExternalId',
    defaultMessage: 'Current External ID',
  },
  newExternalId: {
    id: 'lib.translations.table.column.newExternalId',
    defaultMessage: 'New External ID',
  },
});

const ExternalIdConflictTable: FC<Props> = ({ rows }) => {
  const { t } = useTranslation();

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{t(tableTranslations.name)}</TableCell>
          <TableCell>{t(tableTranslations.email)}</TableCell>
          <TableCell>{t(translations.currentExternalId)}</TableCell>
          <TableCell>{t(translations.newExternalId)}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>
              {row.previousExternalId ?? (
                <Typography color="text.secondary" variant="body2">
                  —
                </Typography>
              )}
            </TableCell>
            <TableCell>
              <Typography fontWeight="bold" variant="body2">
                {row.externalId}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ExternalIdConflictTable;
