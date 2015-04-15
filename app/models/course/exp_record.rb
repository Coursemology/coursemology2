class Course::ExpRecord < ActiveRecord::Base
  actable
  stampable

  belongs_to :course_user, inverse_of: :exp_records

  validates :course_user, presence: true
  validates :exp_awarded, numericality: { only_integer: true }
  validates :reason, presence: true, if: :manual_exp?

  def manual_exp?
    specific.nil?
  end
end
