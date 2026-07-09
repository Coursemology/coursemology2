import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardContent, ListSubheader } from '@mui/material';

import DuplicationAssessmentTree, {
  DuplicationAssessmentTreeNode,
} from 'course/duplication/components/DuplicationAssessmentTree';
import { selectDuplicationStore } from 'course/duplication/selectors';
import {
  DuplicationAssessmentData,
  DuplicationTabData,
} from 'course/duplication/types';
import componentTranslations from 'course/translations';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  defaultCategory: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.AssessmentsListing.defaultCategory',
    defaultMessage: 'Default Category',
  },
  defaultTab: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.AssessmentsListing.defaultTab',
    defaultMessage: 'Default Tab',
  },
});

const AssessmentsListing: FC = () => {
  const { assessmentsComponent: categories, selectedItems } = useAppSelector(
    selectDuplicationStore,
  );
  const { t } = useTranslation();

  const categoriesTrees: DuplicationCategoryLike[] = [];
  const tabTrees: DuplicationTabData[] = [];
  const assessmentTrees: DuplicationAssessmentData[] = [];

  categories.forEach((category) => {
    const selectedTabs: DuplicationTabData[] = [];
    category.tabs.forEach((tab) => {
      const selectedAssessments = tab.assessments.filter(
        (a) => selectedItems.ASSESSMENT[a.id],
      );
      if (selectedItems.TAB[tab.id]) {
        selectedTabs.push({ ...tab, assessments: selectedAssessments });
      } else {
        assessmentTrees.push(...selectedAssessments);
      }
    });

    if (selectedItems.CATEGORY[category.id]) {
      categoriesTrees.push({ ...category, tabs: selectedTabs });
    } else {
      tabTrees.push(...selectedTabs);
    }
  });

  const orphanTreesCount = tabTrees.length + assessmentTrees.length;
  if (orphanTreesCount + categoriesTrees.length < 1) return null;

  const nodes: DuplicationAssessmentTreeNode[] = [
    ...categoriesTrees.map((category) => ({
      category: { id: category.id, title: category.title },
      tabs: category.tabs.map((tab) => ({
        tab: { id: tab.id, title: tab.title },
        assessments: tab.assessments,
      })),
    })),
    ...(orphanTreesCount > 0
      ? [
          {
            category: null,
            tabs: [
              // Orphan assessments render first (matches prior output order),
              // then orphan tabs.
              ...(assessmentTrees.length > 0
                ? [{ tab: null, assessments: assessmentTrees }]
                : []),
              ...tabTrees.map((tab) => ({
                tab: { id: tab.id, title: tab.title },
                assessments: tab.assessments,
              })),
            ],
          },
        ]
      : []),
  ];

  return (
    <>
      <ListSubheader disableSticky>
        {t(componentTranslations.course_assessments_component)}
      </ListSubheader>
      <DuplicationAssessmentTree nodes={nodes} />
    </>
  );
};

type DuplicationCategoryLike = {
  id: number;
  title: string;
  tabs: DuplicationTabData[];
};

export default AssessmentsListing;
