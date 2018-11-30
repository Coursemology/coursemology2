# frozen_string_literal: true
class Course::Video::Statistic < ApplicationRecord
  belongs_to :video, inverse_of: :statistic

  validates :percent_watched, numericality: { only_integer: true,
                                              greater_than_or_equal_to: 0,
                                              less_than_or_equal_to: 100 },
                              allow_nil: true
end
