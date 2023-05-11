import { useEffect, useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Add, Create, Delete, DragIndicator } from '@mui/icons-material';
import { Button, Card, IconButton, Typography } from '@mui/material';
import {
  AssessmentCategory,
  AssessmentTab,
} from 'types/course/admin/assessments';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import SwitchableTextField from 'lib/components/core/fields/SwitchableTextField';
import useTranslation from 'lib/hooks/useTranslation';

import { useAssessmentSettings } from '../AssessmentSettingsContext';
import translations from '../translations';

import MoveTabsMenu from './MoveTabsMenu';
import Tab from './Tab';

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
  disabled?: boolean;
}

const Category = (props: CategoryProps): JSX.Element => {
  const { category, index } = props;
  const { t } = useTranslation();
  const { settings, createTabInCategory, deleteCategory, moveTabs } =
    useAssessmentSettings();

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

  const handleMoveTabsAndDelete = (newCategory: AssessmentCategory): void => {
    moveTabs?.(
      category.id,
      newCategory.id,
      newCategory.title,
      handleDeleteCategory,
      closeDeleteCategoryDialog,
    );
  };

  const renderMoveMenu = (): JSX.Element | undefined => {
    const categories = settings?.categories.filter(
      (other) => other.id !== category.id,
    );

    return (
      <MoveTabsMenu
        categories={categories}
        disabled={props.disabled}
        onSelectCategory={handleMoveTabsAndDelete}
      />
    );
  };

  const renderTabs = (
    tabs: AssessmentTab[],
    disabled?: boolean,
  ): JSX.Element[] =>
    tabs.map((tab: AssessmentTab, tabIndex: number) => (
      <Tab
        key={tab.id}
        disabled={disabled}
        index={tabIndex}
        onRename={handleRenameTab}
        stationary={tabs.length <= 1}
        tab={tab}
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
        isDragDisabled={props.disabled}
      >
        {(provided, { isDragging }): JSX.Element => (
          <Card
            ref={provided.innerRef}
            className={`mb-5 select-none overflow-hidden ${
              isDragging && 'opacity-80 drop-shadow-md'
            }`}
            variant="outlined"
            {...provided.draggableProps}
          >
            <div
              className="group flex items-center justify-between px-4 py-2 hover:bg-neutral-100"
              {...provided.dragHandleProps}
            >
              <div className="flex w-full items-center justify-between sm:w-fit">
                <div className="flex items-center">
                  <DragIndicator
                    className={`${props.disabled && 'invisible'}`}
                    color="disabled"
                    fontSize="small"
                  />

                  <div className="ml-4 flex items-center">
                    <SwitchableTextField
                      disabled={props.disabled}
                      editable={renaming}
                      onBlur={(): void => handleRenameCategory()}
                      onChange={(e): void => setNewTitle(e.target.value)}
                      onPressEnter={handleRenameCategory}
                      onPressEscape={resetCategoryTitle}
                      value={newTitle}
                    />

                    {!renaming && category.assessmentsCount > 0 && (
                      <Typography color="text.secondary" variant="body2">
                        {t(translations.containsNAssessments, {
                          n: category.assessmentsCount.toString(),
                        })}
                      </Typography>
                    )}
                  </div>
                </div>

                {!renaming && (
                  <IconButton
                    className="hoverable:invisible group-hover?:visible ml-4"
                    disabled={isDragging || props.disabled}
                    onClick={(): void => setRenaming(true)}
                    size="small"
                  >
                    <Create />
                  </IconButton>
                )}
              </div>

              <div className="flex min-w-fit items-center">
                {category.canDeleteCategory && !props.stationary && (
                  <IconButton
                    className="mx-4 sm:mx-0"
                    color="error"
                    disabled={isDragging || props.disabled}
                    onClick={handleClickDelete}
                  >
                    <Delete />
                  </IconButton>
                )}

                {category.canCreateTabs && (
                  <Button
                    disabled={isDragging || props.disabled}
                    onClick={handleCreateTab}
                    startIcon={<Add />}
                  >
                    {t(translations.addATab)}
                  </Button>
                )}
              </div>
            </div>

            <Droppable droppableId={`category-${index}`} type="tabs">
              {(
                droppableProvided,
                { isDraggingOver, draggingFromThisWith },
              ): JSX.Element => (
                <div
                  ref={droppableProvided.innerRef}
                  className={`-mb-4 p-4 ${
                    draggingFromThisWith && 'bg-neutral-50'
                  } ${isDraggingOver && 'bg-yellow-50'}`}
                  {...droppableProvided.droppableProps}
                >
                  {renderTabs(category.tabs, isDragging || props.disabled)}
                  {droppableProvided.placeholder}
                </div>
              )}
            </Droppable>
          </Card>
        )}
      </Draggable>

      <Prompt
        disabled={props.disabled}
        onClickPrimary={handleDeleteCategory}
        onClose={closeDeleteCategoryDialog}
        open={deleting}
        primaryColor="error"
        primaryLabel={t(translations.deleteCategoryPromptAction, {
          title: category.title,
        })}
        secondary={renderMoveMenu()}
        title={t(translations.deleteCategoryPromptTitle, {
          title: category.title,
        })}
      >
        <PromptText>{t(translations.deleteCategoryPromptMessage)}</PromptText>

        <PromptText className="mt-4">
          {t(translations.thisCategoryContains)}

          {category.topAssessmentTitles.map((assessment) => (
            <li key={assessment}>{assessment}</li>
          ))}

          {category.assessmentsCount > category.topAssessmentTitles.length &&
            t(translations.andNMoreItems, {
              n: (
                category.assessmentsCount - category.topAssessmentTitles.length
              ).toString(),
            })}
        </PromptText>
      </Prompt>
    </>
  );
};

export default Category;
