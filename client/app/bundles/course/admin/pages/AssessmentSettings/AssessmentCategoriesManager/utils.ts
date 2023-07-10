import { produce } from 'immer';
import {
  AssessmentCategory,
  AssessmentTab,
} from 'types/course/admin/assessments';

export const getTabsInCategories = (
  categories?: AssessmentCategory[],
  excludes?: (tab: AssessmentTab) => boolean,
): AssessmentTab[] => {
  if (!categories) return [];

  const tabs: AssessmentTab[] = [];
  categories.forEach((category) => {
    category.tabs.forEach((tab) => {
      if (excludes?.(tab)) return;

      tabs.push(
        produce(tab, (draft) => {
          draft.fullTabTitle = `${category.title} > ${tab.title}`;
        }),
      );
    });
  });

  return tabs;
};

export const sortCategories = (
  categories: AssessmentCategory[],
): AssessmentCategory[] =>
  categories.map((category, index) => ({
    ...category,
    weight: index + 1,
    tabs: category.tabs.map((tab, tabIndex) => ({
      ...tab,
      weight: tabIndex + 1,
      categoryId: tab.categoryId,
    })),
  }));
