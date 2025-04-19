import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  PackageImportResultError,
  ProgrammingPostStatusData,
} from 'types/course/assessment/question/programming';

import {
  CodaveriGenerateFormData,
  GenerationState,
  LockStates,
  QuestionPrototypeFormData,
  SnapshotState,
} from '../pages/AssessmentGenerate/types';

const generateConversationId = (): string => Date.now().toString(16);
const generateSnapshotId = (): string => Date.now().toString(16);
const sentinelSnapshot = (): SnapshotState => ({
  id: generateSnapshotId(),
  parentId: undefined,
  state: 'sentinel', // 'generating' | 'success' | 'sentinel'
  codaveriData: { languageId: 0, customPrompt: '', difficulty: 'easy' },
  questionData: {
    question: {
      title: '',
      description: '',
    },
    testUi: {
      metadata: {
        solution: '',
        submission: '',
        prepend: null,
        append: null,
        testCases: {
          public: [],
          private: [],
          evaluation: [],
        },
      },
    },
  },
  lockStates: {
    'question.title': false,
    'question.description': false,
    'testUi.metadata.solution': false,
    'testUi.metadata.submission': false,
    'testUi.metadata.prepend': false,
    'testUi.metadata.append': false,
    'testUi.metadata.testCases.public': false,
    'testUi.metadata.testCases.private': false,
    'testUi.metadata.testCases.evaluation': false,
  },
});

const initialState = (): GenerationState => {
  const newConversationId = generateConversationId();
  const snapshot = sentinelSnapshot();
  return {
    activeConversationId: newConversationId,
    conversations: {
      [newConversationId]: {
        id: newConversationId,
        snapshots: {
          [snapshot.id]: snapshot,
        },
        latestSnapshotId: snapshot.id,
        activeSnapshotId: snapshot.id,
        activeSnapshotEditedData: JSON.parse(
          JSON.stringify(snapshot.questionData),
        ),
        toExport: true,
        exportStatus: 'none',
      },
    },
    conversationIds: [newConversationId],
  };
};

