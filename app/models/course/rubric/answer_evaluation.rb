# frozen_string_literal: true
class Course::Rubric::AnswerEvaluation < ApplicationRecord
  # Three kinds of evaluation share this table (see the v2 migration):
  #   * +playground+        -- raw LLM output (auto-grade + playground). <=1 per (answer, rubric).
  #   * +playground_hidden+ -- a +playground+ evaluation the user has dismissed; same data, but excluded
  #                            when fetching evaluations for the playground. Re-evaluating un-hides it.
  #   * +grading+           -- the official, grade-bearing breakdown shown to graders/students. At most one
  #                            per answer. Its +rubric_id+ records which rubric the grade was EVALUATED
  #                            against and is immutable through rubric edits (so the grade reads as "stale"
  #                            once the active rubric advances); auto-grading / applying from the playground
  #                            set it. It is NULL when the answer was graded by hand without AI prefill
  #                            ("manually graded"). The displayed breakdown follows the selections' rubric,
  #                            not this column.
  # The enum provides the scopes/predicates; partial unique indexes enforce the cardinality at the DB level
  # (one +grading+ per answer; one +playground+/+playground_hidden+ per (answer, rubric)).
  enum :evaluation_type, { grading: 'grading', playground: 'playground', playground_hidden: 'playground_hidden' },
       default: :playground

  # +playground+ and +playground_hidden+ are the same kind of record (visible vs dismissed).
  scope :playground_types, -> { where(evaluation_type: [:playground, :playground_hidden]) }

  validates :answer, presence: true
  # A +grading+ evaluation may have a null rubric (manually graded, no AI); +playground+ kinds always need one.
  validates :rubric, presence: true, unless: :grading?
  validates :answer_id, uniqueness: { conditions: -> { where(evaluation_type: :grading) } }, if: :grading?
  validates :rubric_id,
            uniqueness: { scope: :answer_id, conditions: -> { playground_types } },
            if: -> { playground? || playground_hidden? }

  belongs_to :answer, class_name: 'Course::Assessment::Answer', inverse_of: :rubric_evaluations
  belongs_to :rubric, class_name: 'Course::Rubric', inverse_of: :answer_evaluations, optional: true

  has_many :selections,
           class_name: 'Course::Rubric::AnswerEvaluation::Selection',
           foreign_key: :answer_evaluation_id, inverse_of: :answer_evaluation, dependent: :destroy

  # Ratings of the AI-generated feedback drafted from this evaluation (includes detached history -- ratings
  # whose post was re-generated or deleted keep pointing here via answer_evaluation_id).
  has_many :ratings,
           class_name: 'Course::Rubric::AnswerEvaluation::Rating',
           foreign_key: :answer_evaluation_id, inverse_of: :answer_evaluation, dependent: :destroy

  # Finds the answer's playground evaluation for the rubric -- visible OR previously dismissed -- or builds
  # a new one. The result is set to +playground+, so saving it un-hides a dismissed evaluation.
  def self.find_or_build_playground(answer:, rubric:)
    evaluation = playground_types.find_by(answer: answer, rubric: rubric) || new(answer: answer, rubric: rubric)
    evaluation.evaluation_type = :playground
    evaluation
  end
end
