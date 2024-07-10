import { FC, MouseEventHandler, useState } from 'react';
import { Add, Close, ContentCopy } from '@mui/icons-material';
import { Box, Button, IconButton, Tab, Tabs } from '@mui/material';
import { tabsStyle } from 'theme/mui-style';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import { useAppSelector } from 'lib/hooks/store';

import { getAssessmentGenerateQuestionsData } from './selectors';
import { ConversationState } from './types';

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
          Are you sure you want to delete &quot;
          {conversation.title ?? 'Untitled Question'}&quot; and all its history
          items? THIS ACTION IS IRREVERSIBLE!
        </PromptText>
      </Prompt>
    );
  };

  return (
    <Box className="max-w-full">
      <Box
        className="flex flex-nowrap"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tabs
          onChange={(_, newConversationId) =>
            switchToConversation(conversations[newConversationId])
          }
          scrollButtons="auto"
          sx={{ ...tabsStyle, height: '50px', overflowY: 'clip' }}
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
                  id={metadata.id}
                  label={
                    <span>
                      {metadata.title ?? 'Untitled Question'}
                      <IconButton
                        color="inherit"
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateConversation(conversations[metadata.id]);
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        size="small"
                        sx={{
                          marginLeft: -0.2,
                          marginRight: -0.25,
                          padding: 0.4,
                          transform: 'scale(0.86)',
                          transformOrigin: 'right',
                        }}
                      >
                        <ContentCopy />
                      </IconButton>
                      <IconButton
                        color="inherit"
                        component="span"
                        disabled={conversationIds.length <= 1}
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
                        sx={{
                          marginLeft: -0.2,
                          marginRight: -0.25,
                          padding: 0.4,
                          transform: 'scale(0.86)',
                          transformOrigin: 'right',
                        }}
                      >
                        <Close />
                      </IconButton>
                    </span>
                  }
                  style={{
                    minHeight: 48,
                    padding: 8,
                    textDecoration: 'none',
                  }}
                  value={metadata.id}
                />
              );
            })}
        </Tabs>
        {renderConversationDeletePrompt()}
        <Button
          disabled={false}
          onClick={createConversation}
          startIcon={<Add />}
          sx={{ marginY: 1, marginX: 1, maxHeight: '34px' }}
          variant="outlined"
        >
          New
        </Button>

        <Box sx={{ flex: '1', width: '100%' }} />
        {canReset && (
          <Button
            onClick={resetConversation}
            sx={{ marginY: 1, maxHeight: '34px', marginRight: 1 }}
            variant="outlined"
          >
            Reset
          </Button>
        )}
        <Button
          disabled={canExportCount === 0}
          onClick={onExport}
          sx={{ marginY: 1, maxHeight: '34px' }}
          variant="contained"
        >
          Export
        </Button>
      </Box>
    </Box>
  );
};

export default GenerateTabs;
