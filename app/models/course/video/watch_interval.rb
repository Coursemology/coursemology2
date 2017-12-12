# frozen_string_literal: true
class Course::Video::WatchInterval < ApplicationRecord
  belongs_to :submission, inverse_of: :watch_intervals

  validates :video_start, numericality: { greater_than_or_equal_to: 0 }
  validates :video_end, numericality: { greater_than_or_equal_to: :video_start }
end
