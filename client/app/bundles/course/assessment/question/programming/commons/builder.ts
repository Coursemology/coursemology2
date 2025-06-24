import {
  BasicMetadata,
  DataFile,
  JavaMetadata,
  JavaMetadataTestCase,
  LanguageMode,
  MetadataTestCase,
  ProgrammingFormRequestData,
} from 'types/course/assessment/question/programming';

import {
  isDraftable,
  isMarked,
  unwrap,
} from '../components/common/DataFileRow';
import { attachment, isAttached } from '../components/common/PackageUploader';

const buildKey = (
  path: string[],
  root: string | undefined = undefined,
): string => {
  if (root) {
    return path.reduce((key, subkey) => `${key}[${subkey}]`, root);
  }
  return path.reduce((key, subkey) => `${key}[${subkey}]`);
};

const shouldBeRaw = (
  value: unknown,
): value is string | File | Blob | null | undefined =>
  typeof value === 'string' ||
  value instanceof File ||
  value instanceof Blob ||
  value === null ||
  value === undefined;

const appendInto = <T>(
  data: FormData,
  path: string | string[],
  value: T,
): void => {
  const key = buildKey(
    Array.isArray(path) ? path : [path],
    'question_programming',
  );
  data.append(key, shouldBeRaw(value) ? value ?? '' : JSON.stringify(value));
};

const appendFilesInto = (
  data: FormData,
  type: string,
  files?: DataFile[],
): void =>
  files?.forEach((file) => {
    if (isMarked(file)) {
      const filename = unwrap(file).filename;
      appendInto(data, [`${type}_files_to_delete`, filename], 'on');
    } else if (isDraftable(file) && file.raw) {
      appendInto(data, [`${type}_files`, ''], file.raw);
    }
  });

const getNewPackageIn = (
  draft: ProgrammingFormRequestData,
): File | undefined => {
  const maybeAttachedPackage = draft.question.package;
  if (!maybeAttachedPackage || !isAttached(maybeAttachedPackage))
    return undefined;

  return attachment(maybeAttachedPackage);
};

const appendTestCaseInto = <T extends MetadataTestCase>(
  data: FormData,
  type: string,
  testCase: T,
): void => {
  appendInto(data, ['test_cases', type, '', 'expression'], testCase.expression);
  appendInto(data, ['test_cases', type, '', 'expected'], testCase.expected);
  appendInto(data, ['test_cases', type, '', 'hint'], testCase.hint);
};

const appendTestCasesInto = <M extends BasicMetadata>(
  data: FormData,
  metadata: M,
  appender = appendTestCaseInto,
): void =>
  Object.entries(metadata.testCases).forEach(([type, testCases]) => {
    testCases.forEach((testCase) => appender(data, type, testCase));
  });

const appendInsertsInto = <M extends BasicMetadata>(
  data: FormData,
  metadata: M,
): void => {
  appendInto(data, 'prepend', metadata.prepend);
  appendInto(data, 'append', metadata.append);
};

const appendTemplatesInto = <M extends BasicMetadata>(
  data: FormData,
  metadata: M,
): void => {
  appendInto(data, 'submission', metadata.submission);
  appendInto(data, 'solution', metadata.solution);
};

const basicBuilder = <M extends BasicMetadata>(
  data: FormData,
  metadata: M,
): void => {
  appendTemplatesInto(data, metadata);
  appendInsertsInto(data, metadata);
  appendFilesInto(data, 'data', metadata.dataFiles);
  appendTestCasesInto(data, metadata);
};

const javaBuilder = (data: FormData, metadata: JavaMetadata): void => {
  appendInto(data, 'submit_as_file', metadata.submitAsFile);

  if (metadata.submitAsFile) {
    appendFilesInto(data, 'submission', metadata.submissionFiles);
    appendFilesInto(data, 'solution', metadata.solutionFiles);
  } else {
    appendTemplatesInto(data, metadata);
  }

  appendInsertsInto(data, metadata);
  appendFilesInto(data, 'data', metadata.dataFiles);

  appendTestCasesInto(data, metadata, (_data, type, testCase) => {
    appendTestCaseInto(data, type, testCase);

    appendInto(
      _data,
      ['test_cases', type, '', 'inline_code'],
      (testCase as unknown as JavaMetadataTestCase).inlineCode,
    );
  });
};

const POLYGLOT_BUILDER: Partial<
  Record<LanguageMode, (data: FormData, metadata) => void>
> = {
  python: basicBuilder,
  c_cpp: basicBuilder,
  java: javaBuilder,
  r: basicBuilder,
  javascript: basicBuilder,
  csharp: basicBuilder,
  golang: basicBuilder,
  rust: basicBuilder,
  typescript: basicBuilder,
};

const appendSkillIdsInto = (data: FormData, skillIds: number[]): void =>
  skillIds.forEach((skillId) =>
    appendInto(data, ['question_assessment', 'skill_ids', ''], skillId),
  );

const buildFormData = (draft: ProgrammingFormRequestData): FormData => {
  const data = new FormData();

  appendInto(data, 'title', draft.question.title);
  appendInto(data, 'description', draft.question.description);
  appendInto(data, 'staff_only_comments', draft.question.staffOnlyComments);
  appendInto(data, 'maximum_grade', draft.question.maximumGrade);
  appendInto(data, 'language_id', draft.question.languageId);
  appendSkillIdsInto(data, draft.question.skillIds ?? []);

  if (draft.question.autograded) appendInto(data, 'autograded', 'on');
  appendInto(data, 'autograded', draft.question.autograded);

  appendInto(data, 'is_codaveri', draft.question.isCodaveri);
  appendInto(data, 'memory_limit', draft.question.memoryLimit);
  appendInto(data, 'time_limit', draft.question.timeLimit);
  appendInto(data, 'is_low_priority', draft.question.isLowPriority);
  appendInto(data, 'live_feedback_enabled', draft.question.liveFeedbackEnabled);
  if (draft.question.liveFeedbackEnabled)
    appendInto(
      data,
      'live_feedback_custom_prompt',
      draft.question.liveFeedbackCustomPrompt,
    );

  if (!draft.question.autogradedAssessment)
    appendInto(data, 'attempt_limit', draft.question.attemptLimit);

  if (draft.question.autograded && draft.question.editOnline) {
    POLYGLOT_BUILDER[draft.testUi?.mode ?? '']?.(data, draft.testUi?.metadata);
  }

  if (draft.question.autograded && !draft.question.editOnline) {
    const newPackage = getNewPackageIn(draft);
    if (newPackage) appendInto(data, 'file', newPackage);
  }

  if (!draft.question.autograded)
    appendInto(data, 'submission', draft.testUi?.metadata.submission);

  return data;
};

export default buildFormData;
