import { FC } from 'react';
import { ListSubheader } from '@mui/material';

import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { Assessment, Category, Tab } from 'course/duplication/types';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import CategoryCard from './CategoryCard';

const { TAB, ASSESSMENT, CATEGORY } = duplicableItemTypes;

const selectedSubtrees: (
  categories: Category[],
  selectedItems: Record<string, Record<number, boolean>>,
) => [Category[], Tab[], Assessment[]] = (categories, selectedItems) => {
  const categoriesTrees: Category[] = [];
  const tabTrees: Tab[] = [];
  const assessmentTrees: Assessment[] = [];

  categories.forEach((category) => {
    const selectedTabs: Tab[] = [];
    category.tabs.forEach((tab) => {
      const selectedAssessments = tab.assessments.filter(
        (assessment) => selectedItems[ASSESSMENT][assessment.id],
      );

      if (selectedItems[TAB][tab.id]) {
        selectedTabs.push({ ...tab, assessments: selectedAssessments });
      } else {
        assessmentTrees.push(...selectedAssessments);
      }
    });

    if (selectedItems[CATEGORY][category.id]) {
      categoriesTrees.push({ ...category, tabs: selectedTabs });
    } else {
      tabTrees.push(...selectedTabs);
    }
  });

  return [categoriesTrees, tabTrees, assessmentTrees];
};

const AssessmentsListing: FC = () => {
  const { t } = useTranslation();

  const duplication = useAppSelector(selectDuplicationStore);
  const { assessmentsComponent: categories, selectedItems } = duplication;

  const [categoriesTrees, tabTrees, assessmentTrees] = selectedSubtrees(
    categories,
    selectedItems,
  );

  const orphanTreesCount = tabTrees.length + assessmentTrees.length;
  const totalTreesCount = orphanTreesCount + categoriesTrees.length;
  if (totalTreesCount < 1) {
    return null;
  }

  return (
    <>
      <ListSubheader disableSticky>
        {t(defaultComponentTitles.course_assessments_component)}
      </ListSubheader>
      {categoriesTrees.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
      {orphanTreesCount > 0 && (
        <CategoryCard
          orphanAssessments={assessmentTrees}
          orphanTabs={tabTrees}
        />
      )}
    </>
  );
};

export default AssessmentsListing;
