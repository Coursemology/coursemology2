import { FC, memo } from 'react';
import { List, Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { Folder } from 'types/course/admin/ragWise';

import Section from 'lib/components/core/layouts/Section';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';

import ExpandAllSwitch from './buttons/ExpandAllSwitch';
import FolderTab from './FolderTab';

interface MaterialListProps {
  rootFolder: Folder;
}

const MaterialList: FC<MaterialListProps> = (props) => {
  const { rootFolder } = props;
  const { t } = useTranslation();

  return (
    <Section
      contentClassName="flex flex-col space-y-3"
      sticksToNavbar
      subtitle={t(translations.materialsSectionSubtitle)}
      title={t(translations.materialsSectionTitle)}
    >
      <section>
        <div className="flex justify-between items-center mb-4">
          <div>
            <ExpandAllSwitch />
          </div>
          <div className="pr-5 space-x-48 flex justify-end">
            <div className="text-center">
              <Typography
                align="center"
                className="max-w-[10px] pr-24"
                variant="body2"
              >
                {t(translations.knowledgeBaseStatusSettings)}
              </Typography>
            </div>
          </div>
        </div>
        <div>
          <List
            className="p-0 w-full border border-solid border-neutral-300 rounded-lg"
            dense
          >
            <FolderTab folder={rootFolder} level={0} />
          </List>
        </div>
      </section>
    </Section>
  );
};

export default memo(MaterialList, equal);
