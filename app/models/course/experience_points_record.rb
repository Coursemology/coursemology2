# frozen_string_literal: true
class Course::ExperiencePointsRecord < ActiveRecord::Base
  actable

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
end
