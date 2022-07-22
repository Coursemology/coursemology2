import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { Link } from 'react-router-dom';

import {
  FolderMiniEntity,
  MaterialMiniEntity,
} from 'types/course/material/folders';

import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
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

  return (
    <>
      <Table sx={{ marginBottom: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>
              {intl.formatMessage(translations.tableHeaderName)}
            </TableCell>
            <TableCell>
              {intl.formatMessage(translations.tableHeaderLastModified)}
            </TableCell>
            <TableCell>
              {intl.formatMessage(translations.tableHeaderStartAt)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {subfolders.map((subfolder) => {
            return (
              <TableRow
                key={`subfolder-${subfolder.id}`}
                id={`subfolder-${subfolder.id}`}
              >
                <TableCell>
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
                <TableCell>{getFullDateTime(subfolder.updatedAt)}</TableCell>
                <TableCell>
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
                <TableCell>
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

          {materials.map((material) => {
            return (
              <TableRow
                key={`material-${material.id}`}
                id={`material-${material.id}`}
              >
                <TableCell>
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
                <TableCell>
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
                <TableCell>-</TableCell>
                <TableCell>
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
