import { useEffect, useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import {
  Button,
  Card,
  IconButton,
  Typography,
  DialogContentText,
} from '@mui/material';
import { Add, Delete, DragIndicator, Create } from '@mui/icons-material';

import {
  AssessmentCategory,
  AssessmentTab,
} from 'types/course/admin/assessments';
import useTranslation from 'lib/hooks/useTranslation';
import SwitchableTextField from 'lib/components/SwitchableTextField';
import Prompt from 'lib/components/Prompt';
import Tab from './Tab';
import translations from '../translations';
import { useAssessmentSettings } from '../AssessmentSettingsContext';
import { getTabsInCategories } from './utils';
import MoveAssessmentsMenu from './MoveAssessmentsMenu';

interface CategoryProps {
  category: AssessmentCategory;
  index: number;
  stationary: boolean;
  onRename?: (index: number, newTitle: AssessmentCategory['title']) => void;
  onRenameTab?: (
    index: number,
    tabIndex: number,
    newTitle: AssessmentTab['title'],
  ) => void;
}

const Category = (props: CategoryProps): JSX.Element => {
  const { category, index } = props;
  const { t } = useTranslation();
  const {
    settings,
    createTabInCategory,
    deleteCategory,
    moveAssessmentsToTab,
  } = useAssessmentSettings();

  const [newTitle, setNewTitle] = useState(category.title);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const closeDeleteCategoryDialog = (): void => setDeleting(false);

  const resetCategoryTitle = (): void => {
    setNewTitle(category.title);
    setRenaming(false);
  };

  const handleDeleteCategory = (): void => {
    deleteCategory?.(category.id, category.title);
    closeDeleteCategoryDialog();
  };

  const handleRenameCategory = (): void => {
    const trimmedNewTitle = newTitle.trim();
    if (!trimmedNewTitle) return resetCategoryTitle();

    props.onRename?.(index, trimmedNewTitle);
    return setRenaming(false);
  };

  const handleRenameTab = (
    tabIndex: number,
    newTabTitle: AssessmentTab['title'],
  ): void => {
    props.onRenameTab?.(index, tabIndex, newTabTitle);
  };

  const handleCreateTab = (): void =>
    createTabInCategory?.(
      category.id,
      t(translations.newTabDefaultName),
      category.tabs[category.tabs.length - 1].weight + 1,
    );

  const handleClickDelete = (): void => {
    if (category.assessmentsCount > 0) {
      setDeleting(true);
    } else {
      handleDeleteCategory();
    }
  };

  const handleMoveAssessmentsAndDelete = (tab: AssessmentTab): void => {
    moveAssessmentsToTab?.(
      category.assessmentsIds,
      tab.id,
      tab.fullTabTitle ?? tab.title,
    ).then(() => {
      handleDeleteCategory();
      setDeleting(false);
    });
  };

  const renderMoveMenu = (): JSX.Element | undefined => {
    const tabIds = new Set(category.tabs.map((tab) => tab.id));
    const tabs = getTabsInCategories(settings?.categories, (tab) =>
      tabIds.has(tab.id),
    );

    return (
      <MoveAssessmentsMenu
        tabs={tabs}
        onSelectTab={handleMoveAssessmentsAndDelete}
      />
    );
  };

  const renderTabs = (
    tabs: AssessmentTab[],
    disabled: boolean,
  ): JSX.Element[] =>
    tabs.map((tab: AssessmentTab, tabIndex: number) => (
      <Tab
        key={tab.id}
        tab={tab}
        index={tabIndex}
        disabled={disabled}
        stationary={tabs.length <= 1}
        onRename={handleRenameTab}
      />
    ));

  useEffect(() => {
    resetCategoryTitle();
  }, [category.title]);

  return (
    <>
      <Draggable
        key={category.id}
        draggableId={`category-${category.id}`}
        index={index}
      >
        {(provided, { isDragging }): JSX.Element => (
          <Card
            variant="outlined"
            className={`mb-5 select-none overflow-hidden ${
              isDragging && 'opacity-80 drop-shadow-md'
            }`}
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <div
              className="group flex items-center justify-between px-4 py-2 hover:bg-neutral-100"
              {...provided.dragHandleProps}
            >
              <div className="flex w-full items-center justify-between sm:w-fit">
                <div className="flex items-center">
                  <DragIndicator fontSize="small" color="disabled" />

                  <div className="ml-4 flex items-center">
                    <SwitchableTextField
                      editable={renaming}
                      onChange={(e): void => setNewTitle(e.target.value)}
                      onBlur={(): void => handleRenameCategory()}
                      onPressEnter={handleRenameCategory}
                      onPressEscape={resetCategoryTitle}
                      value={newTitle}
                    />

                    {!renaming && category.assessmentsCount > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        {t(translations.containsNAssessments, {
                          n: category.assessmentsCount.toString(),
                        })}
                      </Typography>
                    )}
                  </div>
                </div>

                {!renaming && (
                  <IconButton
                    size="small"
                    disabled={isDragging}
                    className="ml-4 hoverable:opacity-0 hoverable:group-hover:opacity-100"
                    onClick={(): void => setRenaming(true)}
                  >
                    <Create />
                  </IconButton>
                )}
              </div>

              <div className="flex min-w-fit items-center">
                {!props.stationary && (
                  <IconButton
                    color="error"
                    disabled={isDragging}
                    className="mx-4 sm:mx-0"
                    onClick={handleClickDelete}
                  >
                    <Delete />
                  </IconButton>
                )}

                <Button
                  startIcon={<Add />}
                  disabled={isDragging}
                  onClick={handleCreateTab}
                >
                  {t(translations.addATab)}
                </Button>
              </div>
            </div>

            <Droppable droppableId={`category-${index}`} type="tabs">
              {(
                droppableProvided,
                { isDraggingOver, draggingFromThisWith },
              ): JSX.Element => (
                <div
                  className={`-mb-4 p-4 ${
                    draggingFromThisWith && 'bg-neutral-50'
                  } ${isDraggingOver && 'bg-yellow-50'}`}
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                >
                  {renderTabs(category.tabs, isDragging)}
                  {droppableProvided.placeholder}
                </div>
              )}
            </Droppable>
          </Card>
        )}
      </Draggable>

      <Prompt
        open={deleting}
        onCancel={closeDeleteCategoryDialog}
        title={t(translations.deleteCategoryPromptTitle, {
          title: category.title,
        })}
        override
        content={
          <>
            <DialogContentText>
              {t(translations.deleteCategoryPromptMessage)}
            </DialogContentText>

            <DialogContentText className="mt-4">
              {t(translations.thisCategoryContains)}

              {category.topAssessmentsTitles.map((assessment) => (
                <li key={assessment}>{assessment}</li>
              ))}

              {category.assessmentsCount >
                category.topAssessmentsTitles.length &&
                t(translations.andNMoreItems, {
                  n: (
                    category.assessmentsCount -
                    category.topAssessmentsTitles.length
                  ).toString(),
                })}
            </DialogContentText>
          </>
        }
        primaryAction={t(translations.deleteCategoryPromptAction, {
          title: category.title,
        })}
        primaryActionColor="error"
        onPrimaryAction={handleDeleteCategory}
        secondaryAction={renderMoveMenu()}
      />
    </>
  );
};

export default Category;
