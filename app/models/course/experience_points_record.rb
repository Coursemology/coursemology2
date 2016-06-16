# frozen_string_literal: true
class Course::ExperiencePointsRecord < ActiveRecord::Base
  actable

  before_save :send_notification, if: :reached_new_level?

  validates :reason, presence: true, if: :manually_awarded?

  belongs_to :course_user, inverse_of: :experience_points_records

  scope :active, -> { where { points_awarded != nil } } # rubocop:disable Style/NonNilCheck

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

  # The string to be displayed under the 'reason' column in the experience points history page.
  #
  # @return [String] The formatted reason for the award
  def reason
    manually_awarded? ? super : specific.experience_points_display_reason
  end

  private

  def send_notification
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
end
