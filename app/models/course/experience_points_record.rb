class Course::ExperiencePointsRecord < ActiveRecord::Base
  actable

  validates :reason, presence: true, if: :manual_exp?

  belongs_to :course_user, inverse_of: :experience_points_records

  scope :active, -> { where { points_awarded != nil } }

  # Checks if the current record is active, i.e. it has been granted by a course staff.
  #
  # This is necessary for records to be created but not graded, such as that of assessments.
  #
  # @return [bool]
  def active?
    points_awarded.present?
  end

  protected

  # Checks if the given record is a manually-awarded experience points record.
  #
  # @return [bool]
  def manual_exp?
    actable_type.nil? && actable.nil?
  end
end
