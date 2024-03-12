export enum ErrorType {
  AttachmentRequired = 'ATTACHMENT_REQUIRED',
  AttachmentNumberExceedLimit = 'ATTACHMENT_NUMBER_EXCEED_LIMIT',
  NoError = 'NO_ERROR',
}

export interface ErrorStruct {
  questionNumber: string;
  errorTypes: ErrorType[];
}
