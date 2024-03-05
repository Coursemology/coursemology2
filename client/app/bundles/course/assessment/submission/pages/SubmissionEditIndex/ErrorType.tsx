import translations from '../../translations';

export enum ErrorType {
  AttachmentRequired = 'ATTACHMENT_REQUIRED',
  AtMostOneAttachmentAllowed = 'AT_MOST_ONE_ATTACHMENT_ALLOWED',
}

export const ErrorTranslation = {
  [ErrorType.AttachmentRequired]: translations.attachmentRequired,
  [ErrorType.AtMostOneAttachmentAllowed]: translations.onlyOneAttachmentAllowed,
};
