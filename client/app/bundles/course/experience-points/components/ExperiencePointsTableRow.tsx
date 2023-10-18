import { FC, memo, useEffect, useState } from 'react';
import { TableCell, TableRow } from '@mui/material';
import equal from 'fast-deep-equal';
import {
  ExperiencePointsRecordMiniEntity,
  ExperiencePointsRowData,
} from 'types/course/experiencePointsRecords';

import PointManagementButtons from 'course/users/components/buttons/PointManagementButtons';
import NumberTextField from 'lib/components/core/fields/NumberTextField';
import TextField from 'lib/components/core/fields/TextField';
import Link from 'lib/components/core/Link';
import { formatMiniDateTime } from 'lib/moment';

interface Props {
  id: number;
  isStudentPage?: boolean;
  record: ExperiencePointsRecordMiniEntity;
  maxExp?: number;
  isDownloading?: boolean;
}

const ExperiencePointsTableRow: FC<Props> = (props) => {
  const { record, id, isStudentPage, maxExp, isDownloading } = props;
  const [isDirty, setIsDirty] = useState(false);
  const [errorHelperText, setErrorHelperText] = useState('');
  const [errorReasonText, setErrorReasonText] = useState('');
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
  const isNotManuallyAwarded = maxExp;

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
    const newData: ExperiencePointsRowData = {
      ...rowData,
      pointsAwarded:
        Number.isNaN(Number(value)) || value === '' ? value : Number(value),
    };

    const defaultData: ExperiencePointsRowData = {
      ...defaultRowData,
      pointsAwarded: Number(defaultRowData.pointsAwarded),
    };
    setIsDirty(
      !equal(newData, defaultData) && rowData.reason.trim().length > 0,
    );
    setRowData(newData);
  };

  const handleSave = (newData: ExperiencePointsRowData): void => {
    if (!Number.isNaN(Number(newData.pointsAwarded))) {
      const updateData: ExperiencePointsRowData = {
        ...newData,
        pointsAwarded: Number(newData.pointsAwarded),
      };
      setDefaultRowData({ ...updateData });
      setIsDirty(false);
    }
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
          disabled={isDownloading}
          error={errorReasonText !== ''}
          fullWidth
          helperText={errorReasonText}
          id={`reason-${record.id}`}
          onChange={(e): void => {
            if (e.target.value.length === 0) {
              setErrorReasonText('must contain at least 1 character');
            } else {
              setErrorReasonText('');
            }
            onUpdateReason(e.target.value);
          }}
          value={rowData.reason}
          variant="standard"
        />
      );
    }
    return rowData.reason;
  };

  return (
    <TableRow key={record.id} hover id={`record-${record.id}`}>
      <TableCell>{formatMiniDateTime(record.updatedAt)}</TableCell>
      {!isStudentPage && (
        <TableCell>
          {record.student.userUrl ? (
            <Link to={record.student.userUrl}>{record.student.name}</Link>
          ) : (
            record.student.name
          )}
        </TableCell>
      )}

      <TableCell>
        <Link to={record.updater.userUrl ?? '#'}>{record.updater.name}</Link>
      </TableCell>

      <TableCell>{renderReason()}</TableCell>

      <TableCell>
        {record.permissions.canUpdate ? (
          <NumberTextField
            key={`points-${record.id}`}
            disabled={isDownloading}
            error={errorHelperText !== ''}
            helperText={errorHelperText}
            id={`points-${record.id}`}
            onChange={(e): void => {
              // at this point, any non-integer value will be rounded down
              const inputValue = Number(e.target.value);
              if (Number.isNaN(inputValue)) {
                // in case the input is '-' or '.'
                setErrorHelperText('must be a number');
              } else if (isNotManuallyAwarded) {
                if (inputValue < 0) {
                  setErrorHelperText('must not be negative');
                } else if (inputValue > maxExp!) {
                  setErrorHelperText(`must be at most ${maxExp!}`);
                } else {
                  setErrorHelperText('');
                }
              } else {
                setErrorHelperText('');
              }
              onUpdatePoints(e.target.value);
            }}
            placeholder={record.pointsAwarded?.toString() ?? 0}
            value={rowData.pointsAwarded}
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
          isDownloading={isDownloading}
          isErrorInput={errorHelperText !== '' || errorReasonText !== ''}
          isManuallyAwarded={record.reason.isManuallyAwarded}
          permissions={record.permissions}
          studentId={record.student.id}
        />
      </TableCell>
    </TableRow>
  );
};

export default memo(
  ExperiencePointsTableRow,
  (prevProps, nextProps) =>
    equal(prevProps.record, nextProps.record) &&
    equal(prevProps.isDownloading, nextProps.isDownloading),
);
