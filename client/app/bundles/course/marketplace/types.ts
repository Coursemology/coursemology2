export interface MarketplaceListing {
  id: number;
  assessmentId: number;
  title: string;
  questionCount: number;
  adoptions: number;
  firstPublishedAt: string | null;
  previewUrl: string;
  duplicateUrl: string;
}

export interface DestinationTab {
  id: number;
  title: string;
  categoryId: number;
  categoryTitle: string;
}

export interface MarketplaceIndexData {
  listings: MarketplaceListing[];
  destinationTabs: DestinationTab[];
}

export interface PreviewChoice {
  id: number;
  option: string;
  correct: boolean;
}

export interface PreviewQuestionSummary {
  id: number;
  title: string;
  description: string;
  staffOnlyComments: string;
  maximumGrade: number;
  type: string;
  unautogradable: boolean;
  mcqMrqType?: 'mcq' | 'mrq';
  options?: PreviewChoice[];
}

export interface ListingPreviewData {
  id: number;
  title: string;
  description: string;
  /** Rails endpoint that provisions a preview copy and redirects into the real attempt flow. */
  attemptUrl: string;
  gradingMode: 'autograded' | 'manual';
  baseExp: number | null;
  bonusExp: number | null;
  showMcqMrqSolution: boolean;
  showRubricToStudents: boolean;
  gradedTestCases: string;
  typeCounts: Record<string, number>;
  // Whether the preview leaves any AI-graded question ungraded (PreviewGradingPolicy). Drives the
  // preview banner's grading caveat.
  previewGradingInert: boolean;
  questions: PreviewQuestionSummary[];
}

export interface PreviewAttemptData {
  listingTitle: string;
  previewGradingInert: boolean;
}

export interface ProgrammingTestCase {
  identifier: string;
  expression: string;
  expected: string;
  hint: string;
}

export interface QuestionPreviewData {
  id: number;
  title: string;
  defaultTitle: string;
  description: string;
  staffOnlyComments: string;
  maximumGrade: number;
  // Discriminator. The demodulized actable class name from the backend, e.g. 'Programming'.
  // It — NOT the shape of `detail` — decides which `detail` variant is present: the renderer
  // dispatcher (QuestionPreview) switches on `type`, and each renderer narrows `detail` with a
  // cast (the variants share no literal tag, so TS can't auto-discriminate them). One `type`
  // string ⇒ exactly one `detail` variant below.
  type: string;
  // Human-readable type label for the header chip (e.g. 'Multiple Choice'). Display-only — the
  // renderer dispatch keys off `type`, never this.
  displayType: string;
  // Present variant is fixed by `type` above:
  detail: // type === 'MultipleResponse' — both MCQ and MRQ (gradingScheme 'any_correct' ⇒ MCQ / single
  // answer, 'all_correct' ⇒ MRQ / multi-answer). `options` carries the answer key + explanations.
  | {
        gradingScheme: string;
        options: (PreviewChoice & { explanation: string; weight: number })[];
      }
    // type === 'Programming' — language, limits, template files, and the three test-case buckets
    // (public visible to students, private/evaluation hidden). Any bucket may be empty.
    | {
        languageName: string;
        memoryLimit: number | null;
        timeLimit: number | null;
        templateFiles: { filename: string; content: string }[];
        publicTestCases: ProgrammingTestCase[];
        privateTestCases: ProgrammingTestCase[];
        evaluationTestCases: ProgrammingTestCase[];
      }
    // type === 'TextResponse' — covers plain Text Response, File Upload, AND comprehension (one
    // actable, disambiguated by flags: isComprehension, and attachment fields for File Upload).
    | {
        hideText: boolean;
        isAttachmentRequired: boolean;
        maxAttachments: number;
        maxAttachmentSize: number | null;
        isComprehension: boolean;
        solutions: {
          solutionType: string;
          solution: string;
          grade: number;
          explanation: string;
        }[];
      }
    // type === 'RubricBasedResponse' — grading rubric as categories → criteria (grade + explanation).
    | {
        categories: {
          name: string;
          isBonus: boolean;
          criteria: { grade: number; explanation: string }[];
        }[];
      }
    // type === 'ForumPostResponse' — how many forum posts are required + whether a text answer too.
    | { maxPosts: number; hasTextResponse: boolean }
    // type === 'VoiceResponse' — no type-specific setup; the whole prompt IS the base `description`,
    // so `detail` is an empty object.
    | Record<string, never>
    // type === 'Scribing' — the background image students annotate (null if not previewable
    // cross-instance; see the attachment-URL limitation in the design spec).
    | { imageUrl: string | null }
    // Unknown / unsupported `type` — the dispatcher renders nothing.
    | null;
}
