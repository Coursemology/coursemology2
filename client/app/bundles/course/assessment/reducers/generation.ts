import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  PackageImportResultError,
  ProgrammingPostStatusData,
} from 'types/course/assessment/question/programming';

import {
  GenerationState,
  LockStates,
  McqMrqGenerateFormData,
  McqMrqPrototypeFormData,
  ProgrammingGenerateFormData,
  ProgrammingPrototypeFormData,
  SnapshotState,
} from '../pages/AssessmentGenerate/types';

const generateConversationId = (): string => Date.now().toString(16);
const generateSnapshotId = (): string => Date.now().toString(16);
const sentinelSnapshot = (
  questionType: 'programming' | 'mrq' | 'mcq',
): SnapshotState => {
  switch (questionType) {
    case 'mrq':
      return {
        id: generateSnapshotId(),
        parentId: undefined,
        state: 'sentinel',
        generateFormData: {
          customPrompt: '',
          numberOfQuestions: 1,
          generationMode: 'create',
        },
        questionData: {
          question: {
            title: '',
            description: '',
            skipGrading: false,
            randomizeOptions: false,
          },
          options: [],
          gradingScheme: 'all_correct',
        },
        lockStates: {
          'question.title': false,
          'question.description': false,
          'question.options': false,
          'question.correct': false,
        },
      };
    case 'mcq':
      return {
        id: generateSnapshotId(),
        parentId: undefined,
        state: 'sentinel',
        generateFormData: {
          customPrompt: '',
          numberOfQuestions: 1,
          generationMode: 'create',
        },
        questionData: {
          question: {
            title: '',
            description: '',
            skipGrading: false,
            randomizeOptions: false,
          },
          options: [],
          gradingScheme: 'any_correct',
        },
        lockStates: {
          'question.title': false,
          'question.description': false,
          'question.options': false,
          'question.correct': false,
        },
      };
    case 'programming':
    default:
      return {
        id: generateSnapshotId(),
        parentId: undefined,
        state: 'sentinel',
        generateFormData: {
          languageId: 0,
          customPrompt: '',
          difficulty: 'easy',
        },
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
      };
  }
};

const initialState = (
  questionType: 'programming' | 'mrq' | 'mcq' = 'programming',
): GenerationState => {
  const newConversationId = generateConversationId();
  const snapshot = sentinelSnapshot(questionType);
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
    initializeGeneration: (
      state,
      action: PayloadAction<{ questionType: 'programming' | 'mrq' | 'mcq' }>,
    ) => {
      const newState = initialState(action.payload.questionType);
      Object.assign(state, newState);
    },
    setActiveConversationId: (
      state,
      action: PayloadAction<{ conversationId: string }>,
    ) => {
      const { conversationId } = action.payload;
      if (state.conversations[conversationId]) {
        state.activeConversationId = conversationId;
      }
    },
    createConversation: (
      state,
      action: PayloadAction<{ questionType: 'programming' | 'mrq' | 'mcq' }>,
    ) => {
      const conversationId = Date.now().toString(16);
      const snapshot = sentinelSnapshot(action.payload.questionType);

      state.conversationIds.push(conversationId);
      state.conversations[conversationId] = {
        id: conversationId,
        snapshots: {
          [snapshot.id]: snapshot,
        },
        latestSnapshotId: snapshot.id,
        activeSnapshotId: snapshot.id,
        activeSnapshotEditedData: JSON.parse(
          JSON.stringify(snapshot.questionData),
        ),
        toExport: false,
        exportStatus: 'none',
      };

      if (state.conversationIds.length === 1) {
        state.activeConversationId = conversationId;
      }
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
        generateFormData: ProgrammingGenerateFormData | McqMrqGenerateFormData;
        snapshotId: string;
        parentId: string;
        lockStates: LockStates;
      }>,
    ) => {
      const {
        conversationId,
        generateFormData,
        snapshotId,
        parentId,
        lockStates,
      } = action.payload;
      const conversation = state.conversations[conversationId];
      if (conversation) {
        conversation.snapshots[snapshotId] = {
          id: snapshotId,
          parentId,
          lockStates,
          generateFormData,
          state: 'generating',
        };
      }
    },
    snapshotSuccess: (
      state,
      action: PayloadAction<{
        conversationId: string;
        questionData: ProgrammingPrototypeFormData | McqMrqPrototypeFormData;
        snapshotId: string;
      }>,
    ) => {
      const { conversationId, questionData, snapshotId } = action.payload;
      const conversation = state.conversations[conversationId];
      if (conversation?.snapshots[snapshotId]) {
        conversation.snapshots[snapshotId].questionData = questionData;
        conversation.snapshots[snapshotId].state = 'success';
        conversation.latestSnapshotId = snapshotId;
        conversation.toExport = true;
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
        questionData?: ProgrammingPrototypeFormData | McqMrqPrototypeFormData;
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
    exportProgrammingConversationPendingImport: (
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
    exportProgrammingConversationSuccess: (
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
    exportMcqMrqConversationSuccess: (
      state,
      action: PayloadAction<{
        conversationId: string;
        data?: { redirectEditUrl: string };
      }>,
    ) => {
      const { conversationId, data } = action.payload;
      const conversation = state.conversations[conversationId];
      if (conversation) {
        conversation.exportStatus = 'exported';
        if (data) {
          conversation.redirectEditUrl = data.redirectEditUrl;
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
    createConversationWithSnapshots: (
      state,
      action: PayloadAction<{
        questionType: 'programming' | 'mrq' | 'mcq';
        copiedSnapshots: { [id: string]: SnapshotState };
        latestSnapshotId: string;
        activeSnapshotId: string;
        activeSnapshotEditedData:
          | ProgrammingPrototypeFormData
          | McqMrqPrototypeFormData;
      }>,
    ) => {
      const conversationId = Date.now().toString(16);

      // Check if the conversation has actual data (not just sentinel snapshots)
      const hasData = Object.values(action.payload.copiedSnapshots).some(
        (snapshot) => snapshot.state !== 'sentinel',
      );

      state.conversationIds.push(conversationId);
      state.conversations[conversationId] = {
        id: conversationId,
        snapshots: action.payload.copiedSnapshots,
        latestSnapshotId: action.payload.latestSnapshotId,
        activeSnapshotId: action.payload.activeSnapshotId,
        activeSnapshotEditedData: action.payload.activeSnapshotEditedData,
        toExport: hasData,
        exportStatus: 'none',
      };
    },
  },
});

export const generationActions = generationSlice.actions;

export default generationSlice.reducer;
