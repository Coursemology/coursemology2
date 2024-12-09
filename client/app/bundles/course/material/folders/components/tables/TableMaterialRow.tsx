import { FC, memo } from 'react';
import { Description as DescriptionIcon } from '@mui/icons-material';
import { Stack, TableCell, TableRow, Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { MaterialMiniEntity } from 'types/course/material/folders';

import Link from 'lib/components/core/Link';
import { getCourseId } from 'lib/helpers/url-helpers';
import { formatFullDateTime } from 'lib/moment';

import KnowledgeBaseSwitch from '../buttons/KnowledgeBaseSwitch';
import WorkbinTableButtons from '../buttons/WorkbinTableButtons';

interface Props {
  currFolderId: number;
  material: MaterialMiniEntity;
  isCurrentCourseStudent: boolean;
  isConcrete: boolean;
  canManageKnowledgeBase: boolean;
}

const TableMaterialRow: FC<Props> = (props) => {
  const {
    currFolderId,
    material,
    isCurrentCourseStudent,
    isConcrete,
    canManageKnowledgeBase,
  } = props;

  return (
    <TableRow id={`material-${material.id}`}>
      <TableCell style={{ minWidth: '200px' }}>
        <Stack spacing={1}>
          <Stack alignItems="center" direction="row" spacing={0.5}>
            <DescriptionIcon htmlColor="grey" />
            <Link
              href={material.materialUrl}
              opensInNewTab
              style={{
                textOverflow: 'initial',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
              underline="hover"
            >
              {material.name}
            </Link>
          </Stack>
          {material.description !== null &&
            material.description.length !== 0 && (
              <Typography
                dangerouslySetInnerHTML={{
                  __html: material.description,
                }}
                style={{
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
        <Stack className="items-start">
          <div>{formatFullDateTime(material.updatedAt)}</div>
          <Link to={material.updater.userUrl} underline="hover">
            {material.updater.name}
          </Link>
        </Stack>
      </TableCell>
      {!isCurrentCourseStudent && (
        <TableCell
          style={{
            width: '240px',
            maxWidth: '240px',
            minWidth: '60px',
          }}
        >
          -
        </TableCell>
      )}
      {/* {canManageKnowledgeBase && (
        <TableCell style={{ width: '60px' }}>
          <Stack alignItems="center" direction="column" spacing={0.5}>
            <KnowledgeBaseSwitch
              canEdit={material.permissions.canEdit}
              currFolderId={currFolderId}
              isConcrete={isConcrete}
              itemId={material.id}
              itemName={material.name}
              state={material.workflowState}
              type="material"
            />
          </Stack>
        </TableCell>
      )} */}
      <TableCell style={{ width: '60px' }}>
        <WorkbinTableButtons
          canDelete={material.permissions.canDelete}
          canEdit={material.permissions.canEdit}
          currFolderId={currFolderId}
          isConcrete={isConcrete}
          itemId={material.id}
          itemName={material.name}
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
          state={material.workflowState}
          type="material"
        />
      </TableCell>
    </TableRow>
  );
};

export default memo(TableMaterialRow, (prevProps, nextProps) => {
  return equal(prevProps, nextProps);
});
