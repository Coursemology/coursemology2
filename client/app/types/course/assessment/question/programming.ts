import { AvailableSkills, QuestionFormData } from '../questions';

export type LanguageMode = 'c_cpp' | 'java' | 'javascript' | 'python';

export interface LanguageData {
  id: number;
  name: string;
  disabled: boolean;
  editorMode: LanguageMode;
}

export interface PackageInfoData {
  name: string;
  path: string;
  updaterName: string;
  updatedAt: string;
}

interface PackageTemplateData {
  id: number;
  filename: string;
  content: string;
}

export interface DataFile {
  filename: string;
  size: number;
  hash: string;
}

export interface MetadataTestCase {
  expression: string;
  expected: string;
  hint: string;
}

export interface MetadataTestCases<
  T extends MetadataTestCase = MetadataTestCase,
> {
  public: T[];
  private: T[];
  evaluation: T[];
}

export interface BasicMetadata {
  prepend: string | null;
  submission: string | null;
  append: string | null;
  solution: string | null;
  dataFiles: DataFile[];
  testCases: MetadataTestCases;
}

export type CppMetadata = BasicMetadata;

export type PythonMetadata = BasicMetadata;

export interface JavaMetadataTestCase extends MetadataTestCase {
  inlineCode: string;
}

export interface JavaMetadata extends BasicMetadata {
  submitAsFile: boolean;
  submissionFiles: DataFile[];
  solutionFiles: DataFile[];
  testCases: MetadataTestCases<JavaMetadataTestCase>;
}

export type PolyglotMetadata =
  | CppMetadata
  | PythonMetadata
  | JavaMetadata
  | BasicMetadata;

interface ProgrammingQuestionData extends QuestionFormData {
  languageId: LanguageData['id'];
  memoryLimit: number;
  timeLimit: number;
  maxTimeLimit: number;
  attemptLimit: number;
  isLowPriority: boolean;
  autograded: boolean;
  autogradedAssessment: boolean;
  editOnline: boolean;
  isCodaveri: boolean;
  codaveriEnabled: boolean;
  liveFeedbackEnabled: boolean;
  liveFeedbackCustomPrompt: string;

  hasAutoGradings: boolean;
  hasSubmissions: boolean;
  canSwitchPackageType: boolean;

  package?: PackageInfoData;
}

interface PackageTestCase {
  id: number;
  identifier: string;
  expression: string;
  expected: string;
  hint: string;
}

interface PackageTestCases {
  public: PackageTestCase[];
  private: PackageTestCase[];
  evaluation: PackageTestCase[];
}

export interface BuildLogData {
  stdout: string;
  stderr: string;
}

export interface PackageImportResultData {
  importResultMessage?: string;
  status?: 'success' | 'error';
  buildLog?: BuildLogData;
}

export interface PackageDetailsData {
  templates: PackageTemplateData[];
  testCases: PackageTestCases;
}

export interface ProgrammingFormData extends AvailableSkills {
  question: ProgrammingQuestionData;
  languages: LanguageData[];
  packageUi: PackageDetailsData;

  importResult?: PackageImportResultData;

  testUi?: {
    mode: LanguageMode;
    metadata: PolyglotMetadata;
  };
}

export interface ProgrammingFormRequestData {
  question: Partial<ProgrammingQuestionData>;

  testUi?: {
    mode: LanguageMode;
    metadata: PolyglotMetadata;
  };
}

export interface ProgrammingResponseData extends ProgrammingFormData {}

export interface ProgrammingPostStatusData {
  redirectAssessmentUrl: string;
  message: string;

  importJobUrl?: string;
  redirectEditUrl?: string;
  id?: number;
}
