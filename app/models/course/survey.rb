# frozen_string_literal: true
class Course::Survey < ApplicationRecord
  acts_as_lesson_plan_item has_todo: true

  include Course::ReminderConcern

  enum question_type: { text_response: 0, multiple_choice: 1, multiple_response: 2 }
  validates :end_at, presence: true, if: :allow_response_after_end

  # To call Course::Survey::Response.name to force it to load. Otherwise, there might be issues
  # with autoloading of files in production where eager_load is enabled.
  has_many :responses, inverse_of: :survey, dependent: :destroy,
                       class_name: Course::Survey::Response.name
  has_many :questions, through: :sections
  has_many :sections, inverse_of: :survey, dependent: :destroy

  def can_user_start?(_user)
    allow_response_after_end || Time.zone.now < end_at
  end

  def has_student_response?
    responses.find do |response|
      response.experience_points_record.course_user.student?
    end.present?
  end

  def can_toggle_anonymity?
    !anonymous || !has_student_response?
  end

  def initialize_duplicate(duplicator, other)
    copy_attributes(other, duplicator)
    self.sections = duplicator.duplicate(other.sections)
    self.course = duplicator.options[:target_course]
  end
end
