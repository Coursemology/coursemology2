class Course::ExperiencePointsRecord < ActiveRecord::Base
  actable

  validates :reason, presence: true, if: :manual_exp?

  belongs_to :course_user, inverse_of: :experience_points_records

  scope :active, -> { where { points_awarded != nil } }

  def manual_exp?
    true
  end

  # Checks if the current record is active, i.e. it has been granted by a course staff.
  #
  # This is necessary for records to be created but not graded, such as that of assessments.
  #
  # @return [bool]
  def active?
    points_awarded.present?
  end
end
