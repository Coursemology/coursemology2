# frozen_string_literal: true
# The author-supplied content a mock ("custom") answer provides for one of its question's grading contexts
# (see Course::Assessment::Question::GradingContext). Mock answers have no submission, so their context can't
# be resolved from real answers -- this stores what the author typed, injected into the mock evaluation
# labelled by the linked context's identifier.
class Course::Assessment::Question::MockAnswer::GradingContext < ApplicationRecord
  belongs_to :mock_answer, class_name: 'Course::Assessment::Question::MockAnswer', inverse_of: :grading_contexts
  belongs_to :grading_context, class_name: 'Course::Assessment::Question::GradingContext', inverse_of: false

  validates :grading_context_id, uniqueness: { scope: :mock_answer_id }

  delegate :identifier, to: :grading_context
end
