import { FC, useState, memo, useMemo } from 'react';
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

import TableSubfolderRow from './TableSubfolderRow';
import TableMaterialRow from './TableMaterialRow';

interface Props extends WrappedComponentProps {
  currFolderId: number;
  subfolders: FolderMiniEntity[];
  materials: MaterialMiniEntity[];
  canEditSubfolders: boolean;
  isCurrentCourseStudent: boolean;
  isConcrete: boolean;
}

const WorkbinTable: FC<Props> = (props) => {
  const {
    currFolderId,
    subfolders,
    materials,
    canEditSubfolders,
    isCurrentCourseStudent,
    isConcrete,
  } = props;

  const [sortBy, setSortBy] = useState('Name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedSubfolders = useMemo(() => {
    const sortedData = subfolders.sort((a, b) => {
      switch (sortBy) {
        case 'Name':
          if (sortDirection === 'asc') {
            return a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1;
          }
          return a.name.toUpperCase() > b.name.toUpperCase() ? -1 : 1;

        case 'Start At':
          if (sortDirection === 'asc') {
            return a.startAt > b.startAt ? 1 : -1;
          }
          return a.startAt > b.startAt ? -1 : 1;

        case 'Last Modified':
          if (sortDirection === 'asc') {
            return a.updatedAt > b.updatedAt ? 1 : -1;
          }
          return a.updatedAt > b.updatedAt ? -1 : 1;

        default:
          return 0;
      }
    });
    return sortedData;
  }, [subfolders, sortBy, sortDirection]);

  const sortedMaterials = useMemo(() => {
    const sortedData = materials.sort((a, b) => {
      switch (sortBy) {
        case 'Name':
          if (sortDirection === 'asc') {
            return a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1;
          }
          return a.name.toUpperCase() > b.name.toUpperCase() ? -1 : 1;

        case 'Last Modified':
          if (sortDirection === 'asc') {
            return a.updatedAt > b.updatedAt ? 1 : -1;
          }
          return a.updatedAt > b.updatedAt ? -1 : 1;

        default:
          return 0;
      }
    });
    return sortedData;
  }, [materials, sortBy, sortDirection]);

  const sort = (columnName: string): void => {
    if (columnName === sortBy) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortBy(columnName);
      setSortDirection('asc');
    }
  };

  const columnHeaderWithSort = (columnName: string): JSX.Element => {
    let endIcon = <></>;
    if (sortBy === columnName && sortDirection === 'desc') {
      endIcon = <ArrowDropDownIcon />;
    } else if (sortBy === columnName && sortDirection === 'asc') {
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

  return (
    <Table sx={{ marginBottom: 2 }}>
      <TableHead>
        <TableRow>
          <TableCell style={{ padding: 2 }}>
            {columnHeaderWithSort('Name')}
          </TableCell>
          <TableCell style={{ padding: 2 }}>
            {columnHeaderWithSort('Last Modified')}
          </TableCell>
          {canEditSubfolders && (
            <TableCell style={{ padding: 2 }}>
              {columnHeaderWithSort('Start At')}
            </TableCell>
          )}
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
              canEditSubfolders={canEditSubfolders}
              isConcrete={isConcrete}
            />
          );
        })}
        {sortedMaterials.map((material) => {
          return (
            <TableMaterialRow
              key={`material-${material.id}`}
              currFolderId={currFolderId}
              material={material}
              canEditSubfolders={canEditSubfolders}
              isConcrete={isConcrete}
            />
          );
        })}
      </TableBody>
    </Table>
  );
};

export default memo(injectIntl(WorkbinTable), (prevProps, nextProps) => {
  return equal(prevProps, nextProps);
});
