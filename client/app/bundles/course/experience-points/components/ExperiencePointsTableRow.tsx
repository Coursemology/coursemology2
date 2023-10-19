import { FC, memo, useEffect, useState } from 'react';
import { TableCell, TableRow } from '@mui/material';
import equal from 'fast-deep-equal';
import {
  ExperiencePointsRecordMiniEntity,
  ExperiencePointsRowData,
} from 'types/course/experiencePointsRecords';

import PointManagementButtons from 'course/users/components/buttons/PointManagementButtons';
import Link from 'lib/components/core/Link';
import { formatMiniDateTime } from 'lib/moment';

import ExperiencePointsNumberField from './ExperiencePointsNumberField';
import ExperiencePointsReasonField from './ExperiencePointsReasonField';

interface Props {
  isStudentPage?: boolean;
  record: ExperiencePointsRecordMiniEntity;
  disabled: boolean;
}

const ExperiencePointsTableRow: FC<Props> = (props) => {
  const { record, isStudentPage, disabled } = props;
  const [isDirty, setIsDirty] = useState(false);
  const [rowData, setRowData] = useState({
    id: record.id,
    reason: '',
    pointsAwarded: 0,
  } as ExperiencePointsRowData);
  const [defaultRowData, setDefaultRowData] = useState({
    id: record.id,
    reason: '',
    pointsAwarded: 0,
  } as ExperiencePointsRowData);

  const invalidInputPoints =
    Number.isNaN(rowData.pointsAwarded) ||
    (!record.reason.isManuallyAwarded &&
      (Number(rowData.pointsAwarded) < 0 ||
        Number(rowData.pointsAwarded) > record.reason.maxExp!));

  const saveDisabled =
    disabled ||
    !isDirty ||
    invalidInputPoints ||
    rowData.reason.trim().length === 0 ||
    Number.isNaN(Number(rowData.pointsAwarded));

  const deleteDisabled = disabled;

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

  return (
    <TableRow key={record.id} hover id={`record-${record.id}`}>
      <TableCell>{formatMiniDateTime(record.updatedAt)}</TableCell>
      {!isStudentPage && (
        <TableCell>
          <Link to={record.student.userUrl ?? '#'}>{record.student.name}</Link>
        </TableCell>
      )}

      <TableCell>
        <Link to={record.updater.userUrl ?? '#'}>{record.updater.name}</Link>
      </TableCell>

      <TableCell>
        <ExperiencePointsReasonField
          defaultReason={defaultRowData.reason}
          disabled={disabled}
          record={record}
          rowData={rowData}
          setIsDirty={setIsDirty}
          setRowData={setRowData}
        />
      </TableCell>

      <TableCell>
        <ExperiencePointsNumberField
          defaultPoint={Number(defaultRowData.pointsAwarded)}
          disabled={disabled}
          record={record}
          rowData={rowData}
          setIsDirty={setIsDirty}
          setRowData={setRowData}
        />
      </TableCell>

      <TableCell>
        <PointManagementButtons
          data={rowData}
          deleteDisabled={deleteDisabled}
          handleSave={handleSave}
          isManuallyAwarded={record.reason.isManuallyAwarded}
          permissions={record.permissions}
          saveDisabled={saveDisabled}
          studentId={record.student.id}
        />
      </TableCell>
    </TableRow>
  );
};

export default memo(ExperiencePointsTableRow, equal);
