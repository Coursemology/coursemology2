const CODAVERI_TESTCASE_VISIBILITIES = ['public', 'private', 'hidden'] as const;
type TestcaseVisibility = (typeof CODAVERI_TESTCASE_VISIBILITIES)[number];

export interface CodaveriGenerateResponse {
  success: boolean;
  message: string;
  data: CodaveriGenerateResponseData;
}

export interface CodaveriGenerateResponseData {
  title: string;
  description: string;
  resources: {
    templates: {
      prefix?: string;
      content?: string;
    }[];
    solutions: {
      files: {
        path: string;
        content?: string;
      }[];
    }[];
    exprTestcases: {
      lhsExpression: string;
      rhsExpression: string;
      hint: string;
      visibility: TestcaseVisibility;
    }[];
  }[];
}
