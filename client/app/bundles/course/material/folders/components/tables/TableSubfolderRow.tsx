import { FC, memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import {
  Block as BlockIcon,
  Folder as FolderIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Stack, TableCell, TableRow, Tooltip } from '@mui/material';
import equal from 'fast-deep-equal';
import { FolderMiniEntity } from 'types/course/material/folders';

import { getFullDateTime } from 'lib/helpers/timehelper';
import { getCourseId } from 'lib/helpers/url-helpers';

import WorkbinTableButtons from '../buttons/WorkbinTableButtons';

interface Props {
  currFolderId: number;
  subfolder: FolderMiniEntity;
  isCurrentCourseStudent: boolean;
  canEditSubfolders: boolean;
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
  const {
    currFolderId,
    subfolder,
    isCurrentCourseStudent,
    canEditSubfolders,
    isConcrete,
  } = props;
  const intl = useIntl();

  return (
    <TableRow id={`subfolder-${subfolder.id}`}>
      <TableCell style={{ padding: 2, minWidth: '200px' }}>
        <Stack spacing={1}>
          <Stack alignItems="center" direction="row" spacing={0.5}>
            <FolderIcon htmlColor="grey" />
            <Link
              style={{
                textOverflow: 'initial',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
              to={`/courses/${getCourseId()}/materials/folders/${
                subfolder.id
              }/`}
            >
              {`${subfolder.name} (${subfolder.itemCount})`}
            </Link>
            {new Date(subfolder.effectiveStartAt).getTime() > Date.now() &&
              !isCurrentCourseStudent && (
                <Tooltip
                  arrow={true}
                  placement="top"
                  title={intl.formatMessage(
                    translations.subfolderBlockedTooltip,
                  )}
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
                style={{
                  color: 'grey',
                  marginLeft: 30,
                  textOverflow: 'initial',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
              />
            )}
        </Stack>
      </TableCell>
      <TableCell
        style={{
          padding: 2,
          width: '240px',
          maxWidth: '240px',
          minWidth: '60px',
        }}
      >
        {getFullDateTime(subfolder.updatedAt)}
      </TableCell>
      {subfolder.permissions.canEdit ? (
        <TableCell
          style={{
            padding: 2,
            width: '240px',
            maxWidth: '240px',
            minWidth: '60px',
          }}
        >
          <Stack alignItems="center" direction="row" spacing={0.5}>
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
        </TableCell>
      ) : (
        canEditSubfolders && (
          <TableCell
            style={{
              padding: 2,
              width: '240px',
              maxWidth: '240px',
              minWidth: '60px',
            }}
          >
            <Stack alignItems="center" direction="row" spacing={0.5}>
              <div>-</div>
            </Stack>
          </TableCell>
        )
      )}
      <TableCell
        style={{
          padding: 2,
          width: '60px',
          maxWidth: '60px',
          minWidth: '30px',
        }}
      >
        <WorkbinTableButtons
          canDelete={subfolder.permissions.canDelete}
          canEdit={subfolder.permissions.canEdit}
          currFolderId={currFolderId}
          folderInitialValues={{
            name: subfolder.name,
            description: subfolder.description,
            canStudentUpload: subfolder.permissions.canStudentUpload,
            startAt: new Date(subfolder.startAt),
            endAt: subfolder.endAt !== null ? new Date(subfolder.endAt) : null,
          }}
          isConcrete={isConcrete}
          itemId={subfolder.id}
          itemName={subfolder.name}
          type="subfolder"
        />
      </TableCell>
    </TableRow>
  );
};

export default memo(TableSubfolderRow, (prevProps, nextProps) => {
  return equal(prevProps, nextProps);
});
