# frozen_string_literal: true
class Course::ExperiencePointsRecord < ApplicationRecord
  actable

  before_save :send_notification, if: :reached_new_level?
  before_create :set_awarded_attributes, if: :manually_awarded?

  validates :reason, presence: true, if: :manually_awarded?

  belongs_to :course_user, inverse_of: :experience_points_records
  # TODO: Add an optional: true when moving to Rails 5.
  belongs_to :awarder, class_name: User.name, inverse_of: nil

  scope :active, -> { where.not(points_awarded: nil) }

  # Checks if the current record is active, i.e. it has been granted by a course staff.
  #
  # This is necessary for records to be created but not graded, such as that of assessments.
  #
  # @return [Boolean]
  def active?
    points_awarded.present?
  end

  # Checks if the given record is a manually-awarded experience points record.
  #
  # @return [Boolean]
  def manually_awarded?
    actable_type.nil? && actable.nil?
  end

  private

  def send_notification
    return unless course_user.real_student?

    Course::LevelNotifier.level_reached(course_user.user, level_after_update)
  end

  # Test if the course_user will reach a new level after current update.
  def reached_new_level?
    return false unless points_awarded && points_awarded_changed?

    level_after_update.level_number > level_before_update.level_number
  end

  def level_before_update
    current_exp = course_user.experience_points
    course_user.course.level_for(current_exp)
  end

  def level_after_update
    # Since we are in the before_save callback, exp changes are not saved yet.
    exp_changed = points_awarded - (points_awarded_was || 0)
    current_exp = course_user.experience_points
    course_user.course.level_for(current_exp + exp_changed)
  end

  def set_awarded_attributes
    self.awarded_at ||= Time.zone.now
    self.awarder ||= User.stamper
  end
end
