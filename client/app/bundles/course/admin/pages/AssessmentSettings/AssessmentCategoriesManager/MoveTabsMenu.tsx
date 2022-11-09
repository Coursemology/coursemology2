import { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { AssessmentCategory } from 'types/course/admin/assessments';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';

interface MoveTabsMenuProps {
  categories?: AssessmentCategory[];
  onSelectCategory: (category: AssessmentCategory) => void;
  disabled?: boolean;
}

const MoveTabsMenu = (props: MoveTabsMenuProps): JSX.Element | null => {
  const { t } = useTranslation();
  const { categories, onSelectCategory } = props;
  const [button, setButton] = useState<HTMLButtonElement>();

  if (!categories || categories.length <= 0) return null;

  if (categories.length === 1)
    return (
      <Button
        disabled={props.disabled}
        onClick={(): void => onSelectCategory(categories[0])}
      >
        {t(translations.moveTabsToCategoryThenDelete, {
          category: categories[0].title,
        })}
      </Button>
    );

  return (
    <>
      <Button
        disabled={props.disabled}
        onClick={(e): void => setButton(e.currentTarget)}
      >
        {t(translations.moveTabsThenDelete)}
      </Button>

      <Menu
        anchorEl={button}
        onClose={(): void => setButton(undefined)}
        open={Boolean(button)}
      >
        {categories.map((category) => (
          <MenuItem
            key={category.id}
            onClick={(): void => {
              setButton(undefined);
              onSelectCategory(category);
            }}
          >
            {t(translations.toTab, { tab: category.title ?? '' })}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default MoveTabsMenu;
