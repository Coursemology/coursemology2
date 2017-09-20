# frozen_string_literal: true
class Course::Discussion::Post::Vote < ApplicationRecord
  belongs_to :post, inverse_of: :votes

  # @!method self.upvotes
  #   Gets all upvotes.
  scope :upvotes, -> { where(vote_flag: true) }

  # @!method self.downvotes
  #   Gets all downvotes.
  scope :downvotes, -> { where(vote_flag: false) }
end
