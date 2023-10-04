import { FC } from 'react';
import { TableCell, TableRow } from '@mui/material';
import { ExperiencePointsRecordMiniEntity } from 'types/course/experiencePointsRecords';

import Link from 'lib/components/core/Link';
import { formatMiniDateTime } from 'lib/moment';

interface Props {
  record: ExperiencePointsRecordMiniEntity;
}

const ExperiencePointsTableRow: FC<Props> = (props) => {
  const { record } = props;

  return (
    <TableRow key={record.id} hover id={`record-${record.id}`}>
      <TableCell>{formatMiniDateTime(record.updatedAt)}</TableCell>
      <TableCell>
        {record.student.userUrl ? (
          <Link to={record.student.userUrl}>{record.student.name}</Link>
        ) : (
          record.student.name
        )}
      </TableCell>

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

      <TableCell className="max-md:!hidden text-right">
        {record.pointsAwarded}
      </TableCell>
    </TableRow>
  );
};

export default ExperiencePointsTableRow;
