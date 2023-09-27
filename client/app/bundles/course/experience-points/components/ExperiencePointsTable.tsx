import { FC } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Paper, Table, TableBody, TableCell, TableHead } from '@mui/material';
import { AllExperiencePointsRecordListData } from 'types/course/experiencePointsRecords';

import tableTranslations from 'lib/translations/table';

import ExperiencePointsTableRow from './ExperiencePointsTableRow';

interface Props extends WrappedComponentProps {
  records: AllExperiencePointsRecordListData[];
}

const ExperiencePointsTable: FC<Props> = (props) => {
  const { intl, records } = props;

  return (
    <Paper elevation={4} sx={{ margin: '12px 0px' }}>
      <Table size="small">
        <TableHead>
          <TableCell>{intl.formatMessage(tableTranslations.name)}</TableCell>
          <TableCell>
            {intl.formatMessage(tableTranslations.updatedAt)}
          </TableCell>
          <TableCell>{intl.formatMessage(tableTranslations.updater)}</TableCell>
          <TableCell>{intl.formatMessage(tableTranslations.reason)}</TableCell>
          <TableCell>
            {intl.formatMessage(tableTranslations.experiencePointsAwarded)}
          </TableCell>
        </TableHead>

        <TableBody>
          {records.map((record) => (
            <ExperiencePointsTableRow key={record.id} record={record} />
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default injectIntl(ExperiencePointsTable);
