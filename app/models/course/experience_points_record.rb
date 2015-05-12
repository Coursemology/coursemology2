class Course::ExperiencePointsRecord < ActiveRecord::Base
  actable
  stampable

  belongs_to :course_user, inverse_of: :experience_points_records

  validates :points_awarded, numericality: { only_integer: true }
  validates :reason, presence: true, if: :manual_exp?

  def manual_exp?
    true
  end
end
