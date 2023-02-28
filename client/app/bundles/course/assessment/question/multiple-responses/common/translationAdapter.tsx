import { ElementType } from 'react';

import { Translated } from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import ConvertMcqMrqIllustration, {
  IllustrationProps,
} from '../components/ConvertMcqMrqIllustration';

export interface McqMrqAdapter {
  options: string;
  optionsHint: string;
  option: string;
  markAsCorrect: string;
  willBeDeleted: string;
  newCannotUndoDelete: string;
  undoDelete: string;
  delete: string;
  add: string;
  randomize: string;
  randomizeHint: string;
  alwaysGradeAsCorrectHint: string;
  convert: string;
  convertHint: string;
  convertIllustration: ElementType<IllustrationProps>;
}

export const mrqAdapter: Translated<McqMrqAdapter> = (t) => ({
  options: t(translations.responses),
  optionsHint: t(translations.responsesHint),
  option: t(translations.response),
  markAsCorrect: t(translations.markAsCorrectResponse),
  willBeDeleted: t(translations.responseWillBeDeleted),
  newCannotUndoDelete: t(translations.newResponseCannotUndo),
  undoDelete: t(translations.undoDeleteResponse),
  delete: t(translations.deleteResponse),
  add: t(translations.addResponse),
  randomize: t(translations.randomizeResponses),
  randomizeHint: t(translations.randomizeResponsesHint),
  alwaysGradeAsCorrectHint: t(translations.alwaysGradeAsCorrectHint),
  convert: t(translations.changeToMcq),
  convertHint: t(translations.convertToMcqHint, {
    s: (chunk) => <s>{chunk}</s>,
  }),
  convertIllustration: ConvertMcqMrqIllustration.ToMcq,
});

export const mcqAdapter: Translated<McqMrqAdapter> = (t) => ({
  options: t(translations.choices),
  optionsHint: t(translations.choicesHint),
  option: t(translations.choice),
  markAsCorrect: t(translations.markAsCorrectChoice),
  willBeDeleted: t(translations.choiceWillBeDeleted),
  newCannotUndoDelete: t(translations.newChoiceCannotUndo),
  undoDelete: t(translations.undoDeleteChoice),
  delete: t(translations.deleteChoice),
  add: t(translations.addChoice),
  randomize: t(translations.randomizeChoices),
  randomizeHint: t(translations.randomizeChoicesHint),
  alwaysGradeAsCorrectHint: t(translations.alwaysGradeAsCorrectChoiceHint),
  convert: t(translations.changeToMrq),
  convertHint: t(translations.convertToMrqHint, {
    s: (chunk) => <s>{chunk}</s>,
  }),
  convertIllustration: ConvertMcqMrqIllustration.ToMrq,
});
