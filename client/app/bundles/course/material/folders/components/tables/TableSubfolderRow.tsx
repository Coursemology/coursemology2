import { FC, memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import equal from 'fast-deep-equal';
import { Stack, TableCell, TableRow, Tooltip } from '@mui/material';
import {
  Block as BlockIcon,
  Folder as FolderIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { FolderMiniEntity } from 'types/course/material/folders';
import { getFullDateTime } from 'lib/helpers/timehelper';
import { getCourseId } from 'lib/helpers/url-helpers';
import WorkbinTableButtons from '../buttons/WorkbinTableButtons';

interface Props {
  currFolderId: number;
  subfolder: FolderMiniEntity;
  isCurrentCourseStudent: boolean;
  isConcrete: boolean;
}

const translations = defineMessages({
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

const TableSubfolderRow: FC<Props> = (props) => {
  const { currFolderId, subfolder, isCurrentCourseStudent, isConcrete } = props;
  const intl = useIntl();

  return (
    <TableRow id={`subfolder-${subfolder.id}`}>
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
            {new Date(subfolder.effectiveStartAt).getTime() > Date.now() &&
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
            endAt: subfolder.endAt !== null ? new Date(subfolder.endAt) : null,
          }}
        />
      </TableCell>
    </TableRow>
  );
};

export default memo(TableSubfolderRow, (prevProps, nextProps) => {
  return equal(prevProps, nextProps);
});
