export enum ErrorType {
  AttachmentRequired = 'ATTACHMENT_REQUIRED',
  AtMostOneAttachmentAllowed = 'AT_MOST_ONE_ATTACHMENT_ALLOWED',
}

export interface ErrorStruct {
  questionNumber: string;
  errorTypes: ErrorType[];
}
