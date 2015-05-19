class Course::ExperiencePointsRecord < ActiveRecord::Base
  actable
  stampable

  validates :points_awarded, numericality: { only_integer: true }
  validates :reason, presence: true, if: :manual_exp?

  belongs_to :course_user, inverse_of: :experience_points_records

  def manual_exp?
    true
  end
end