export const generationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {
    setActiveConversationId: (
      state,
      action: PayloadAction<{ conversationId: string }>,
    ) => {
      const { conversationId } = action.payload;
      if (state.conversations[conversationId]) {
        state.activeConversationId = conversationId;
      }
    },
    createConversation: (state) => {
      const newConversationId = generateConversationId();
      const snapshot = sentinelSnapshot();
      state.conversations[newConversationId] = {
        id: newConversationId,
        snapshots: {
          [snapshot.id]: snapshot,
        },
        latestSnapshotId: snapshot.id,
        activeSnapshotId: snapshot.id,
        activeSnapshotEditedData: JSON.parse(
          JSON.stringify(snapshot.questionData),
        ),
        toExport: true,
        exportStatus: 'none',
      };
      state.conversationIds.push(newConversationId);
    },
    duplicateConversation: (
      state,
      action: PayloadAction<{ conversationId: string }>,
    ) => {
      const { conversationId } = action.payload;
      const conversation = state.conversations[conversationId];
      const newConversationId = generateConversationId();
      if (conversation) {
        state.conversations[newConversationId] = {
          id: newConversationId,
          snapshots: JSON.parse(JSON.stringify(conversation.snapshots)),
          latestSnapshotId: conversation.latestSnapshotId,
          activeSnapshotId: conversation.activeSnapshotId,
          activeSnapshotEditedData: JSON.parse(
            JSON.stringify(conversation.activeSnapshotEditedData),
          ),
          duplicateFromId: conversationId,
          // export data is not shared between original and duplicate
          toExport: true,
          exportStatus: 'none',
        };
      }
      // insert duplicate next to original
      const originalIndex = state.conversationIds.findIndex(
        (id) => id === conversationId,
      );
      state.conversationIds.splice(originalIndex + 1, 0, newConversationId);
    },
    deleteConversation: (
      state,
      action: PayloadAction<{ conversationId: string }>,
    ) => {
      const { conversationId } = action.payload;
      const conversation = state.conversations[conversationId];
      if (conversation) {
        const originalIndex = state.conversationIds.findIndex(
          (id) => id === conversationId,
        );
        state.conversationIds.splice(originalIndex, 1);
        delete state.conversations[conversationId];
      }
    },
    createSnapshot: (
      state,
      action: PayloadAction<{
        conversationId: string;
        codaveriData: CodaveriGenerateFormData;
        snapshotId: string;
        parentId: string;
        lockStates: LockStates;
      }>,
    ) => {
      const { conversationId, codaveriData, snapshotId, parentId, lockStates } =
        action.payload;
      const conversation = state.conversations[conversationId];
      if (conversation) {
        conversation.snapshots[snapshotId] = {
          id: snapshotId,
          parentId,
          lockStates,
          codaveriData,
          state: 'generating',
        };
      }
    },
    snapshotSuccess: (
      state,
      action: PayloadAction<{
        conversationId: string;
        questionData: QuestionPrototypeFormData;
        snapshotId: string;
      }>,
    ) => {
      const { conversationId, questionData, snapshotId } = action.payload;
      const conversation = state.conversations[conversationId];
      if (conversation?.snapshots[snapshotId]) {
        conversation.snapshots[snapshotId].questionData = questionData;
        conversation.snapshots[snapshotId].state = 'success';
        conversation.latestSnapshotId = snapshotId;
      }
    },
    snapshotError: (
      state,
      action: PayloadAction<{
        conversationId: string;
        snapshotId: string;
      }>,
    ) => {
      const { conversationId, snapshotId } = action.payload;
      const conversation = state.conversations[conversationId];
      if (conversation) {
        delete conversation.snapshots[snapshotId];
      }
    },
    saveActiveData: (
      state,
      action: PayloadAction<{
        conversationId: string;
        snapshotId: string;
        questionData?: QuestionPrototypeFormData;
      }>,
    ) => {
      const { conversationId, snapshotId, questionData } = action.payload;
      const conversation = state.conversations[conversationId];
      if (conversation) {
        let isParentOfLatestSnapshot = false;
        let traversalId: string | undefined = conversation.latestSnapshotId;
        while (traversalId) {
          if (traversalId === snapshotId) {
            isParentOfLatestSnapshot = true;
            break;
          }
          traversalId = conversation.snapshots[traversalId].parentId;
        }

        if (!isParentOfLatestSnapshot) {
          conversation.latestSnapshotId = snapshotId;
        }
        conversation.activeSnapshotId = snapshotId;
        if (questionData) {
          conversation.activeSnapshotEditedData = questionData;
        }
      }
    },
    setActiveFormTitle: (state, action: PayloadAction<{ title: string }>) => {
      state.activeConversationFormTitle = action.payload.title;
    },
    setConversationToExport: (
      state,
      action: PayloadAction<{
        conversationId: string;
        toExport: boolean;
      }>,
    ) => {
      const { conversationId, toExport } = action.payload;
      const conversation = state.conversations[conversationId];
      if (conversation) {
        conversation.toExport = toExport;
      }
    },
    exportConversation: (
      state,
      action: PayloadAction<{
        conversationId: string;
      }>,
    ) => {
      const { conversationId } = action.payload;
      const conversation = state.conversations[conversationId];
      if (conversation) {
        conversation.toExport = false;
        conversation.exportStatus = 'pending';
      }
    },
    exportConversationPendingImport: (
      state,
      action: PayloadAction<{
        conversationId: string;
        data: ProgrammingPostStatusData;
      }>,
    ) => {
      const { conversationId, data } = action.payload;
      const conversation = state.conversations[conversationId];
      if (conversation) {
        conversation.exportStatus = 'importing';
        conversation.importJobUrl = data.importJobUrl;
        // PATCH does not regenerate these fields
        conversation.redirectEditUrl =
          data.redirectEditUrl ?? conversation.redirectEditUrl;
        conversation.questionId = data.id ?? conversation.questionId;
      }
    },
    exportConversationSuccess: (
      state,
      action: PayloadAction<{
        conversationId: string;
        data?: ProgrammingPostStatusData;
      }>,
    ) => {
      const { conversationId, data } = action.payload;
      const conversation = state.conversations[conversationId];
      if (conversation) {
        conversation.exportStatus = 'exported';
        if (data) {
          conversation.importJobUrl = data.importJobUrl;
          conversation.redirectEditUrl =
            data.redirectEditUrl ?? conversation.redirectEditUrl;
          conversation.questionId = data.id ?? conversation.questionId;
        }
      }
    },
    exportConversationError: (
      state,
      action: PayloadAction<{
        conversationId: string;
        exportError?: PackageImportResultError;
        exportErrorMessage?: string;
      }>,
    ) => {
      const { conversationId } = action.payload;
      const conversation = state.conversations[conversationId];
      if (conversation) {
        conversation.exportStatus = 'error';
        conversation.exportError = action.payload.exportError;
        conversation.exportErrorMessage = action.payload.exportErrorMessage;
      }
    },
    clearErroredConversationData: (state) => {
      Object.values(state.conversations).forEach((conversation) => {
        if (conversation.exportStatus === 'error') {
          conversation.toExport = true;
          conversation.exportStatus = 'none';
          delete conversation.importJobUrl;
        }
      });
    },
  },
});

export const generationActions = generationSlice.actions;

export default generationSlice.reducer;
