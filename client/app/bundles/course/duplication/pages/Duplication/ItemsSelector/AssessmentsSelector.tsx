import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { ListSubheader, Typography } from '@mui/material';

import BulkSelectors from 'lib/components/core/BulkSelectors';
import IndentedCheckbox from 'lib/components/core/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import {
  selectDestinationCourse,
  selectDuplicationStore,
} from 'course/duplication/selectors';
import { actions } from 'course/duplication/store';
import {
  DuplicationAssessmentData,
  DuplicationCategoryData,
  DuplicationTabData,
} from 'course/duplication/types';
import componentTranslations from 'course/translations';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.AssessmentsSelector.noItems',
    defaultMessage: 'There are no assessment items to duplicate.',
  },
});

const AssessmentsSelector: FC = () => {
  const {
    assessmentsComponent: categories,
    selectedItems,
    sourceCourse,
  } = useAppSelector(selectDuplicationStore);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const destinationCourse = useAppSelector(selectDestinationCourse);

  if (!categories) return null;

  const tabDisabled =
    sourceCourse.unduplicableObjectTypes.includes('TAB') ||
    !!destinationCourse?.unduplicableObjectTypes.includes('TAB');
  const categoryDisabled =
    sourceCourse.unduplicableObjectTypes.includes('CATEGORY') ||
    !!destinationCourse?.unduplicableObjectTypes.includes('CATEGORY');

  const tabSetAll =
    (tab: DuplicationTabData) =>
    (value: boolean): void => {
      if (!tabDisabled) {
        dispatch(actions.setItemSelectedBoolean('TAB', tab.id, value));
      }
      tab.assessments.forEach((assessment) => {
        dispatch(
          actions.setItemSelectedBoolean('ASSESSMENT', assessment.id, value),
        );
      });
    };

  const categorySetAll =
    (category: DuplicationCategoryData) =>
    (value: boolean): void => {
      if (!categoryDisabled) {
        dispatch(
          actions.setItemSelectedBoolean('CATEGORY', category.id, value),
        );
      }
      category.tabs.forEach((tab) => tabSetAll(tab)(value));
    };

  const renderAssessmentTree = (
    assessment: DuplicationAssessmentData,
  ): JSX.Element => {
    const { id, title, published } = assessment;
    const checked = !!selectedItems.ASSESSMENT[id];
    return (
      <IndentedCheckbox
        key={id}
        checked={checked}
        indentLevel={2}
        label={
          <span className="flex items-center">
            <TypeBadge itemType="ASSESSMENT" />
            {published || <UnpublishedIcon />}
            {title}
          </span>
        }
        onChange={(_, value) =>
          dispatch(actions.setItemSelectedBoolean('ASSESSMENT', id, value))
        }
      />
    );
  };

  const renderTabTree = (tab: DuplicationTabData): JSX.Element => {
    const { id, title, assessments } = tab;
    const checked = !!selectedItems.TAB[id];
    return (
      <div key={id}>
        <IndentedCheckbox
          checked={checked}
          disabled={tabDisabled}
          indentLevel={1}
          label={
            <span>
              <TypeBadge itemType="TAB" />
              {title}
            </span>
          }
          onChange={(_, value) =>
            dispatch(actions.setItemSelectedBoolean('TAB', id, value))
          }
        >
          <BulkSelectors callback={tabSetAll(tab)} />
        </IndentedCheckbox>
        {assessments.map(renderAssessmentTree)}
      </div>
    );
  };

  const renderCategoryTree = (
    category: DuplicationCategoryData,
  ): JSX.Element => {
    const { id, title, tabs } = category;
    const checked = !!selectedItems.CATEGORY[id];
    return (
      <div key={id}>
        <IndentedCheckbox
          checked={checked}
          disabled={categoryDisabled}
          label={
            <span>
              <TypeBadge itemType="CATEGORY" />
              {title}
            </span>
          }
          onChange={(_, value) =>
            dispatch(actions.setItemSelectedBoolean('CATEGORY', id, value))
          }
        >
          <BulkSelectors callback={categorySetAll(category)} />
        </IndentedCheckbox>
        {tabs.map(renderTabTree)}
      </div>
    );
  };

  return (
    <>
      <Typography className="mt-5 mb-5" variant="h2">
        {t(componentTranslations.course_assessments_component)}
      </Typography>
      {categories.length > 0 ? (
        categories.map(renderCategoryTree)
      ) : (
        <ListSubheader disableSticky>{t(translations.noItems)}</ListSubheader>
      )}
    </>
  );
};

export default AssessmentsSelector;
