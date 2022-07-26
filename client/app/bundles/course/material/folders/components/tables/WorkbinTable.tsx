import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  FolderMiniEntity,
  MaterialMiniEntity,
} from 'types/course/material/folders';

import {
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Block as BlockIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

import { getFullDateTime } from 'lib/helpers/timehelper';
import { getCourseId } from 'lib/helpers/url-helpers';
import { getCourseUserURL, getUserURL } from 'lib/helpers/url-builders';

import WorkbinTableButtons from '../buttons/WorkbinTableButtons';

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
  subfolderBlockedTooltip: {
    id: 'course.materials.folders.subfolderBlockedTooltip',
    defaultMessage:
      "This folder is hidden from students as it's start time has not been reached",
  },
  visibleBecauseSdlTooltip: {
    id: 'course.materials.folders.visibleBecauseSdlTooltip',
    defaultMessage:
      'This folder is visible to students before the start time because of Self-Directed Learning',
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
            subfolders.sort((a, b) => (a.name > b.name ? -1 : 1)),
          );
          setSortedMaterials(
            materials.sort((a, b) => (a.name > b.name ? -1 : 1)),
          );
        } else {
          setSortedSubfolders(
            subfolders.sort((a, b) => (a.name > b.name ? 1 : -1)),
          );
          setSortedMaterials(
            materials.sort((a, b) => (a.name > b.name ? 1 : -1)),
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
    const endIcon =
      sortBy === columnName ? (
        sortDirection === 'down' ? (
          <ArrowDropDownIcon />
        ) : (
          <ArrowDropUpIcon />
        )
      ) : (
        <></>
      );

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
              <TableRow
                key={`subfolder-${subfolder.id}`}
                id={`subfolder-${subfolder.id}`}
              >
                <TableCell style={{ padding: 2 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <FolderIcon htmlColor="grey" />
                      <Link
                        to={`/courses/${getCourseId()}/materials/folders/${
                          subfolder.id
                        }/`}
                      >
                        {`${subfolder.name} (${subfolder.itemCount})`}
                      </Link>
                      {new Date(subfolder.effectiveStartAt).getTime() >
                        Date.now() &&
                        !isCurrentCourseStudent && (
                          <Tooltip
                            title={intl.formatMessage(
                              translations.subfolderBlockedTooltip,
                            )}
                            placement="top"
                            arrow
                          >
                            <BlockIcon color="error" fontSize="small" />
                          </Tooltip>
                        )}
                    </Stack>
                    {subfolder.description !== null &&
                      subfolder.description.length !== 0 && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: subfolder.description,
                          }}
                        />
                      )}
                  </Stack>
                </TableCell>
                <TableCell style={{ padding: 2 }}>
                  {getFullDateTime(subfolder.updatedAt)}
                </TableCell>
                <TableCell style={{ padding: 2 }}>
                  {subfolder.permissions.canEdit ? (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {subfolder.permissions.showSdlWarning && (
                        <Tooltip
                          title={intl.formatMessage(
                            translations.visibleBecauseSdlTooltip,
                          )}
                        >
                          <VisibilityIcon color="info" fontSize="small" />
                        </Tooltip>
                      )}
                      <div>{getFullDateTime(subfolder.startAt)}</div>
                    </Stack>
                  ) : (
                    <div>-</div>
                  )}
                </TableCell>
                <TableCell style={{ padding: 2 }}>
                  <WorkbinTableButtons
                    currFolderId={currFolderId}
                    itemId={subfolder.id}
                    itemName={subfolder.name}
                    isConcrete={isConcrete}
                    canEdit={subfolder.permissions.canEdit}
                    canDelete={subfolder.permissions.canDelete}
                    type="subfolder"
                    folderInitialValues={{
                      name: subfolder.name,
                      description: subfolder.description,
                      canStudentUpload: subfolder.canStudentUpload,
                      startAt: new Date(subfolder.startAt),
                      endAt:
                        subfolder.endAt !== null
                          ? new Date(subfolder.endAt)
                          : null,
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}

          {sortedMaterials.map((material) => {
            return (
              <TableRow
                key={`material-${material.id}`}
                id={`material-${material.id}`}
              >
                <TableCell style={{ padding: 2 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <DescriptionIcon htmlColor="grey" />
                      <a
                        href={`/courses/${getCourseId()}/materials/folders/${currFolderId}/files/${
                          material.id
                        }`}
                      >
                        {material.name}
                      </a>
                    </Stack>
                    {material.description !== null &&
                      material.description.length !== 0 && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: material.description,
                          }}
                        />
                      )}
                  </Stack>
                </TableCell>
                <TableCell style={{ padding: 2 }}>
                  <Stack>
                    <div>{getFullDateTime(material.updatedAt)}</div>
                    <a
                      href={
                        material.updater.isCourseUser
                          ? getCourseUserURL(getCourseId(), material.updater.id)
                          : getUserURL(material.updater.id)
                      }
                    >
                      {material.updater.name}
                    </a>
                  </Stack>
                </TableCell>
                <TableCell style={{ padding: 2 }}>-</TableCell>
                <TableCell style={{ padding: 2 }}>
                  <WorkbinTableButtons
                    currFolderId={currFolderId}
                    itemId={material.id}
                    itemName={material.name}
                    isConcrete={isConcrete}
                    canEdit={material.permissions.canEdit}
                    canDelete={material.permissions.canDelete}
                    type="material"
                    materialInitialValues={{
                      name: material.name,
                      description: material.description,
                      file: {
                        name: material.name,
                        url: `/courses/${getCourseId()}/materials/folders/${currFolderId}/files/${
                          material.id
                        }`,
                      },
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default injectIntl(WorkbinTable);
