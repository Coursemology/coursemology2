import { FC, MouseEventHandler, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Add, Close, ContentCopy } from '@mui/icons-material';
import { Box, Button, IconButton, Tab, Tabs } from '@mui/material';
import { tabsStyle } from 'theme/mui-style';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getAssessmentGenerateQuestionsData } from './selectors';
import { ConversationState } from './types';

const translations = defineMessages({
  newTab: {
    id: 'course.assessment.generation.newTab',
    defaultMessage: 'New',
  },
  resetConversation: {
    id: 'course.assessment.generation.resetConversation',
    defaultMessage: 'Reset',
  },
  openExportDialog: {
    id: 'course.assessment.generation.openExportDialog',
    defaultMessage: 'Export',
  },
  confirmDeleteConversation: {
    id: 'course.assessment.generation.confirmDeleteConversation',
    defaultMessage:
      'Are you sure you want to delete "{title}" and all its history items? THIS ACTION IS IRREVERSIBLE!',
  },
});

interface Props {
  canReset: boolean;
  createConversation: () => void;
  deleteConversation: (conversation: ConversationState) => void;
  duplicateConversation: (conversation: ConversationState) => void;
  resetConversation: () => void;
  switchToConversation: (conversation: ConversationState) => void;
  onExport: MouseEventHandler;
}

const GenerateTabs: FC<Props> = (props) => {
  const {
    onExport,
    createConversation,
    deleteConversation,
    duplicateConversation,
    resetConversation,
    switchToConversation,
    canReset,
  } = props;
  const { t } = useTranslation();
  const [conversationToDeleteId, setConversationToDeleteId] =
    useState<string>();
  const {
    canExportCount,
    conversations,
    conversationIds,
    activeConversationId,
    conversationMetadata,
  } = useAppSelector(getAssessmentGenerateQuestionsData);

  const renderConversationDeletePrompt = (): JSX.Element | null => {
    if (!conversationToDeleteId) return null;
    const conversation = conversationMetadata[conversationToDeleteId];
    if (!conversation) return null;
    return (
      <Prompt
        contentClassName="space-y-4"
        disabled={false}
        onClickPrimary={() => {
          deleteConversation(conversations[conversationToDeleteId]);
          setConversationToDeleteId(undefined);
        }}
        onClose={() => setConversationToDeleteId(undefined)}
        open={Boolean(conversationToDeleteId)}
        primaryDisabled={false}
        primaryLabel="Yes"
      >
        <PromptText>
          {t(translations.confirmDeleteConversation, {
            title: conversation.title ?? 'Untitled Question',
          })}
        </PromptText>
      </Prompt>
    );
  };

  return (
    <Box className="max-w-full">
      <Box className="flex flex-nowrap border-b border-divider">
        <Tabs
          className="h-17 overflow-y-clip"
          onChange={(_, newConversationId) =>
            switchToConversation(conversations[newConversationId])
          }
          scrollButtons="auto"
          sx={tabsStyle}
          TabIndicatorProps={{ style: { transition: 'none' } }}
          value={activeConversationId}
          variant="scrollable"
        >
          {conversationIds
            .map((id) => conversationMetadata[id])
            .map((metadata) => {
              return (
                <Tab
                  key={metadata.id}
                  className="min-h-17 p-2"
                  id={metadata.id}
                  label={
                    <span className="flex items-center min-w-0 max-w-full">
                      {metadata.isGenerating && (
                        <LoadingIndicator
                          bare
                          className={`mr-2 flex-shrink-0${metadata.id === activeConversationId ? '' : ' text-gray-600'}`}
                          size={15}
                        />
                      )}
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap min-w-0 flex-1">
                        {metadata.title ?? 'Untitled Question'}
                      </span>
                      <div className="flex items-center flex-shrink-0 ml-1">
                        <IconButton
                          className="-ml-0.25 -mr-0.25 py-0 px-0.5 scale-[0.86] origin-right"
                          color="inherit"
                          component="span"
                          disabled={metadata.isGenerating}
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateConversation(conversations[metadata.id]);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          size="small"
                        >
                          <ContentCopy />
                        </IconButton>
                        <IconButton
                          className="-ml-0.25 -mr-0.25 py-0 px-0.5 scale-[0.86] origin-right"
                          color="inherit"
                          component="span"
                          disabled={
                            conversationIds.length <= 1 || metadata.isGenerating
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            if (metadata.hasData) {
                              setConversationToDeleteId(metadata.id);
                            } else {
                              deleteConversation(conversations[metadata.id]);
                            }
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          size="small"
                        >
                          <Close />
                        </IconButton>
                      </div>
                    </span>
                  }
                  value={metadata.id}
                />
              );
            })}
        </Tabs>
        {renderConversationDeletePrompt()}
        <Button
          className="m-3 max-h-11"
          disabled={false}
          onClick={createConversation}
          startIcon={<Add />}
          variant="outlined"
        >
          {t(translations.newTab)}
        </Button>

        <Box className="flex-1 full-width" />
        {canReset && (
          <Button
            className="my-3 mr-3 max-h-11"
            onClick={resetConversation}
            variant="outlined"
          >
            {t(translations.resetConversation)}
          </Button>
        )}
        <Button
          className="my-3 max-h-11"
          disabled={canExportCount === 0}
          onClick={onExport}
          variant="contained"
        >
          {t(translations.openExportDialog)}
        </Button>
      </Box>
    </Box>
  );
};

export default GenerateTabs;
