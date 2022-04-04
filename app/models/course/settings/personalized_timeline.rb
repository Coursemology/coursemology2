# frozen_string_literal: true
class Course::Settings::PersonalizedTimeline < ApplicationRecord
  self.table_name = 'course_settings_personalized_timeline'

  validates :course, presence: true
  validates :min_overall_limit, numericality: { greater_than: 0, less_than_or_equal: 1 }, allow_nil: true
  validates :max_overall_limit, numericality: { greater_than_or_equal_to: 1 }, allow_nil: true
  validates :hard_min_learning_rate, numericality: { greater_than: 0, less_than_or_equal: 1 }, allow_nil: true
  validates :hard_max_learning_rate, numericality: { greater_than_or_equal_to: 1 }, allow_nil: true
  validates :assessment_submission_time_weight, numericality: { greater_than_or_equal_to: 0, less_than_or_equal: 1 },
                                                allow_nil: true
  validates :assessment_grade_weight, numericality: { greater_than_or_equal_to: 0, less_than_or_equal: 1 },
                                      allow_nil: true
  validates :video_watch_percentage_weight, numericality: { greater_than_or_equal_to: 0, less_than_or_equal: 1 },
                                            allow_nil: true

  belongs_to :course, class_name: Course.name, inverse_of: :setting_personalized_timeline

  def initialize_duplicate(duplicator, _other)
    self.course = duplicator.options[:destination_course]
  end
end
