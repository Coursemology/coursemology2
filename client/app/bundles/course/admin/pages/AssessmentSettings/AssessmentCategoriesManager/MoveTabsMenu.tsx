import { Button, Menu, MenuItem } from '@mui/material';
import useTranslation from 'lib/hooks/useTranslation';
import { useState } from 'react';
import { AssessmentCategory } from 'types/course/admin/assessments';
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
        onClick={(): void => onSelectCategory(categories[0])}
        disabled={props.disabled}
      >
        {t(translations.moveTabsToCategoryThenDelete, {
          category: categories[0].title,
        })}
      </Button>
    );

  return (
    <>
      <Button
        onClick={(e): void => setButton(e.currentTarget)}
        disabled={props.disabled}
      >
        {t(translations.moveTabsThenDelete)}
      </Button>

      <Menu
        open={Boolean(button)}
        anchorEl={button}
        onClose={(): void => setButton(undefined)}
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
