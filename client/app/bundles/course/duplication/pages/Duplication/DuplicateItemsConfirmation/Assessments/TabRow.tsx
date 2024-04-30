import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { duplicableItemTypes } from 'course/duplication/constants';
import { Tab } from 'course/duplication/types';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  defaultTab: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.AssessmentsListing.defaultTab',
    defaultMessage: 'Default Tab',
  },
});

interface TabRowProps {
  tab?: Tab;
}

const TabRow: FC<TabRowProps> = (props) => {
  const { t } = useTranslation();
  const { tab } = props;

  if (!tab) {
    return (
      <IndentedCheckbox
        disabled
        indentLevel={0}
        label={
          <Typography className="font-bold">
            {t(translations.defaultTab)}
          </Typography>
        }
      />
    );
  }

  return (
    <IndentedCheckbox
      checked
      indentLevel={1}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={duplicableItemTypes.TAB} />
          <Typography className="font-bold">{tab.title}</Typography>
        </span>
      }
    />
  );
};

export default TabRow;
