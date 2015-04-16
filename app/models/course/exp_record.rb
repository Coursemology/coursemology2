class Course::ExpRecord < ActiveRecord::Base
  actable
  stampable

  belongs_to :course_user, inverse_of: :exp_records

  validates :exp_awarded, numericality: { only_integer: true }
  validates :reason, presence: true, if: :manual_exp?

  # True if EXP record is manually given.
  # Before saving of source item, e.g. submission,
  # #specific is nil. The conditional is a workaround.
  #
  # @return [Boolean]
  def manual_exp?
    new_record? ? actable_type.nil? : specific.nil?
  end
end
