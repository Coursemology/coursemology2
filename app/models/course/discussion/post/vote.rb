# frozen_string_literal: true
class Course::Discussion::Post::Vote < ApplicationRecord
  validates_inclusion_of :vote_flag, in: [true, false], message: :blank
  validates_presence_of :creator
  validates_presence_of :updater
  validates_presence_of :post
  validates_uniqueness_of :creator_id, scope: [:post_id], allow_nil: true,
                                       if: -> { post_id? && creator_id_changed? }
  validates_uniqueness_of :post_id, scope: [:creator_id], allow_nil: true,
                                    if: -> { creator_id? && post_id_changed? }

  belongs_to :post, inverse_of: :votes

  # @!method self.upvotes
  #   Gets all upvotes.
  scope :upvotes, -> { where(vote_flag: true) }

  # @!method self.downvotes
  #   Gets all downvotes.
  scope :downvotes, -> { where(vote_flag: false) }
end
