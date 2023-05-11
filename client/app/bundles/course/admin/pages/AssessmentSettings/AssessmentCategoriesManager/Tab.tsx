import { useEffect, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Create, Delete, DragIndicator } from '@mui/icons-material';
import { Card, IconButton, Typography } from '@mui/material';
import { AssessmentTab } from 'types/course/admin/assessments';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import SwitchableTextField from 'lib/components/core/fields/SwitchableTextField';
import useTranslation from 'lib/hooks/useTranslation';

import { useAssessmentSettings } from '../AssessmentSettingsContext';
import translations from '../translations';

import MoveAssessmentsMenu from './MoveAssessmentsMenu';
import { getTabsInCategories } from './utils';

interface TabProps {
  tab: AssessmentTab;
  index: number;
  stationary: boolean;
  disabled?: boolean;
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
        disabled={props.disabled}
        onSelectTab={handleMoveAssessmentsAndDelete}
        tabs={tabs}
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
        isDragDisabled={stationary || disabled}
      >
        {(provided, { isDragging }): JSX.Element => (
          <Card
            ref={provided.innerRef}
            className={`group mb-4 flex min-h-[4rem] select-none items-center justify-between px-4 ${
              !stationary && 'hover:bg-neutral-100'
            } ${isDragging && 'opacity-80 drop-shadow-md'}`}
            variant="outlined"
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className="flex w-full items-center justify-between sm:w-fit">
              <div className="flex items-center">
                <DragIndicator
                  className={`${(stationary || disabled) && 'invisible'}`}
                  color="disabled"
                  fontSize="small"
                />

                <div className="ml-4 flex items-center">
                  <SwitchableTextField
                    disabled={disabled}
                    editable={renaming}
                    onBlur={(): void => handleRenameTab()}
                    onChange={(e): void => setNewTitle(e.target.value)}
                    onPressEnter={handleRenameTab}
                    onPressEscape={resetTabTitle}
                    textProps={{ variant: 'body2' }}
                    value={newTitle}
                  />

                  {!renaming && tab.assessmentsCount > 0 && (
                    <Typography color="text.disabled" variant="body2">
                      {t(translations.containsNAssessments, {
                        n: tab.assessmentsCount.toString(),
                      })}
                    </Typography>
                  )}
                </div>
              </div>

              {!renaming && (
                <IconButton
                  className="hoverable:invisible group-hover?:visible ml-4"
                  disabled={isDragging || disabled}
                  onClick={(): void => setRenaming(true)}
                  size="small"
                >
                  <Create />
                </IconButton>
              )}
            </div>

            {tab.canDeleteTab && !stationary && (
              <IconButton
                className="hoverable:invisible group-hover?:visible ml-4 hoverable:ml-0"
                color="error"
                disabled={isDragging || disabled}
                onClick={handleClickDelete}
              >
                <Delete />
              </IconButton>
            )}
          </Card>
        )}
      </Draggable>

      <Prompt
        disabled={props.disabled}
        onClickPrimary={handleDeleteTab}
        onClose={closeDeleteTabDialog}
        open={deleting}
        primaryColor="error"
        primaryLabel={t(translations.deleteTabPromptAction, {
          title: tab.title,
        })}
        secondary={renderMoveMenu()}
        title={t(translations.deleteTabPromptTitle, {
          title: tab.title,
        })}
      >
        <PromptText>{t(translations.deleteTabPromptMessage)}</PromptText>

        <PromptText className="mt-4">
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
        </PromptText>
      </Prompt>
    </>
  );
};

export default Tab;
