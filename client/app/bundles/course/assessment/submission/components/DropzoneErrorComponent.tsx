import { FC } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import { PromptText } from 'lib/components/core/dialogs/Prompt';

const translations = defineMessages({
  tooManyFilesErrorMessage: {
    id: 'course.assessment.submission.FileInput.tooManyFilesErrorMessage',
    defaultMessage:
      'You have attempted to upload {numFiles} files, but ONLY {maxAttachmentsAllowed} \
      {maxAttachmentsAllowed, plural, one {file} other {files}} can be uploaded \
      {numAttachments, plural, =0 {} one {since 1 file has been uploaded before} \
      other {since {numAttachments} files has been uploaded before}}',
  },
  fileTooLargeErrorMessage: {
    id: 'course.assessment.submission.FileInput.fileTooLargeErrorMessage',
    defaultMessage:
      'The following files have size larger than allowed ({maxAttachmentSize} MB)',
  },
  fileName: {
    id: 'course.assessment.submission.FileInput.fileName',
    defaultMessage: '{index}. {name}',
  },
});

export const ErrorCodes = {
  FileTooLarge: 'file-too-large',
  TooManyFiles: 'too-many-files',
};

interface TooManyFilesPrompt {
  maxAttachmentsAllowed: number;
  numAttachments: number;
  numFiles: number;
}

export const TooManyFilesErrorPromptContent: FC<TooManyFilesPrompt> = (
  props,
) => {
  const { maxAttachmentsAllowed, numAttachments, numFiles } = props;
  return (
    <PromptText>
      <FormattedMessage
        {...translations.tooManyFilesErrorMessage}
        values={{
          maxAttachmentsAllowed,
          numFiles,
          numAttachments,
        }}
      />
    </PromptText>
  );
};

interface FileTooLargePrompt {
  maxAttachmentSize: number;
  tooLargeFiles: string[];
}

export const FileTooLargeErrorPromptContent: FC<FileTooLargePrompt> = (
  props,
) => {
  const { maxAttachmentSize, tooLargeFiles } = props;
  return (
    <>
      <PromptText>
        <FormattedMessage
          {...translations.fileTooLargeErrorMessage}
          values={{ maxAttachmentSize }}
        />
      </PromptText>
      {tooLargeFiles.map((name, index) => (
        <PromptText key={name} className="ml-6">
          <FormattedMessage
            {...translations.fileName}
            values={{ index: index + 1, name }}
          />
        </PromptText>
      ))}
    </>
  );
};
