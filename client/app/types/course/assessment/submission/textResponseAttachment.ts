export interface TextResponseAttachmentsData {
  attachments: AttachmentData[];
  clientVersion: number;
  id: number;
}

export interface TextResponseAttachmentPostData {
  answer: {
    files: File[];
    clientVersion: number;
    id: number;
  };
}

interface AttachmentData {
  name: string;
  id: string;
}
