import { useState, useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card, IconButton } from '@mui/material';
import { Delete, DragIndicator, Create } from '@mui/icons-material';

import useTranslation from 'lib/hooks/useTranslation';
import { AssessmentTab } from 'types/course/admin/assessments';
import SwitchableTextField from 'lib/components/SwitchableTextField';
import Prompt from 'lib/components/Prompt';
import translations from '../translations';

interface TabProps {
  tab: AssessmentTab;
  index: number;
  stationary: boolean;
  disabled: boolean;
  onDelete?: (id: AssessmentTab['id'], title: AssessmentTab['title']) => void;
  onRename?: (index: number, newTitle: AssessmentTab['title']) => void;
}

const Tab = (props: TabProps): JSX.Element => {
  const { tab, index, stationary, disabled } = props;
  const { t } = useTranslation();

  const [newTitle, setNewTitle] = useState(tab.title);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const closeDeleteTabDialog = (): void => setDeleting(false);

  const deleteTab = (): void => {
    props.onDelete?.(tab.id, tab.title);
    closeDeleteTabDialog();
  };

  const resetTabTitle = (): void => {
    setNewTitle(tab.title);
    setRenaming(false);
  };

  const renameTab = (): void => {
    const trimmedNewTitle = newTitle.trim();
    if (!trimmedNewTitle) return resetTabTitle();

    props.onRename?.(index, trimmedNewTitle);
    return setRenaming(false);
  };

  useEffect(() => {
    resetTabTitle();
  }, [tab.title]);

  return (
    <>
      <Draggable
        key={tab.id}
        draggableId={`tab-${tab.id}`}
        index={index}
        isDragDisabled={stationary}
      >
        {(provided, { isDragging }): JSX.Element => (
          <Card
            variant="outlined"
            className={`group mb-4 flex min-h-[4rem] select-none items-center justify-between px-4 ${
              !stationary && 'hover:bg-neutral-100'
            } ${isDragging && 'opacity-80 drop-shadow-md'}`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className="flex w-full items-center justify-between sm:w-fit">
              <div className="flex items-center">
                <DragIndicator
                  fontSize="small"
                  color="disabled"
                  className={`${stationary && 'opacity-0'}`}
                />

                <SwitchableTextField
                  editable={renaming}
                  onChange={(e): void => setNewTitle(e.target.value)}
                  onBlur={(): void => renameTab()}
                  onPressEnter={renameTab}
                  onPressEscape={resetTabTitle}
                  value={newTitle}
                  className="ml-4"
                  textProps={{ variant: 'body2' }}
                />
              </div>

              {!renaming && (
                <IconButton
                  size="small"
                  disabled={disabled || isDragging}
                  className="ml-4 hoverable:opacity-0 hoverable:group-hover:opacity-100"
                  onClick={(): void => setRenaming(true)}
                >
                  <Create />
                </IconButton>
              )}
            </div>

            {!stationary && (
              <IconButton
                color="error"
                disabled={disabled || isDragging}
                className="ml-4 hoverable:ml-0 hoverable:opacity-0 hoverable:group-hover:opacity-100"
                onClick={(): void => setDeleting(true)}
              >
                <Delete />
              </IconButton>
            )}
          </Card>
        )}
      </Draggable>

      <Prompt
        open={deleting}
        onCancel={closeDeleteTabDialog}
        title={t(translations.deleteTabPromptTitle, {
          title: tab.title,
        })}
        content={t(translations.deleteTabPromptMessage)}
        primaryAction={t(translations.deleteTabPromptAction, {
          title: tab.title,
        })}
        primaryActionColor="error"
        onPrimaryAction={deleteTab}
      />
    </>
  );
};

export default Tab;
