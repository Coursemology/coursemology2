import { FC, memo } from 'react';
import { ListItemText } from '@mui/material';
import equal from 'fast-deep-equal';
import {
  AssessmentCategoryData,
  AssessmentTabData,
} from 'types/course/admin/codaveri';

import Link from 'lib/components/core/Link';
import useItems from 'lib/hooks/items/useItems';
import { useAppSelector } from 'lib/hooks/store';

import {
  getAllAssessmentTabsFor,
  getAssessmentForCategory,
} from '../selectors';

import CodaveriToggleButtons from './buttons/CodaveriToggleButtons';
import CollapsibleList from './lists/CollapsibleList';
import AssessmentTab from './AssessmentTab';

interface AssessmentCategoryProps {
  category: AssessmentCategoryData;
}

export const sortTabs = (tabs: AssessmentTabData[]): AssessmentTabData[] => {
  const sortedTabs = [...tabs];
  sortedTabs.sort((a, b) => (a.title > b.title ? 1 : -1));
  return sortedTabs;
};

const AssessmentCategory: FC<AssessmentCategoryProps> = (props) => {
  const { category } = props;
  const tabs = useAppSelector((state) =>
    getAllAssessmentTabsFor(state, category.id),
  );
  const assessments = useAppSelector((state) =>
    getAssessmentForCategory(state, category.id),
  );

  const assessmentIds = assessments.map((assessment) => assessment.id);
  const { processedItems: sortedTabs } = useItems(tabs, [], sortTabs);

  return (
    <CollapsibleList
      headerAction={
        <div className="pr-2">
          <CodaveriToggleButtons assessmentIds={assessmentIds} />
        </div>
      }
      headerTitle={
        <Link
          onClick={(e): void => e.stopPropagation()}
          opensInNewTab
          to={category.url}
          underline="hover"
        >
          <ListItemText
            classes={{ primary: 'font-bold' }}
            primary={category.title}
          />
        </Link>
      }
    >
      <>
        {sortedTabs.map((tab) => (
          <AssessmentTab key={tab.id} tab={tab} />
        ))}
      </>
    </CollapsibleList>
  );
};

export default memo(AssessmentCategory, equal);
