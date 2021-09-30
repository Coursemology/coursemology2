# frozen_string_literal: true
class Course::Survey < ApplicationRecord
  acts_as_lesson_plan_item has_todo: true

  include Course::ClosingReminderConcern

  enum question_type: { text_response: 0, multiple_choice: 1, multiple_response: 2 }

  validates :end_at, presence: true, if: :allow_response_after_end
  validates :anonymous, inclusion: { in: [true, false] }
  validates :allow_modify_after_submit, inclusion: { in: [true, false] }
  validates :allow_response_after_end, inclusion: { in: [true, false] }
  validates :creator, presence: true
  validates :updater, presence: true

  # To call Course::Survey::Response.name to force it to load. Otherwise, there might be issues
  # with autoloading of files in production where eager_load is enabled.
  has_many :responses, inverse_of: :survey, dependent: :destroy,
                       class_name: Course::Survey::Response.name
  has_many :sections, inverse_of: :survey, dependent: :destroy
  has_many :questions, through: :sections
  has_many :survey_conditions, class_name: Course::Condition::Survey.name,
                               inverse_of: :survey, dependent: :destroy

  # Used by the with_actable_types scope in Course::LessonPlan::Item.
  # Edit this to remove items for display.
  scope :ids_showable_in_lesson_plan, (lambda do |_|
    # joining { lesson_plan_item }.selecting { lesson_plan_item.id }
    unscoped.joins(:lesson_plan_item).select(Course::LessonPlan::Item.arel_table[:id])
  end)

  def can_user_start?(_user)
    allow_response_after_end || end_at.nil? || Time.zone.now < end_at
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
    self.course = duplicator.options[:destination_course]
    copy_attributes(other, duplicator)
    self.sections = duplicator.duplicate(other.sections)
    survey_conditions << other.survey_conditions.
                         select { |condition| duplicator.duplicated?(condition.conditional) }.
                         map { |condition| duplicator.duplicate(condition) }
  end

  def include_in_consolidated_email?(event)
    Course::Settings::SurveyComponent.email_enabled?(course, "survey_#{event}".to_sym)
  end
end
