import {
  AttachmentType,
  CellRandomConfig,
  CellRandomConfigBody,
  SpreadsheetCellValue,
  TextResponseQuestionFormData,
} from 'types/course/assessment/question/text-responses';

export const getAttachmentTypeFromMaxAttachment = (
  maxAttachments: number | undefined,
): AttachmentType => {
  if (!maxAttachments || maxAttachments === 0) {
    return AttachmentType.NO_ATTACHMENT;
  }

  if (maxAttachments === 1) {
    return AttachmentType.SINGLE_ATTACHMENT;
  }

  return AttachmentType.MULTIPLE_ATTACHMENT;
};

export const getMaxAttachmentFromAttachmentType = (
  question: TextResponseQuestionFormData,
): number => {
  if (question.attachmentType === AttachmentType.NO_ATTACHMENT) {
    return 0;
  }

  if (question.attachmentType === AttachmentType.SINGLE_ATTACHMENT) {
    return 1;
  }

  return question.maxAttachments;
};

export const getMaxAttachmentSize = (
  question: TextResponseQuestionFormData,
): number | null => {
  if (question.attachmentType === AttachmentType.NO_ATTACHMENT) {
    return null;
  }

  return question.maxAttachmentSize;
};

const MILLISECONDS_IN_A_WEEK = 7 * 24 * 60 * 60 * 1000;

export const generateRandomSeed = (): number => {
  return Math.floor(Math.random() * 2_147_483_648);
};

export const getDefaultRandomizationMode = (
  cellValue: SpreadsheetCellValue,
): CellRandomConfig['mode'] => {
  if (cellValue === undefined) return 'off';
  if (cellValue instanceof Date) return 'date';
  if (typeof cellValue === 'number' || !Number.isNaN(Number(cellValue)))
    return 'numeric';
  return cellValue.length > 0 ? 'string' : 'off';
};

export function getDefaultRandomizationConfig<
  M extends CellRandomConfig['mode'],
>(
  cellValue: SpreadsheetCellValue,
  randomizationMode: M,
): CellRandomConfigBody<M>;
export function getDefaultRandomizationConfig(
  cellValue: SpreadsheetCellValue,
  randomizationMode: CellRandomConfig['mode'],
): Omit<CellRandomConfig, 'mode' | 'cell'> {
  switch (randomizationMode) {
    case 'numeric': {
      let numericValue = Number(cellValue);
      if (Number.isNaN(numericValue)) numericValue = 0;
      return {
        min: Number((numericValue * 0.9).toPrecision(6)),
        max: Number((numericValue * 1.1).toPrecision(6)),
        roundToInteger: false,
      };
    }
    case 'date': {
      const dateValue = cellValue instanceof Date ? cellValue : new Date();
      return {
        min: new Date(dateValue.getTime() - MILLISECONDS_IN_A_WEEK),
        max: new Date(dateValue.getTime() + MILLISECONDS_IN_A_WEEK),
        roundToDay: true,
      };
    }
    case 'override':
      return { value: String(cellValue ?? '') };
    case 'shuffle':
      return {};
    case 'string':
      return {
        randomizeDigits: true,
        randomizeLetters: true,
      };
    default:
      return {};
  }
}
