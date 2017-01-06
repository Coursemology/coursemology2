# frozen_string_literal: true
class Course::Video < ActiveRecord::Base
  acts_as_lesson_plan_item has_todo: true

  include Course::ReminderConcern

  after_initialize :set_defaults, if: :new_record?

  has_many :submissions, class_name: Course::Video::Submission.name,
                         inverse_of: :video, dependent: :destroy

  def self.use_relative_model_naming?
    true
  end

  def to_partial_path
    'course/video/videos/video'.freeze
  end

  private

  def set_defaults
    self.published = false
  end
end
