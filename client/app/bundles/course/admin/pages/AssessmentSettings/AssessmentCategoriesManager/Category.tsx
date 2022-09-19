import { useEffect, useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Card, IconButton } from '@mui/material';
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

interface CategoryProps {
  category: AssessmentCategory;
  index: number;
  onDelete?: (
    id: AssessmentCategory['id'],
    title: AssessmentCategory['title'],
  ) => void;
  onDeleteTab?: (
    id: AssessmentCategory['id'],
    tabId: AssessmentTab['id'],
    title: AssessmentTab['title'],
  ) => void;
  onRename?: (index: number, newTitle: AssessmentCategory['title']) => void;
  onRenameTab?: (
    index: number,
    tabIndex: number,
    newTitle: AssessmentTab['title'],
  ) => void;
  onCreateTab?: (
    id: AssessmentCategory['id'],
    title: AssessmentTab['title'],
    weight: AssessmentTab['weight'],
  ) => void;
}

const Category = (props: CategoryProps): JSX.Element => {
  const { category, index } = props;
  const { t } = useTranslation();

  const [newTitle, setNewTitle] = useState(category.title);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const closeDeleteCategoryDialog = (): void => setDeleting(false);

  const deleteTab = (
    id: AssessmentTab['id'],
    title: AssessmentTab['title'],
  ): void => props.onDeleteTab?.(category.id, id, title);

  const deleteCategory = (): void => {
    props.onDelete?.(category.id, category.title);
    closeDeleteCategoryDialog();
  };

  const resetCategoryTitle = (): void => {
    setNewTitle(category.title);
    setRenaming(false);
  };

  const renameCategory = (): void => {
    const trimmedNewTitle = newTitle.trim();
    if (!trimmedNewTitle) return resetCategoryTitle();

    props.onRename?.(index, trimmedNewTitle);
    return setRenaming(false);
  };

  const renameTab = (
    tabIndex: number,
    newTabTitle: AssessmentTab['title'],
  ): void => {
    props.onRenameTab?.(index, tabIndex, newTabTitle);
  };

  useEffect(() => {
    resetCategoryTitle();
  }, [category.title]);

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
        onDelete={deleteTab}
        onRename={renameTab}
      />
    ));

  const createTab = (): void =>
    props.onCreateTab?.(
      category.id,
      'New Tab',
      category.tabs[category.tabs.length - 1].weight + 1,
    );

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

                  <SwitchableTextField
                    editable={renaming}
                    onChange={(e): void => setNewTitle(e.target.value)}
                    onBlur={(): void => renameCategory()}
                    onPressEnter={renameCategory}
                    onPressEscape={resetCategoryTitle}
                    value={newTitle}
                    className="ml-4"
                  />
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
                <IconButton
                  color="error"
                  disabled={isDragging}
                  className="mx-4 sm:mx-0"
                  onClick={(): void => setDeleting(true)}
                >
                  <Delete />
                </IconButton>

                <Button
                  startIcon={<Add />}
                  disabled={isDragging}
                  onClick={createTab}
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
        content={t(translations.deleteCategoryPromptMessage)}
        primaryAction={t(translations.deleteCategoryPromptAction, {
          title: category.title,
        })}
        primaryActionColor="error"
        onPrimaryAction={deleteCategory}
      />
    </>
  );
};

export default Category;
