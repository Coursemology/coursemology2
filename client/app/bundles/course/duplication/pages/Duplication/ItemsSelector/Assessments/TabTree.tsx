import { FC } from 'react';
import { Typography } from '@mui/material';
import { AppDispatch } from 'store';

import BulkSelectors from 'course/duplication/components/BulkSelectors';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { Tab } from 'course/duplication/types';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import AssessmentTree from './AssessmentTree';

interface TabTreeProps {
  tab: Tab;
  tabDisabled: boolean;
}

export const tabSetAll: (
  tab: Tab,
  dispatch: AppDispatch,
  tabDisabled: boolean,
) => (value: boolean) => void = (tab, dispatch, tabDisabled) => (value) => {
  if (!tabDisabled) {
    dispatch(
      actions.setItemSelectedBoolean(duplicableItemTypes.TAB, tab.id, value),
    );
  }

  tab.assessments.forEach((assessment) => {
    dispatch(
      actions.setItemSelectedBoolean(
        duplicableItemTypes.ASSESSMENT,
        assessment.id,
        value,
      ),
    );
  });
};

const TabTree: FC<TabTreeProps> = (props) => {
  const { tab, tabDisabled } = props;
  const dispatch = useAppDispatch();
  const duplication = useAppSelector(selectDuplicationStore);

  const { selectedItems } = duplication;
  const { id, title, assessments } = tab;
  const checked = !!selectedItems[duplicableItemTypes.TAB][id];

  return (
    <div key={id}>
      <IndentedCheckbox
        checked={checked}
        disabled={tabDisabled}
        indentLevel={1}
        label={
          <span className="flex flex-row items-center">
            <TypeBadge itemType={duplicableItemTypes.TAB} />
            <Typography className="font-bold">{title}</Typography>
          </span>
        }
        onChange={(_, value) =>
          dispatch(
            actions.setItemSelectedBoolean(duplicableItemTypes.TAB, id, value),
          )
        }
      >
        <BulkSelectors callback={tabSetAll(tab, dispatch, tabDisabled)} />
      </IndentedCheckbox>
      {assessments.map((assessment) => (
        <AssessmentTree key={assessment.id} assessment={assessment} />
      ))}
    </div>
  );
};

export default TabTree;
