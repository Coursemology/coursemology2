import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { ListSubheader, Typography } from '@mui/material';

import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import FolderTree from './FolderTree';

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.MaterialsSelector.noItems',
    defaultMessage: 'There are no materials to duplicate.',
  },
});

const MaterialsSelector: FC = () => {
  const { t } = useTranslation();
  const duplication = useAppSelector(selectDuplicationStore);

  const { materialsComponent: folders } = duplication;

  return (
    <>
      <Typography className="mt-3 mb-1" variant="h6">
        {t(defaultComponentTitles.course_materials_component)}
      </Typography>
      {folders.length > 0 ? (
        folders.map((rootFolder) => (
          <FolderTree key={rootFolder.id} folder={rootFolder} indentLevel={0} />
        ))
      ) : (
        <ListSubheader disableSticky>{t(translations.noItems)}</ListSubheader>
      )}
    </>
  );
};

export default MaterialsSelector;
