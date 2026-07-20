# frozen_string_literal: true
# A course staff member's rating of a RagWise-generated forum answer post. Initialized (unrated) when the
# answer post is created; at most one active rating per post (partial unique index on post_id). The post's
# faithfulness / answer-relevance scores are snapshotted here at rating time so user ratings can be correlated
# against RAG quality even after the source post is edited or deleted. See docs/rubric_ai_feedback_rating_plan.md.
class Course::Forum::RagWiseRating < ApplicationRecord
  validates :original_content, presence: true
  validates :creator, presence: true
  validates :updater, presence: true

  # Nullified (not destroyed) when the answer post is deleted, so the rating is retained for later analysis.
  belongs_to :post,
             class_name: 'Course::Discussion::Post',
             inverse_of: :rag_wise_rating, optional: true

  # Snapshots the staff member's final answer text -- called from the post lifecycle when the generated answer
  # post is published (accepted) or rejected (destroyed), so the rating records what was ultimately kept.
  def capture_edited_content(content)
    update!(edited_content: content)
  end
end
