import { useEffect, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Create, Delete, DragIndicator } from '@mui/icons-material';
import { IconButton } from '@mui/material';
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
              ref={provided.innerRef}
              className={`group flex w-full select-none items-center justify-between px-4 ${
                isDragging && 'rounded-lg bg-white opacity-80 drop-shadow-md'
              }`}
              {...provided.draggableProps}
              style={style}
              {...provided.dragHandleProps}
            >
              <div className="flex w-full items-center sm:w-fit">
                <DragIndicator color="disabled" fontSize="small" />

                <SwitchableTextField
                  className="ml-4"
                  disabled={props.disabled}
                  editable={!isDragging && renaming}
                  onBlur={(): void => renameTab()}
                  onChange={(e): void => setNewTitle(e.target.value)}
                  onPressEnter={renameTab}
                  onPressEscape={resetTabTitle}
                  textProps={{ variant: 'body2' }}
                  value={newTitle}
                />

                {!renaming && (
                  <IconButton
                    className="ml-4 hoverable:invisible group-hover?:visible"
                    disabled={isDragging || props.disabled}
                    onClick={(): void => setRenaming(true)}
                    size="small"
                  >
                    <Create />
                  </IconButton>
                )}
              </div>

              {tab.canDeleteTab && (
                <IconButton
                  className="ml-4 hoverable:invisible hoverable:ml-0 group-hover?:visible"
                  color="error"
                  disabled={isDragging || props.disabled}
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
        disabled={props.disabled}
        onClickPrimary={deleteTab}
        onClose={closeDeleteTabDialog}
        open={deleting}
        primaryColor="error"
        primaryLabel={t(translations.deleteTabPromptAction, {
          title: tab.title,
        })}
        title={t(translations.deleteTabPromptTitle, { title: tab.title })}
      >
        {t(translations.deleteTabPromptMessage)}
      </Prompt>
    </>
  );
};

export default Tab;
