import translations from './OnlineEditorView.intl';
import ExistingDataFile from './../../components/ExistingDataFile';
import NewDataFile from './../../components/NewDataFile';
import TestCase from './../../components/TestCase';
import EditorCard from './../../components/EditorCard';

export function validation(data, pathOfKeysToData, intl) {
  const errors = [];
  const testData = data.getIn(pathOfKeysToData);
  if (data.getIn(['question', 'autograded'])) {
    let testsCount = 0;

    ['public', 'private', 'evaluation'].forEach((type) => {
      const testCases = testData.getIn(['test_cases', type]);
      testsCount += testCases.size;

      testCases.forEach((testCase, index) => {
        const testCaseError = {};
        let hasError = false;

        if (testCase.get('expression').trim() === '') {
          testCaseError.expression =
            intl.formatMessage(translations.cannotBeBlankValidationError);
          hasError = true;
        }
        if (testCase.get('expected').trim() === '') {
          testCaseError.expected =
            intl.formatMessage(translations.cannotBeBlankValidationError);
          hasError = true;
        }

        if (hasError) {
          errors.push({
            path: pathOfKeysToData.concat(['test_cases', type, index, 'error']),
            error: testCaseError,
          });
        }
      });
    });

    if (testsCount === 0) {
      errors.push({
        path: pathOfKeysToData.concat(['test_cases', 'error']),
        error: intl.formatMessage(translations.noTestCaseErrorAlert),
      });
    }
  }

  return errors;
}

export {
  ExistingDataFile,
  NewDataFile,
  TestCase,
  EditorCard,
};
