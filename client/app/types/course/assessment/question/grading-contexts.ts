// Grading-context editor shared by the rubric-graded question forms (RBR + forum post). Mirrors the BE
// Course::Assessment::Question::GradingContext.

export interface GradingContextEntity {
  id?: number | string | null;
  contextType: string;
  // The sibling question id for `sibling_question_answer`; null for intrinsic types (e.g. `forum_thread`).
  sourceId?: number | null;
  identifier: string;
  draft?: boolean;
}

export interface GradingContextSourceOption {
  id: number;
  title: string;
  questionType: string;
}

// The grading-context form-data fields the backend emits (see _grading_context_fields.json.jbuilder).
export interface GradingContextFormData {
  gradingContexts: GradingContextEntity[];
  availableGradingContextTypes: string[];
  contextSourceOptions: GradingContextSourceOption[];
}

export interface GradingContextPostData {
  id?: GradingContextEntity['id'];
  context_type: string;
  source_id?: number | null;
  identifier: string;
}
