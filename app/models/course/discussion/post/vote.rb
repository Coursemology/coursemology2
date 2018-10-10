# frozen_string_literal: true
class Course::Discussion::Post::Vote < ApplicationRecord
  validates :vote_flag, inclusion: { in: [true, false] }
  validates :creator, presence: true
  validates :updater, presence: true
  validates :post, presence: true
  validates :creator_id, uniqueness: { scope: [:post_id], if: -> { post_id? && creator_id_changed? } }
  validates :post_id, uniqueness: { scope: [:creator_id], if: -> { creator_id? && post_id_changed? } }

  belongs_to :post, inverse_of: :votes

  # @!method self.upvotes
  #   Gets all upvotes.
  scope :upvotes, -> { where(vote_flag: true) }

  # @!method self.downvotes
  #   Gets all downvotes.
  scope :downvotes, -> { where(vote_flag: false) }
end
