import { FC, memo } from 'react';
import { Stack, TableCell, TableRow } from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';
import equal from 'fast-deep-equal';
import { MaterialMiniEntity } from 'types/course/material/folders';
import { getFullDateTime } from 'lib/helpers/timehelper';
import { getCourseId } from 'lib/helpers/url-helpers';
import { getCourseUserURL, getUserURL } from 'lib/helpers/url-builders';
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
          <Stack direction="row" spacing={0.5} alignItems="center">
            <DescriptionIcon htmlColor="grey" />
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`/courses/${getCourseId()}/materials/folders/${currFolderId}/files/${
                material.id
              }`}
              style={{
                textOverflow: 'initial',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
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
};

export default memo(TableMaterialRow, (prevProps, nextProps) => {
  return equal(prevProps, nextProps);
});
