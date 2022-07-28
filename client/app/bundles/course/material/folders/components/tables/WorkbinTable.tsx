import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
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
  isCurrentCourseStudent: boolean;
  isConcrete: boolean;
}

const translations = defineMessages({
  tableHeaderName: {
    id: 'course.materials.folders.tableHeaderName',
    defaultMessage: 'Name',
  },
  tableHeaderLastModified: {
    id: 'course.materials.folders.tableHeaderLastModified',
    defaultMessage: 'Last Modified',
  },
  tableHeaderStartAt: {
    id: 'course.materials.folders.tableHeaderStartAt',
    defaultMessage: 'Start At',
  },
});

const WorkbinTable: FC<Props> = (props) => {
  const {
    intl,
    currFolderId,
    subfolders,
    materials,
    isCurrentCourseStudent,
    isConcrete,
  } = props;
  const [sortedSubfolders, setSortedSubfolders] = useState(subfolders);
  const [sortedMaterials, setSortedMaterials] = useState(materials);

  useEffect(() => {
    setSortedSubfolders(subfolders);
  }, [subfolders]);

  useEffect(() => {
    setSortedMaterials(materials);
  }, [materials]);

  const [sortBy, setSortBy] = useState(
    intl.formatMessage(translations.tableHeaderName),
  );
  const [sortDirection, setSortDirection] = useState<'down' | 'up'>('down');

  const sortWithDirection = (
    columnName: string,
    direction: 'down' | 'up',
  ): void => {
    switch (columnName) {
      case intl.formatMessage(translations.tableHeaderName):
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

      case intl.formatMessage(translations.tableHeaderStartAt):
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

      case intl.formatMessage(translations.tableHeaderLastModified):
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

  return (
    <>
      <Table sx={{ marginBottom: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ padding: 2 }}>
              {columnHeaderWithSort(
                intl.formatMessage(translations.tableHeaderName),
              )}
            </TableCell>
            <TableCell style={{ padding: 2 }}>
              {columnHeaderWithSort(
                intl.formatMessage(translations.tableHeaderLastModified),
              )}
            </TableCell>
            <TableCell style={{ padding: 2 }}>
              {columnHeaderWithSort(
                intl.formatMessage(translations.tableHeaderStartAt),
              )}
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

export default injectIntl(WorkbinTable);
