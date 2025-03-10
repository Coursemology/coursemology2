import { Dispatch, FC, SetStateAction } from 'react';
import { defineMessages } from 'react-intl';
import { Divider, Paper, Typography } from '@mui/material';
import moment from 'moment';
import { LiveFeedbackChatMessage } from 'types/course/assessment/submission/liveFeedback';

import { justifyPosition } from 'course/assessment/submission/components/GetHelpChatPage/utils';
import MarkdownText from 'course/assessment/submission/components/MarkdownText';
import useTranslation from 'lib/hooks/useTranslation';
import { SHORT_DATE_TIME_FORMAT } from 'lib/moment';

interface Props {
  messages: LiveFeedbackChatMessage[];
  selectedMessageIndex: number;
  setSelectedMessageIndex: Dispatch<SetStateAction<number>>;
}

const translations = defineMessages({
  getHelpHeader: {
    id: 'course.assessment.submission.GetHelpChatPage',
    defaultMessage: 'Get Help',
  },
});

const isAllFileIdsIdentical = (
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

const LiveFeedbackConversation: FC<Props> = (props) => {
  const { messages, selectedMessageIndex, setSelectedMessageIndex } = props;

  const selectedMessageFileIdHash: Record<number, boolean> = messages[
    selectedMessageIndex
  ].files.reduce(function (map, file) {
    map[file.id] = true;
    return map;
  }, {});

  const allChosenMessageIndex = {};
  allChosenMessageIndex[selectedMessageIndex] = true;

  for (let i = selectedMessageIndex - 1; i > -1; i--) {
    if (
      isAllFileIdsIdentical(
        messages[i].files.map((file) => file.id),
        selectedMessageFileIdHash,
      )
    ) {
      allChosenMessageIndex[i] = true;
    } else {
      break;
    }
  }

  for (let i = selectedMessageIndex + 1; i < messages.length; i++) {
    if (
      isAllFileIdsIdentical(
        messages[i].files.map((file) => file.id),
        selectedMessageFileIdHash,
      )
    ) {
      allChosenMessageIndex[i] = true;
    } else {
      break;
    }
  }

  const { t } = useTranslation();

  return (
    <Paper className="flex flex-col w-full mb-2" variant="outlined">
      <div className="flex-none p-1 flex items-center justify-between">
        <Typography className="pl-2" variant="h6">
          {t(translations.getHelpHeader)}
        </Typography>
      </div>

      <Divider />

      <div className="flex-1 overflow-auto mt-1">
        {messages.map((message, index) => {
          const isStudent = message.creatorId !== 0;
          const isError = message.isError;
          const createdAt = moment(new Date(message.createdAt)).format(
            SHORT_DATE_TIME_FORMAT,
          );

          return (
            <div
              key={message.id}
              className={`flex ${justifyPosition(isStudent, isError)} ${allChosenMessageIndex[index] && 'bg-green-200'}`}
            >
              <div
                className={`flex flex-col rounded-lg ${isStudent ? 'bg-blue-200' : 'bg-gray-200'} max-w-[70%] pt-3 pl-3 pr-3 pb-2 m-2 w-fit text-wrap break-words space-y-1 hover:cursor-pointer`}
                onClick={() => setSelectedMessageIndex(index)}
              >
                <MarkdownText content={`${message.content}`} />
                {!isError && (
                  <Typography
                    className="flex flex-col text-gray-400 text-right"
                    variant="caption"
                  >
                    {createdAt}
                  </Typography>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Paper>
  );
};

export default LiveFeedbackConversation;
