import { FC, memo } from 'react';
import { defineMessages } from 'react-intl';
import {
  Block as BlockIcon,
  Folder as FolderIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Stack, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { FolderMiniEntity } from 'types/course/material/folders';

import Link from 'lib/components/core/Link';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';
import { formatFullDateTime } from 'lib/moment';

import WorkbinTableButtons from '../buttons/WorkbinTableButtons';

interface Props {
  currFolderId: number;
  subfolder: FolderMiniEntity;
  isCurrentCourseStudent: boolean;
  isConcrete: boolean;
  canManageKnowledgeBase: boolean;
}

const translations = defineMessages({
  subfolderBlockedTooltip: {
    id: 'course.material.folders.TableSubfolderRow.subfolderBlockedTooltip',
    defaultMessage:
      "This folder is hidden from students as it's start time has not been reached",
  },
  visibleBecauseSdlTooltip: {
    id: 'course.material.folders.TableSubfolderRow.visibleBecauseSdlTooltip',
    defaultMessage:
      'This folder is visible to students before the start time because of Self-Directed Learning',
  },
});

const TableSubfolderRow: FC<Props> = (props) => {
  const {
    currFolderId,
    subfolder,
    isCurrentCourseStudent,
    isConcrete,
    canManageKnowledgeBase,
  } = props;
  const { t } = useTranslation();

  return (
    <TableRow id={`subfolder-${subfolder.id}`}>
      <TableCell style={{ minWidth: '200px' }}>
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
              underline="hover"
            >
              {`${subfolder.name} (${subfolder.itemCount})`}
            </Link>
            {new Date(subfolder.effectiveStartAt).getTime() > Date.now() &&
              !isCurrentCourseStudent && (
                <Tooltip
                  arrow
                  placement="top"
                  title={t(translations.subfolderBlockedTooltip)}
                >
                  <BlockIcon color="error" fontSize="small" />
                </Tooltip>
              )}
          </Stack>
          {subfolder.description !== null &&
            subfolder.description.length !== 0 && (
              <Typography
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
                variant="body2"
              />
            )}
        </Stack>
      </TableCell>
      <TableCell
        style={{
          width: '240px',
          maxWidth: '240px',
          minWidth: '60px',
        }}
      >
        {formatFullDateTime(subfolder.updatedAt)}
      </TableCell>
      {!isCurrentCourseStudent && (
        <TableCell
          style={{
            width: '240px',
            maxWidth: '240px',
            minWidth: '60px',
          }}
        >
          <Stack alignItems="center" direction="row" spacing={0.5}>
            {subfolder.permissions.showSdlWarning && (
              <Tooltip title={t(translations.visibleBecauseSdlTooltip)}>
                <VisibilityIcon color="info" fontSize="small" />
              </Tooltip>
            )}
            <div>{formatFullDateTime(subfolder.startAt)}</div>
          </Stack>
        </TableCell>
      )}
      {/* {canManageKnowledgeBase && (
        <TableCell style={{ width: '60px' }}>
          <Stack alignItems="center" direction="column" spacing={0.5}>
            -
          </Stack>
        </TableCell>
      )} */}
      <TableCell
        style={{
          width: '60px',
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
          state={null}
          type="subfolder"
        />
      </TableCell>
    </TableRow>
  );
};

export default memo(TableSubfolderRow, (prevProps, nextProps) => {
  return equal(prevProps, nextProps);
});
