import { LiveFeedbackChatMessage } from 'types/course/assessment/submission/liveFeedback';

export const justifyPosition = (
  isStudent: boolean,
  isError: boolean,
): string => {
  if (isStudent) {
    return 'justify-end';
  }

  if (isError) {
    return 'justify-center';
  }

  return 'justify-start';
};

export const isAllFileIdsIdentical = (
  fileIds: number[],
  fileIdHash: Record<number, boolean>,
): boolean => {
  if (fileIds.length !== Object.keys(fileIdHash).map(Number).length) {
    return false;
  }

  for (let i = 0; i < fileIds.length; i++) {
    if (!fileIdHash[fileIds[i]]) {
      return false;
    }
  }

  return true;
};

export const groupMessagesByFileIds = (
  messages: LiveFeedbackChatMessage[],
): Array<{
  groupId: string;
  indices: number[];
}> => {
  const groups: Array<{ groupId: string; indices: number[] }> = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const fileIds = message.files
      .map((file) => file.id)
      .sort()
      .join(',');

    // Find existing group with same file IDs
    const existingGroup = groups.find((group) => group.groupId === fileIds);

    if (existingGroup) {
      existingGroup.indices.push(i);
    } else {
      groups.push({
        groupId: fileIds,
        indices: [i],
      });
    }
  }

  return groups;
};

export const fetchAllIndexWithIdenticalFileIds = (
  messages: LiveFeedbackChatMessage[],
  selectedMessageIndex: number,
): Record<number, boolean> => {
  const selectedMessageFileIdHash: Record<number, boolean> = messages[
    selectedMessageIndex
  ].files.reduce(function (map, file) {
    map[file.id] = true;
    return map;
  }, {});

  const allIndexWithIdenticalFileIds: Record<number, boolean> = {};
  allIndexWithIdenticalFileIds[selectedMessageIndex] = true;

  let doneChoosingBackwardIndex = false;
  let doneChoosingForwardIndex = false;

  for (let offset = 1; offset < messages.length; offset++) {
    if (!doneChoosingBackwardIndex) {
      const backwardIndex = selectedMessageIndex - offset;
      if (backwardIndex >= 0) {
        if (
          isAllFileIdsIdentical(
            messages[backwardIndex].files.map((file) => file.id),
            selectedMessageFileIdHash,
          )
        ) {
          allIndexWithIdenticalFileIds[backwardIndex] = true;
        } else {
          doneChoosingBackwardIndex = true;
        }
      } else {
        doneChoosingBackwardIndex = true;
      }
    }

    if (!doneChoosingForwardIndex) {
      const forwardIndex = selectedMessageIndex + offset;
      if (forwardIndex <= messages.length - 1) {
        if (
          isAllFileIdsIdentical(
            messages[forwardIndex].files.map((file) => file.id),
            selectedMessageFileIdHash,
          )
        ) {
          allIndexWithIdenticalFileIds[forwardIndex] = true;
        } else {
          doneChoosingForwardIndex = true;
        }
      } else {
        doneChoosingForwardIndex = true;
      }
    }
  }

  return allIndexWithIdenticalFileIds;
};
