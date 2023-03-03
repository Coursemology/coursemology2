import EditorCard from './EditorCard';
import ExistingPackageFile from './ExistingPackageFile';
import NewPackageFile from './NewPackageFile';
import translations from './OnlineEditorView.intl';
import TestCase from './TestCase';

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
          testCaseError.expression = intl.formatMessage(
            translations.cannotBeBlankValidationError,
          );
          hasError = true;
        }
        if (testCase.get('expected').trim() === '') {
          testCaseError.expected = intl.formatMessage(
            translations.cannotBeBlankValidationError,
          );
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
    // Check if autograded and codaveri, solution template is required
    if (
      data.getIn(['question', 'is_codaveri']) &&
      data.getIn(['question', 'codaveri_is_solution_required']) &&
      testData.get('solution').trim() === ''
    ) {
      errors.push({
        path: pathOfKeysToData.concat(['error_solution']),
        error: intl.formatMessage(translations.noSolutionTemplateError),
      });
    }
  }

  return errors;
}

export { EditorCard, ExistingPackageFile, NewPackageFile, TestCase };
