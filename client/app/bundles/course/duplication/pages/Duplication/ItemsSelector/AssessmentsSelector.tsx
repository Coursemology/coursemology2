import { ListSubheader, Typography } from '@mui/material';
import BulkSelectors from 'course/duplication/components/BulkSelectors';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import destinationCourseSelector from 'course/duplication/selectors/destinationCourse';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { Assessment, Category, Tab } from 'course/duplication/types';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { AppDispatch } from 'store';

const { TAB, ASSESSMENT, CATEGORY } = duplicableItemTypes;

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.AssessmentsSelector.noItems',
    defaultMessage: 'There are no assessment items to duplicate.',
  },
});

const tabSetAll: (
  tab: Tab,
  dispatch: AppDispatch,
  tabDisabled: boolean,
) => (value: boolean) => void = (tab, dispatch, tabDisabled) => (value) => {
  if (!tabDisabled) {
    dispatch(actions.setItemSelectedBoolean(TAB, tab.id, value));
  }

  tab.assessments.forEach((assessment) => {
    dispatch(actions.setItemSelectedBoolean(ASSESSMENT, assessment.id, value));
  });
};

const categorySetAll: (
  category: Category,
  dispatch: AppDispatch,
  tabDisabled: boolean,
  categoryDisabled: boolean,
) => (value: boolean) => void =
  (category, dispatch, tabDisabled, categoryDisabled) => (value) => {
    if (!categoryDisabled) {
      dispatch(actions.setItemSelectedBoolean(CATEGORY, category.id, value));
    }

    category.tabs.forEach((tab) =>
      tabSetAll(tab, dispatch, tabDisabled)(value),
    );
  };

interface AssessmentTreeProps {
  assessment: Assessment;
  dispatch: AppDispatch;
  selectedItems: Record<string, Record<number, boolean>>;
}

const AssessmentTree: FC<AssessmentTreeProps> = (props) => {
  const { assessment, dispatch, selectedItems } = props;
  const { id, title, published } = assessment;
  const checked = !!selectedItems[ASSESSMENT][id];

  const label = (
    <span className="flex flex-row items-center">
      <TypeBadge itemType={ASSESSMENT} />
      {published || <UnpublishedIcon />}
      <Typography className="font-bold">{title}</Typography>
    </span>
  );

  return (
    <IndentedCheckbox
      key={id}
      checked={checked}
      indentLevel={2}
      label={label}
      onChange={(_, value) =>
        dispatch(actions.setItemSelectedBoolean(ASSESSMENT, id, value))
      }
    />
  );
};

interface TabTreeProps {
  tab: Tab;
  dispatch: AppDispatch;
  selectedItems: Record<string, Record<number, boolean>>;
  tabDisabled: boolean;
}

const TabTree: FC<TabTreeProps> = (props) => {
  const { tab, dispatch, selectedItems, tabDisabled } = props;
  const { id, title, assessments } = tab;
  const checked = !!selectedItems[TAB][id];

  return (
    <div key={id}>
      <IndentedCheckbox
        checked={checked}
        disabled={tabDisabled}
        indentLevel={1}
        label={
          <span className="flex flex-row items-center">
            <TypeBadge itemType={TAB} />
            <Typography className="font-bold">{title}</Typography>
          </span>
        }
        onChange={(_, value) =>
          dispatch(actions.setItemSelectedBoolean(TAB, id, value))
        }
      >
        <BulkSelectors callback={tabSetAll(tab, dispatch, tabDisabled)} />
      </IndentedCheckbox>
      {assessments.map((assessment) => (
        <AssessmentTree
          assessment={assessment}
          dispatch={dispatch}
          selectedItems={selectedItems}
        />
      ))}
    </div>
  );
};

interface CategoryTreeProps {
  category: Category;
  dispatch: AppDispatch;
  selectedItems: Record<string, Record<number, boolean>>;
  categoryDisabled: boolean;
  tabDisabled: boolean;
}

const CategoryTree: FC<CategoryTreeProps> = (props) => {
  const { category, dispatch, selectedItems, categoryDisabled, tabDisabled } =
    props;
  const { id, title, tabs } = category;
  const checked = !!selectedItems[CATEGORY][id];

  return (
    <div key={id}>
      <IndentedCheckbox
        checked={checked}
        disabled={categoryDisabled}
        indentLevel={0}
        label={
          <span className="flex flex-row items-center">
            <TypeBadge itemType={CATEGORY} />
            <Typography className="font-bold">{title}</Typography>
          </span>
        }
        onChange={(_, value) =>
          dispatch(actions.setItemSelectedBoolean(CATEGORY, id, value))
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
        <TabTree
          tab={tab}
          dispatch={dispatch}
          selectedItems={selectedItems}
          tabDisabled={tabDisabled}
        />
      ))}
    </div>
  );
};

const AssessmentsSelector: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const duplication = useAppSelector(selectDuplicationStore);

  const destinationCourse = useAppSelector(destinationCourseSelector);
  const {
    assessmentsComponent: categories,
    selectedItems,
    sourceCourse: { unduplicableObjectTypes },
  } = duplication;

  const tabDisabled =
    unduplicableObjectTypes.includes(TAB) ||
    destinationCourse.unduplicableObjectTypes.includes(TAB);

  const categoryDisabled =
    unduplicableObjectTypes.includes(CATEGORY) ||
    destinationCourse.unduplicableObjectTypes.includes(CATEGORY);

  if (!categories) {
    return null;
  }

  return (
    <>
      <Typography className="mt-3 mb-1" variant="h6">
        {t(defaultComponentTitles.course_assessments_component)}
      </Typography>
      {categories.length > 0 ? (
        categories.map((category) => (
          <CategoryTree
            category={category}
            dispatch={dispatch}
            selectedItems={selectedItems}
            tabDisabled={tabDisabled}
            categoryDisabled={categoryDisabled}
          />
        ))
      ) : (
        <ListSubheader disableSticky>{t(translations.noItems)}</ListSubheader>
      )}
    </>
  );
};

export default AssessmentsSelector;
