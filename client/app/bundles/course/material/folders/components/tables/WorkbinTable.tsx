import { FC, useEffect, useState, memo } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import equal from 'fast-deep-equal';

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
} from '@mui/icons-material';

import {
  FolderMiniEntity,
  MaterialMiniEntity,
} from 'types/course/material/folders';

import LoadingIndicator from 'lib/components/LoadingIndicator';

import TableSubfolderRow from './TableSubfolderRow';
import TableMaterialRow from './TableMaterialRow';

interface Props extends WrappedComponentProps {
  currFolderId: number;
  subfolders: FolderMiniEntity[];
  materials: MaterialMiniEntity[];
  isCurrentCourseStudent: boolean;
  isConcrete: boolean;
}

const WorkbinTable: FC<Props> = (props) => {
  const {
    currFolderId,
    subfolders,
    materials,
    isCurrentCourseStudent,
    isConcrete,
  } = props;

  const [isTableLoading, setIsTableLoading] = useState(false);

  const [sortedSubfolders, setSortedSubfolders] = useState(subfolders);
  const [sortedMaterials, setSortedMaterials] = useState(materials);

  const [sortBy, setSortBy] = useState('Name');
  const [sortDirection, setSortDirection] = useState<'down' | 'up'>('down');

  useEffect(() => {
    if (!equal(subfolders, sortedSubfolders)) {
      setSortedSubfolders(subfolders);
      setSortBy('Name');
      setSortDirection('down');
    }
  }, [subfolders]);

  useEffect(() => {
    if (!equal(materials, sortedMaterials)) {
      setSortedMaterials(materials);
      setSortBy('Name');
      setSortDirection('down');
    }
  }, [materials]);

  const sortWithDirection = (
    columnName: string,
    direction: 'down' | 'up',
  ): void => {
    switch (columnName) {
      case 'Name':
        if (direction === 'up') {
          setSortedSubfolders(
            subfolders.sort((a, b) =>
              a.name.toUpperCase() > b.name.toUpperCase() ? -1 : 1,
            ),
          );
          setSortedMaterials(
            materials.sort((a, b) =>
              a.name.toUpperCase() > b.name.toUpperCase() ? -1 : 1,
            ),
          );
        } else {
          setSortedSubfolders(
            subfolders.sort((a, b) =>
              a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1,
            ),
          );
          setSortedMaterials(
            materials.sort((a, b) =>
              a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1,
            ),
          );
        }
        break;

      case 'Start At':
        if (direction === 'up') {
          setSortedSubfolders(
            subfolders.sort((a, b) => (a.startAt > b.startAt ? -1 : 1)),
          );
        } else {
          setSortedSubfolders(
            subfolders.sort((a, b) => (a.startAt > b.startAt ? 1 : -1)),
          );
        }
        // Materials does not have a startAt
        setSortedMaterials(materials);
        break;

      case 'Last Modified':
        if (direction === 'up') {
          setSortedSubfolders(
            subfolders.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1)),
          );
          setSortedMaterials(
            materials.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1)),
          );
        } else {
          setSortedSubfolders(
            subfolders.sort((a, b) => (a.updatedAt > b.updatedAt ? 1 : -1)),
          );
          setSortedMaterials(
            materials.sort((a, b) => (a.updatedAt > b.updatedAt ? 1 : -1)),
          );
        }
        break;

      default:
        break;
    }
  };

  const sort = (columnName: string): void => {
    if (columnName === sortBy) {
      if (sortDirection === 'down') {
        sortWithDirection(columnName, 'up');
        setSortDirection('up');
      } else {
        sortWithDirection(columnName, 'down');
        setSortDirection('down');
      }
    } else {
      sortWithDirection(columnName, 'down');
      setSortBy(columnName);
      setSortDirection('down');
    }
  };

  const columnHeaderWithSort = (columnName: string): JSX.Element => {
    let endIcon = <></>;
    if (sortBy === columnName && sortDirection === 'down') {
      endIcon = <ArrowDropDownIcon />;
    } else if (sortBy === columnName && sortDirection === 'up') {
      endIcon = <ArrowDropUpIcon />;
    }

    return (
      <Button
        onClick={(): void => {
          sort(columnName);
        }}
        endIcon={endIcon}
        disableFocusRipple
        disableRipple
        style={{ padding: 0, alignItems: 'center', justifyContent: 'start' }}
      >
        {columnName}
      </Button>
    );
  };

  if (isTableLoading) {
    return <LoadingIndicator />;
  }
  return (
    <>
      <Table sx={{ marginBottom: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ padding: 2 }}>
              {columnHeaderWithSort('Name')}
            </TableCell>
            <TableCell style={{ padding: 2 }}>
              {columnHeaderWithSort('Last Modified')}
            </TableCell>
            <TableCell style={{ padding: 2 }}>
              {columnHeaderWithSort('Start At')}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedSubfolders.map((subfolder) => {
            return (
              <TableSubfolderRow
                key={`subfolder-${subfolder.id}`}
                currFolderId={currFolderId}
                subfolder={subfolder}
                isCurrentCourseStudent={isCurrentCourseStudent}
                isConcrete={isConcrete}
                setIsTableLoading={setIsTableLoading}
              />
            );
          })}
          {sortedMaterials.map((material) => {
            return (
              <TableMaterialRow
                key={`material-${material.id}`}
                currFolderId={currFolderId}
                material={material}
                isConcrete={isConcrete}
              />
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default memo(injectIntl(WorkbinTable), (prevProps, nextProps) => {
  return equal(prevProps, nextProps);
});
