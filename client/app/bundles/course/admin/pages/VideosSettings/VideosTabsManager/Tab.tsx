import { useState, useEffect } from 'react';
import { Create, Delete, DragIndicator } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { Draggable } from 'react-beautiful-dnd';

import { VideosTab } from 'types/course/admin/videos';
import Prompt from 'lib/components/core/dialogs/Prompt';
import SwitchableTextField from 'lib/components/core/fields/SwitchableTextField';
import useTranslation from 'lib/hooks/useTranslation';
import translations from '../translations';

interface TabProps {
  tab: VideosTab;
  index: number;
  onDelete?: (id: VideosTab['id'], title: VideosTab['title']) => void;
  onRename?: (index: number, newTitle: VideosTab['title']) => void;
  disabled?: boolean;
}

const Tab = (props: TabProps): JSX.Element => {
  const { tab, index } = props;

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
      <Draggable draggableId={tab.id.toString()} index={index}>
        {(provided, { isDragging }): JSX.Element => {
          let transform = provided.draggableProps?.style?.transform;

          if (isDragging && transform) {
            // Reset the x-axis transform to prevent horizontal dragging
            transform = transform.replace(/\(.+,/, '(0,');
          }

          const style = {
            ...provided.draggableProps.style,
            transform,
          };

          return (
            <div
              className={`group flex w-full select-none items-center justify-between px-4 ${
                isDragging && 'rounded-lg bg-white opacity-80 drop-shadow-md'
              }`}
              ref={provided.innerRef}
              {...provided.draggableProps}
              style={style}
              {...provided.dragHandleProps}
            >
              <div className="flex w-full items-center sm:w-fit">
                <DragIndicator fontSize="small" color="disabled" />

                <SwitchableTextField
                  editable={!isDragging && renaming}
                  onChange={(e): void => setNewTitle(e.target.value)}
                  onBlur={(): void => renameTab()}
                  onPressEnter={renameTab}
                  onPressEscape={resetTabTitle}
                  value={newTitle}
                  className="ml-4"
                  textProps={{ variant: 'body2' }}
                  disabled={props.disabled}
                />

                {!renaming && (
                  <IconButton
                    size="small"
                    disabled={props.disabled ?? isDragging}
                    className="ml-4 hoverable:opacity-0 hoverable:group-hover:opacity-100"
                    onClick={(): void => setRenaming(true)}
                  >
                    <Create />
                  </IconButton>
                )}
              </div>

              {tab.canDeleteTab && (
                <IconButton
                  color="error"
                  disabled={props.disabled ?? isDragging}
                  className="ml-4 hoverable:ml-0 hoverable:opacity-0 hoverable:group-hover:opacity-100"
                  onClick={(): void => setDeleting(true)}
                >
                  <Delete />
                </IconButton>
              )}
            </div>
          );
        }}
      </Draggable>

      <Prompt
        open={deleting}
        onClose={closeDeleteTabDialog}
        title={t(translations.deleteTabPromptTitle, { tab: tab.title })}
        primaryLabel={t(translations.deleteTabPromptAction, { tab: tab.title })}
        primaryColor="error"
        onClickPrimary={deleteTab}
        disabled={props.disabled}
      >
        {t(translations.deleteTabPromptMessage)}
      </Prompt>
    </>
  );
};

export default Tab;
