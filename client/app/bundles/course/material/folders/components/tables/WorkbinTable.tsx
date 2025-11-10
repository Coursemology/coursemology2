import { FC, memo, ReactNode, useMemo, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
} from '@mui/icons-material';
import {
  Button,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import equal from 'fast-deep-equal';
import {
  FolderMiniEntity,
  MaterialMiniEntity,
} from 'types/course/material/folders';

import TableContainer from 'lib/components/core/layouts/TableContainer';
import useTranslation from 'lib/hooks/useTranslation';

import TableMaterialRow from './TableMaterialRow';
import TableSubfolderRow from './TableSubfolderRow';

interface Props {
  currFolderId: number;
  subfolders: FolderMiniEntity[];
  materials: MaterialMiniEntity[];
  isCurrentCourseStudent: boolean;
  canManageKnowledgeBase: boolean;
  isConcrete: boolean;
}

const translations = defineMessages({
  name: {
    id: 'course.material.folders.WorkbinTable.name',
    defaultMessage: 'Name',
  },
  lastModified: {
    id: 'course.material.folders.WorkbinTable.lastModified',
    defaultMessage: 'Last Modified',
  },
  startAt: {
    id: 'course.material.folders.WorkbinTable.startAt',
    defaultMessage: 'Start At',
  },
});

const translationsMap: {
  [key: string]: { id: string; defaultMessage: string };
} = {
  Name: translations.name,
  'Last Modified': translations.lastModified,
  'Start At': translations.startAt,
};

const WorkbinTable: FC<Props> = (props) => {
  const {
    currFolderId,
    subfolders,
    materials,
    isCurrentCourseStudent,
    canManageKnowledgeBase,
    isConcrete,
  } = props;

  const [sortBy, setSortBy] = useState('Name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { t } = useTranslation();

  const sortedSubfolders = useMemo(() => {
    return subfolders.sort((a, b) => {
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
  }, [subfolders, sortBy, sortDirection]);

  const sortedMaterials = useMemo(() => {
    return materials.sort((a, b) => {
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
    let endIcon: ReactNode = null;
    if (sortBy === columnName && sortDirection === 'desc') {
      endIcon = <ArrowDropDownIcon />;
    } else if (sortBy === columnName && sortDirection === 'asc') {
      endIcon = <ArrowDropUpIcon />;
    }

    return (
      <Button
        disableFocusRipple
        disableRipple
        endIcon={endIcon}
        onClick={(): void => {
          sort(columnName);
        }}
        style={{ padding: 0, alignItems: 'center', justifyContent: 'start' }}
      >
        {t(translationsMap[columnName])}
      </Button>
    );
  };

  return (
    <TableContainer dense variant="bare">
      <TableHead>
        <TableRow>
          <TableCell>{columnHeaderWithSort('Name')}</TableCell>
          <TableCell>{columnHeaderWithSort('Last Modified')}</TableCell>
          {!isCurrentCourseStudent && (
            <TableCell>{columnHeaderWithSort('Start At')}</TableCell>
          )}
          {/* Temporarily commented out until we decide whether or not to allow users to add/remove 
          from knowledge base from Workbin directly */}
          {/* {canManageKnowledgeBase && <TableCell>Knowledge Base</TableCell>} */}
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedSubfolders.map((subfolder) => {
          return (
            <TableSubfolderRow
              key={`subfolder-${subfolder.id}`}
              canManageKnowledgeBase={canManageKnowledgeBase}
              currFolderId={currFolderId}
              isConcrete={isConcrete}
              isCurrentCourseStudent={isCurrentCourseStudent}
              subfolder={subfolder}
            />
          );
        })}
        {sortedMaterials.map((material) => {
          return (
            <TableMaterialRow
              key={`material-${material.id}`}
              canManageKnowledgeBase={canManageKnowledgeBase}
              currFolderId={currFolderId}
              isConcrete={isConcrete}
              isCurrentCourseStudent={isCurrentCourseStudent}
              material={material}
            />
          );
        })}
      </TableBody>
    </TableContainer>
  );
};

export default memo(WorkbinTable, (prevProps, nextProps) => {
  return equal(prevProps, nextProps);
});
