import { TableCell, TableRow, TextField } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import {
  ExperiencePointsRecordMiniEntity,
  ExperiencePointsRowData,
} from 'types/course/experiencePointsRecords';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

import moment from 'moment';
import PointManagementButtons from '../buttons/PointManagementButtons';

interface Props {
  id: number;
  record: ExperiencePointsRecordMiniEntity;
}

const onlyNumberInput = (evt): void => {
  if (evt.which === 8) {
    return;
  }
  if (evt.which < 48 || evt.which > 57) {
    evt.preventDefault();
  }
};

const ExperiencePointsTableRow: FC<Props> = (props) => {
  const { record, id } = props;
  const [isDirty, setIsDirty] = useState(false);
  const [rowData, setRowData] = useState({
    id,
    reason: '',
    pointsAwarded: 0,
  } as ExperiencePointsRowData);

  useEffect(() => {
    setRowData({
      id: record.id,
      reason: record.reason.text,
      pointsAwarded: record.pointsAwarded,
    });
  }, [record]);

  const onUpdateReason = (value: string): void => {
    setRowData({ ...rowData, reason: value });
    setIsDirty(value.trim().length > 0);
  };

  const onUpdatePoints = (value: string): void => {
    setIsDirty(value.trim().length > 0);
    if (!Number.isNaN(+value)) {
      setRowData({ ...rowData, pointsAwarded: +value });
    }
  };

  return (
    <TableRow hover key={record.id}>
      <TableCell>
        <a href={getCourseUserURL(getCourseId(), record.updaterCourseUser.id)}>
          {record.updaterCourseUser.name}
        </a>
      </TableCell>
      <TableCell>
        {record.reason.manuallyAwarded && record.permissions.canUpdate ? (
          <TextField
            id={`record-${record.id}`}
            key={`record-${record.id}`}
            value={rowData.reason}
            onChange={(e): void => onUpdateReason(e.target.value)}
            variant="standard"
          />
        ) : (
          <a href={record.reason.link}>{rowData.reason}</a>
        )}
      </TableCell>
      <TableCell>
        {record.permissions.canUpdate ? (
          <TextField
            id={`record-${record.id}`}
            key={`record-${record.id}`}
            value={rowData.pointsAwarded}
            onChange={(e): void => onUpdatePoints(e.target.value)}
            variant="standard"
            type="number"
            onKeyPress={onlyNumberInput}
          />
        ) : (
          record.pointsAwarded
        )}
      </TableCell>
      <TableCell>
        {moment(record.updatedAt).format('YYYY-MM-DD HH:mm:ss ZZ')}
      </TableCell>
      <TableCell>
        <PointManagementButtons
          permissions={record.permissions}
          data={rowData}
          isDirty={isDirty}
          manuallyAwarded={record.reason.manuallyAwarded}
        />
      </TableCell>
    </TableRow>
  );
};

export default ExperiencePointsTableRow;
