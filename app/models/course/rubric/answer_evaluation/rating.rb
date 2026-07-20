# frozen_string_literal: true
# A course staff member's rating of the AI-generated feedback drafted from an answer evaluation. Initialized
# (unrated) when the draft feedback post is created; at most one active rating per post (partial unique index
# on post_id). When a rated post's feedback is re-generated, the old rating is detached (post_id nullified)
# and preserved, and a fresh rating is created for the new content -- so an evaluation accrues a history of
# ratings over time. See docs/rubric_ai_feedback_rating_plan.md.
class Course::Rubric::AnswerEvaluation::Rating < ApplicationRecord
  validates :original_feedback, presence: true
  validates :creator, presence: true
  validates :updater, presence: true

  belongs_to :answer_evaluation,
             class_name: 'Course::Rubric::AnswerEvaluation',
             inverse_of: :ratings
  # Nullified (not destroyed) when the draft post is deleted or the feedback is re-generated, so the rating is
  # retained for later analysis.
  belongs_to :post,
             class_name: 'Course::Discussion::Post',
             inverse_of: :ai_feedback_rating, optional: true

  # Snapshots the staff member's final feedback text -- called from the post lifecycle when the draft feedback
  # post is published (accepted) or rejected (destroyed), so the rating records what was ultimately kept.
  def capture_edited_content(content)
    update!(edited_feedback: content)
  end
end
