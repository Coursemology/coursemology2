import { useState, useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card, DialogContentText, IconButton, Typography } from '@mui/material';
import { Delete, DragIndicator, Create } from '@mui/icons-material';

import useTranslation from 'lib/hooks/useTranslation';
import { AssessmentTab } from 'types/course/admin/assessments';
import SwitchableTextField from 'lib/components/core/fields/SwitchableTextField';
import Prompt from 'lib/components/core/dialogs/Prompt';
import { useAssessmentSettings } from '../AssessmentSettingsContext';
import translations from '../translations';
import { getTabsInCategories } from './utils';
import MoveAssessmentsMenu from './MoveAssessmentsMenu';

interface TabProps {
  tab: AssessmentTab;
  index: number;
  stationary: boolean;
  disabled: boolean;
  onRename?: (index: number, newTitle: AssessmentTab['title']) => void;
}

const Tab = (props: TabProps): JSX.Element => {
  const { tab, index, stationary, disabled } = props;
  const { t } = useTranslation();
  const { settings, deleteTabInCategory, moveAssessments } =
    useAssessmentSettings();

  const [newTitle, setNewTitle] = useState(tab.title);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const closeDeleteTabDialog = (): void => setDeleting(false);

  const resetTabTitle = (): void => {
    setNewTitle(tab.title);
    setRenaming(false);
  };

  const handleRenameTab = (): void => {
    const trimmedNewTitle = newTitle.trim();
    if (!trimmedNewTitle) return resetTabTitle();

    props.onRename?.(index, trimmedNewTitle);
    return setRenaming(false);
  };

  const handleDeleteTab = (): void => {
    deleteTabInCategory?.(tab.categoryId, tab.id, tab.title);
    closeDeleteTabDialog();
  };

  const handleClickDelete = (): void => {
    if (tab.assessmentsCount > 0) {
      setDeleting(true);
    } else {
      handleDeleteTab();
    }
  };

  const handleMoveAssessmentsAndDelete = (newTab: AssessmentTab): void => {
    moveAssessments?.(
      tab.id,
      newTab.id,
      newTab.fullTabTitle ?? newTab.title,
      handleDeleteTab,
      closeDeleteTabDialog,
    );
  };

  const renderMoveMenu = (): JSX.Element => {
    const tabs = getTabsInCategories(
      settings?.categories,
      (other) => other.id === tab.id,
    );

    return (
      <MoveAssessmentsMenu
        tabs={tabs}
        onSelectTab={handleMoveAssessmentsAndDelete}
        disabled={props.disabled}
      />
    );
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
        isDragDisabled={disabled || stationary}
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
                  className={`${(disabled || stationary) && 'opacity-0'}`}
                />

                <div className="ml-4 flex items-center">
                  <SwitchableTextField
                    editable={renaming}
                    onChange={(e): void => setNewTitle(e.target.value)}
                    onBlur={(): void => handleRenameTab()}
                    onPressEnter={handleRenameTab}
                    onPressEscape={resetTabTitle}
                    value={newTitle}
                    textProps={{ variant: 'body2' }}
                    disabled={disabled}
                  />

                  {!renaming && tab.assessmentsCount > 0 && (
                    <Typography variant="body2" color="text.disabled">
                      {t(translations.containsNAssessments, {
                        n: tab.assessmentsCount.toString(),
                      })}
                    </Typography>
                  )}
                </div>
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

            {tab.canDeleteTab && !stationary && (
              <IconButton
                color="error"
                disabled={disabled || isDragging}
                className="ml-4 hoverable:ml-0 hoverable:opacity-0 hoverable:group-hover:opacity-100"
                onClick={handleClickDelete}
              >
                <Delete />
              </IconButton>
            )}
          </Card>
        )}
      </Draggable>

      <Prompt
        open={deleting}
        onClose={closeDeleteTabDialog}
        title={t(translations.deleteTabPromptTitle, {
          title: tab.title,
        })}
        primaryLabel={t(translations.deleteTabPromptAction, {
          title: tab.title,
        })}
        primaryColor="error"
        onClickPrimary={handleDeleteTab}
        secondary={renderMoveMenu()}
        disabled={props.disabled}
      >
        <DialogContentText>
          {t(translations.deleteTabPromptMessage)}
        </DialogContentText>
        <DialogContentText className="mt-4">
          {t(translations.thisTabContains)}

          {tab.topAssessmentTitles.map((assessment) => (
            <li key={assessment}>{assessment}</li>
          ))}

          {tab.assessmentsCount > tab.topAssessmentTitles.length &&
            t(translations.andNMoreItems, {
              n: (
                tab.assessmentsCount - tab.topAssessmentTitles.length
              ).toString(),
            })}
        </DialogContentText>
      </Prompt>
    </>
  );
};

export default Tab;
