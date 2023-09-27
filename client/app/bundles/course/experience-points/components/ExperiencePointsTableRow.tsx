import { FC } from 'react';
import { TableCell, TableRow } from '@mui/material';
import { AllExperiencePointsRecordMiniEntity } from 'types/course/experiencePointsRecords';

import Link from 'lib/components/core/Link';
import { formatLongDateTime } from 'lib/moment';

interface Props {
  record: AllExperiencePointsRecordMiniEntity;
}

const ExperiencePointsTableRow: FC<Props> = (props) => {
  const { record } = props;

  return (
    <TableRow key={record.id} hover id={`record-${record.id}`}>
      <TableCell>
        {record.userExperienceUrl ? (
          <Link to={record.userExperienceUrl}>{record.courseUserName}</Link>
        ) : (
          record.courseUserName
        )}
      </TableCell>

      <TableCell>{formatLongDateTime(record.updatedAt)}</TableCell>

      <TableCell>
        <Link to={record.updater.userUrl ?? '#'}>{record.updater.name}</Link>
      </TableCell>

      <TableCell>
        {record.reason.isManuallyAwarded ? (
          record.reason.text
        ) : (
          <Link opensInNewTab to={record.reason.link}>
            {record.reason.text}
          </Link>
        )}
      </TableCell>

      <TableCell>{record.pointsAwarded}</TableCell>
    </TableRow>
  );
};

export default ExperiencePointsTableRow;
