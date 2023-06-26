import { FC, memo, useEffect, useState } from 'react';
import { TableCell, TableRow, TextField } from '@mui/material';
import equal from 'fast-deep-equal';
import {
  ExperiencePointsRecordMiniEntity,
  ExperiencePointsRowData,
} from 'types/course/experiencePointsRecords';

import Link from 'lib/components/core/Link';
import { formatLongDateTime } from 'lib/moment';

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
  const [defaultRowData, setDefaultRowData] = useState({
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
    setDefaultRowData({
      id: record.id,
      reason: record.reason.text,
      pointsAwarded: record.pointsAwarded,
    });
  }, [record]);

  const onUpdateReason = (value: string): void => {
    const newData: ExperiencePointsRowData = { ...rowData, reason: value };
    setIsDirty(value.trim().length > 0 && !equal(newData, defaultRowData));
    setRowData(newData);
  };

  const onUpdatePoints = (value: string): void => {
    if (!Number.isNaN(+value)) {
      const newData: ExperiencePointsRowData = {
        ...rowData,
        pointsAwarded: +value,
      };
      setIsDirty(
        !equal(newData, defaultRowData) && rowData.reason.trim().length > 0,
      );
      setRowData(newData);
    }
  };

  const handleSave = (newData: ExperiencePointsRowData): void => {
    setDefaultRowData({ ...newData });
    setIsDirty(false);
  };

  const renderReason = (): JSX.Element | string => {
    if (!record.reason.isManuallyAwarded) {
      return (
        <Link opensInNewTab to={record.reason.link}>
          {rowData.reason}
        </Link>
      );
    }
    if (record.permissions.canUpdate) {
      return (
        <TextField
          key={`reason-${record.id}`}
          fullWidth
          id={`reason-${record.id}`}
          onChange={(e): void => onUpdateReason(e.target.value)}
          value={rowData.reason}
          variant="standard"
        />
      );
    }
    return rowData.reason;
  };

  return (
    <TableRow key={record.id} hover id={`record-${record.id}`}>
      <TableCell>{formatLongDateTime(record.updatedAt)}</TableCell>

      <TableCell>
        <Link to={record.updater.userUrl ?? '#'}>{record.updater.name}</Link>
      </TableCell>

      <TableCell>{renderReason()}</TableCell>

      <TableCell>
        {record.permissions.canUpdate ? (
          <TextField
            key={`points-${record.id}`}
            id={`points-${record.id}`}
            onChange={(e): void => onUpdatePoints(e.target.value)}
            onKeyPress={onlyNumberInput}
            type="number"
            value={rowData.pointsAwarded.toString()}
            variant="standard"
          />
        ) : (
          record.pointsAwarded
        )}
      </TableCell>

      <TableCell>
        <PointManagementButtons
          data={rowData}
          handleSave={handleSave}
          isDirty={isDirty}
          isManuallyAwarded={record.reason.isManuallyAwarded}
          permissions={record.permissions}
        />
      </TableCell>
    </TableRow>
  );
};

export default memo(ExperiencePointsTableRow, (prevProps, nextProps) =>
  equal(prevProps.record, nextProps.record),
);
