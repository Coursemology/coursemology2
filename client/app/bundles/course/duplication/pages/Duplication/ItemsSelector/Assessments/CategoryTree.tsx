import { FC } from 'react';
import { Typography } from '@mui/material';
import { AppDispatch } from 'store';

import BulkSelectors from 'course/duplication/components/BulkSelectors';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { Category } from 'course/duplication/types';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import TabTree, { tabSetAll } from './TabTree';

interface CategoryTreeProps {
  category: Category;
  categoryDisabled: boolean;
  tabDisabled: boolean;
}

const categorySetAll: (
  category: Category,
  dispatch: AppDispatch,
  tabDisabled: boolean,
  categoryDisabled: boolean,
) => (value: boolean) => void =
  (category, dispatch, tabDisabled, categoryDisabled) => (value) => {
    if (!categoryDisabled) {
      dispatch(
        actions.setItemSelectedBoolean(
          duplicableItemTypes.CATEGORY,
          category.id,
          value,
        ),
      );
    }

    category.tabs.forEach((tab) =>
      tabSetAll(tab, dispatch, tabDisabled)(value),
    );
  };

const CategoryTree: FC<CategoryTreeProps> = (props) => {
  const { category, categoryDisabled, tabDisabled } = props;
  const duplication = useAppSelector(selectDuplicationStore);
  const { selectedItems } = duplication;
  const dispatch = useAppDispatch();
  const { id, title, tabs } = category;
  const checked = !!selectedItems[duplicableItemTypes.CATEGORY][id];

  return (
    <div key={id}>
      <IndentedCheckbox
        checked={checked}
        disabled={categoryDisabled}
        indentLevel={0}
        label={
          <span className="flex flex-row items-center">
            <TypeBadge itemType={duplicableItemTypes.CATEGORY} />
            <Typography className="font-bold">{title}</Typography>
          </span>
        }
        onChange={(_, value) =>
          dispatch(
            actions.setItemSelectedBoolean(
              duplicableItemTypes.CATEGORY,
              id,
              value,
            ),
          )
        }
      >
        <BulkSelectors
          callback={categorySetAll(
            category,
            dispatch,
            tabDisabled,
            categoryDisabled,
          )}
        />
      </IndentedCheckbox>
      {tabs.map((tab) => (
        <TabTree key={tab.id} tab={tab} tabDisabled={tabDisabled} />
      ))}
    </div>
  );
};

export default CategoryTree;
