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
import SwitchableTextField from 'lib/components/core/fields/SwitchableTextField';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Tab from './Tab';
import translations from '../translations';
import { useAssessmentSettings } from '../AssessmentSettingsContext';
import MoveTabsMenu from './MoveTabsMenu';

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
        onSelectCategory={handleMoveTabsAndDelete}
        disabled={props.disabled}
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
        isDragDisabled={props.disabled}
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
                  <DragIndicator
                    fontSize="small"
                    color="disabled"
                    className={`${props.disabled && 'invisible'}`}
                  />

                  <div className="ml-4 flex items-center">
                    <SwitchableTextField
                      editable={renaming}
                      onChange={(e): void => setNewTitle(e.target.value)}
                      onBlur={(): void => handleRenameCategory()}
                      onPressEnter={handleRenameCategory}
                      onPressEscape={resetCategoryTitle}
                      value={newTitle}
                      disabled={props.disabled}
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
                    disabled={isDragging || props.disabled}
                    className="hoverable:invisible hoverable:group-hover:visible ml-4"
                    onClick={(): void => setRenaming(true)}
                  >
                    <Create />
                  </IconButton>
                )}
              </div>

              <div className="flex min-w-fit items-center">
                {category.canDeleteCategory && !props.stationary && (
                  <IconButton
                    color="error"
                    disabled={isDragging || props.disabled}
                    className="mx-4 sm:mx-0"
                    onClick={handleClickDelete}
                  >
                    <Delete />
                  </IconButton>
                )}

                {category.canCreateTabs && (
                  <Button
                    startIcon={<Add />}
                    disabled={isDragging || props.disabled}
                    onClick={handleCreateTab}
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
                  className={`-mb-4 p-4 ${
                    draggingFromThisWith && 'bg-neutral-50'
                  } ${isDraggingOver && 'bg-yellow-50'}`}
                  ref={droppableProvided.innerRef}
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
        open={deleting}
        onClose={closeDeleteCategoryDialog}
        title={t(translations.deleteCategoryPromptTitle, {
          title: category.title,
        })}
        primaryLabel={t(translations.deleteCategoryPromptAction, {
          title: category.title,
        })}
        primaryColor="error"
        onClickPrimary={handleDeleteCategory}
        secondary={renderMoveMenu()}
        disabled={props.disabled}
      >
        <DialogContentText>
          {t(translations.deleteCategoryPromptMessage)}
        </DialogContentText>

        <DialogContentText className="mt-4">
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
        </DialogContentText>
      </Prompt>
    </>
  );
};

export default Category;
