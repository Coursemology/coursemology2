import { FC } from 'react';
import { Card, CardContent, ListSubheader } from '@mui/material';

import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { flatten } from 'course/duplication/utils';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import FolderTree from './FolderTree';
import RootRow from './RootRow';

const ROOT_CHILDREN_LEVEL = 1;

const MaterialsListing: FC = () => {
  const { t } = useTranslation();
  const duplication = useAppSelector(selectDuplicationStore);

  const {
    materialsComponent: folders,
    selectedItems,
    destinationCourses,
  } = duplication;

  const targetRootFolder = destinationCourses.find(
    (course) => course.id === duplication.destinationCourseId,
  ).rootFolder;

  const folderTrees = flatten(
    folders.map((folder) => (
      <FolderTree
        key={folder.id}
        folder={folder}
        indentLevel={ROOT_CHILDREN_LEVEL}
        selectedItems={selectedItems}
        targetRootFolder={targetRootFolder}
      />
    )),
  );

  if (folderTrees.length < 1) {
    return null;
  }

  return (
    <div>
      <ListSubheader disableSticky>
        {t(defaultComponentTitles.course_materials_component)}
      </ListSubheader>
      <Card>
        <CardContent>
          <RootRow />
          {folderTrees}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialsListing;
