import { TableCell, TableRow, TextField } from '@mui/material';
import { FC, memo, useEffect, useState } from 'react';
import {
  ExperiencePointsRecordMiniEntity,
  ExperiencePointsRowData,
} from 'types/course/experiencePointsRecords';
import { getCourseUserURL, getUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import equal from 'fast-deep-equal';

import { formatLongDateTime } from 'lib/moment';
import { Link } from 'react-router-dom';
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
        <a target="_blank" rel="noopener noreferrer" href={record.reason.link}>
          {rowData.reason}
        </a>
      );
    }
    if (record.permissions.canUpdate) {
      return (
        <TextField
          id={`reason-${record.id}`}
          key={`reason-${record.id}`}
          value={rowData.reason}
          onChange={(e): void => onUpdateReason(e.target.value)}
          variant="standard"
          fullWidth
        />
      );
    }
    return rowData.reason;
  };

  return (
    <TableRow hover key={record.id} id={`record-${record.id}`}>
      <TableCell>{formatLongDateTime(record.updatedAt)}</TableCell>

      <TableCell>
        <Link
          to={
            record.updaterUser.isCourseUser
              ? getCourseUserURL(getCourseId(), record.updaterUser.id)
              : getUserURL(record.updaterUser.id)
          }
        >
          {record.updaterUser.name}
        </Link>
      </TableCell>

      <TableCell>{renderReason()}</TableCell>

      <TableCell>
        {record.permissions.canUpdate ? (
          <TextField
            id={`points-${record.id}`}
            key={`points-${record.id}`}
            value={rowData.pointsAwarded.toString()}
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
        <PointManagementButtons
          permissions={record.permissions}
          data={rowData}
          isDirty={isDirty}
          isManuallyAwarded={record.reason.isManuallyAwarded}
          handleSave={handleSave}
        />
      </TableCell>
    </TableRow>
  );
};

export default memo(ExperiencePointsTableRow, (prevProps, nextProps) =>
  equal(prevProps.record, nextProps.record),
);
