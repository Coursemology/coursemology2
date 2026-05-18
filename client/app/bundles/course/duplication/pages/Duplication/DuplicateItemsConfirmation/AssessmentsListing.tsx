import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardContent, ListSubheader } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { selectDuplicationStore } from 'course/duplication/selectors';
import {
  DuplicationAssessmentData,
  DuplicationCategoryData,
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

  const renderAssessmentRow = (
    assessment: DuplicationAssessmentData,
  ): JSX.Element => (
    <IndentedCheckbox
      key={`assessment_${assessment.id}`}
      checked
      indentLevel={2}
      label={
        <span className="flex items-center">
          <TypeBadge itemType="ASSESSMENT" />
          <UnpublishedIcon tooltipId="itemUnpublished" />
          {assessment.title}
        </span>
      }
    />
  );

  const renderTabRow = (tab: DuplicationTabData): JSX.Element => (
    <IndentedCheckbox
      checked
      indentLevel={1}
      label={
        <span>
          <TypeBadge itemType="TAB" />
          {tab.title}
        </span>
      }
    />
  );

  const renderCategoryRow = (
    category: DuplicationCategoryData,
  ): JSX.Element => (
    <IndentedCheckbox
      checked
      label={
        <span>
          <TypeBadge itemType="CATEGORY" />
          {category.title}
        </span>
      }
    />
  );

  const renderTabTree = (
    tab: DuplicationTabData | null,
    children: DuplicationAssessmentData[],
  ): JSX.Element => (
    <div key={tab ? `tab_assessment_${tab.id}` : 'tab_assessment_default'}>
      {tab ? (
        renderTabRow(tab)
      ) : (
        <IndentedCheckbox
          disabled
          indentLevel={1}
          label={t(translations.defaultTab)}
        />
      )}
      {children.length > 0 && children.map(renderAssessmentRow)}
    </div>
  );

  const renderCategoryCard = (
    category: DuplicationCategoryData | null,
    orphanTabs: DuplicationTabData[],
    orphanAssessments: DuplicationAssessmentData[],
  ): JSX.Element => {
    const tabsTrees = (tabs: DuplicationTabData[]): JSX.Element[] =>
      tabs.map((tab) => renderTabTree(tab, tab.assessments));

    return (
      <Card
        key={
          category
            ? `category_assessment_${category.id}`
            : 'category_assessment_default'
        }
      >
        <CardContent>
          {category ? (
            renderCategoryRow(category)
          ) : (
            <IndentedCheckbox
              disabled
              label={t(translations.defaultCategory)}
            />
          )}
          {orphanAssessments.length > 0 &&
            renderTabTree(null, orphanAssessments)}
          {orphanTabs.length > 0 && tabsTrees(orphanTabs)}
          {category && tabsTrees(category.tabs)}
        </CardContent>
      </Card>
    );
  };

  // Identifies connected subtrees of selected categories, tabs and assessments.
  const categoriesTrees: DuplicationCategoryData[] = [];
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

  return (
    <>
      <ListSubheader disableSticky>
        {t(componentTranslations.course_assessments_component)}
      </ListSubheader>
      {categoriesTrees.map((category) => renderCategoryCard(category, [], []))}
      {orphanTreesCount > 0 &&
        renderCategoryCard(null, tabTrees, assessmentTrees)}
    </>
  );
};

export default AssessmentsListing;
