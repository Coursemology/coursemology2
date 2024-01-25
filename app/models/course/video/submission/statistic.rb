# frozen_string_literal: true
class Course::Video::Submission::Statistic < ApplicationRecord
  include Course::Video::Submission::Statistic::GenieTaskCompletionConcern

  belongs_to :submission, inverse_of: :statistic

  validates :percent_watched, numericality: { only_integer: true,
                                              greater_than_or_equal_to: 0,
                                              less_than_or_equal_to: 100 },
                              allow_nil: true
end
