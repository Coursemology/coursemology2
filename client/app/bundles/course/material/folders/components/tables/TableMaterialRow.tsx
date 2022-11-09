import { FC, memo } from 'react';
import { Description as DescriptionIcon } from '@mui/icons-material';
import { Stack, TableCell, TableRow } from '@mui/material';
import equal from 'fast-deep-equal';
import { MaterialMiniEntity } from 'types/course/material/folders';

import { getFullDateTime } from 'lib/helpers/timehelper';
import { getCourseUserURL, getUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

import WorkbinTableButtons from '../buttons/WorkbinTableButtons';

interface Props {
  currFolderId: number;
  material: MaterialMiniEntity;
  canEditSubfolders: boolean;
  isConcrete: boolean;
}

const TableMaterialRow: FC<Props> = (props) => {
  const { currFolderId, material, canEditSubfolders, isConcrete } = props;

  return (
    <TableRow id={`material-${material.id}`}>
      <TableCell style={{ padding: 2, minWidth: '200px' }}>
        <Stack spacing={1}>
          <Stack alignItems="center" direction="row" spacing={0.5}>
            <DescriptionIcon htmlColor="grey" />
            <a
              href={`/courses/${getCourseId()}/materials/folders/${currFolderId}/files/${
                material.id
              }`}
              rel="noopener noreferrer"
              style={{
                textOverflow: 'initial',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
              target="_blank"
            >
              {material.name}
            </a>
          </Stack>
          {material.description !== null && material.description.length !== 0 && (
            <div
              dangerouslySetInnerHTML={{
                __html: material.description,
              }}
              style={{
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
      {canEditSubfolders && (
        <TableCell
          style={{
            padding: 2,
            width: '240px',
            maxWidth: '240px',
            minWidth: '60px',
          }}
        >
          -
        </TableCell>
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
          type="material"
        />
      </TableCell>
    </TableRow>
  );
};

export default memo(TableMaterialRow, (prevProps, nextProps) => {
  return equal(prevProps, nextProps);
});
