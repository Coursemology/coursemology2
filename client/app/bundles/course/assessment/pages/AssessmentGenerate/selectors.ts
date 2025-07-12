import { AppState } from 'store';

import { GenerationPageState } from './types';

export const getAssessmentGenerateQuestionsData = (
  state: AppState,
): GenerationPageState => {
  const internalState = state.assessments.generatePage;
  const conversationMetadata = Object.values(internalState.conversations)
    .map((conversation) => {
      let title: string | undefined;
      if (
        conversation.id === internalState.activeConversationId &&
        internalState.activeConversationFormTitle !== undefined
      ) {
        // For active conversation, always use activeConversationFormTitle
        // This ensures that when user deletes the title, it shows "Untitled Question"
        title =
          internalState.activeConversationFormTitle.length > 0
            ? internalState.activeConversationFormTitle
            : undefined;
      } else if (
        conversation.activeSnapshotEditedData.question.title.length > 0
      ) {
        title = conversation.activeSnapshotEditedData.question.title;
      }
      return {
        id: conversation.id,
        title,
        hasData:
          Object.values(conversation.snapshots).filter(
            (snapshot) => snapshot.state !== 'sentinel',
          ).length > 0,
        isGenerating:
          Object.values(conversation.snapshots).filter(
            (snapshot) => snapshot.state === 'generating',
          ).length > 0,
      };
    })
    .reduce((reducerObject, metadata) => {
      reducerObject[metadata.id] = metadata;
      return reducerObject;
    }, {});
  const canExportCount = internalState.conversationIds.filter(
    (id) => conversationMetadata[id]?.hasData,
  ).length;
  const exportCount = internalState.conversationIds.filter(
    (id) =>
      internalState.conversations[id]?.toExport &&
      conversationMetadata[id]?.hasData,
  ).length;
  return {
    ...internalState,
    conversationMetadata,
    exportCount,
    canExportCount,
  };
};
