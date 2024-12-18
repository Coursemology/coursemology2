import { FC, memo } from 'react';
import { Description as DescriptionIcon } from '@mui/icons-material';
import { Stack, TableCell, TableRow, Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { MaterialMiniEntity } from 'types/course/material/folders';

import Link from 'lib/components/core/Link';
import { getCourseId } from 'lib/helpers/url-helpers';
import { formatFullDateTime } from 'lib/moment';

import WorkbinTableButtons from '../buttons/WorkbinTableButtons';

interface Props {
  currFolderId: number;
  material: MaterialMiniEntity;
  isCurrentCourseStudent: boolean;
  isConcrete: boolean;
}

const TableMaterialRow: FC<Props> = (props) => {
  const { currFolderId, material, isCurrentCourseStudent, isConcrete } = props;

  return (
    <TableRow id={`material-${material.id}`}>
      <TableCell className="min-w-[200px]">
        <Stack spacing={1}>
          <Stack alignItems="center" direction="row" spacing={0.5}>
            <DescriptionIcon htmlColor="grey" />
            <Link
              className="whitespace-normal break-all"
              href={material.materialUrl}
              opensInNewTab
              underline="hover"
            >
              {material.name}
            </Link>
          </Stack>
          {material.description !== null &&
            material.description.length !== 0 && (
              <Typography
                className="whitespace-normal break-all"
                dangerouslySetInnerHTML={{
                  __html: material.description,
                }}
                variant="body2"
              />
            )}
        </Stack>
      </TableCell>
      <TableCell className="w-[240px] max-w-[240px] min-w-[60px]">
        <Stack className="items-start">
          <div>{formatFullDateTime(material.updatedAt)}</div>
          <Link to={material.updater.userUrl} underline="hover">
            {material.updater.name}
          </Link>
        </Stack>
      </TableCell>
      {!isCurrentCourseStudent && (
        <TableCell className="w-[240px] max-w-[240px] min-w-[60px]">
          -
        </TableCell>
      )}
      <TableCell className="w-[60px]">
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
