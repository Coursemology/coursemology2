class Course::LessonPlanItem < ActiveRecord::Base
  actable
  stampable

  after_initialize :set_default_values, if: :new_record?

  validates :base_exp, numericality: { only_integer: true }
  validates :time_bonus_exp, numericality: { only_integer: true }
  validates :extra_bonus_exp, numericality: { only_integer: true }

  # Gives the maximum number of EXP Points that an EXP-awarding item
  # is allocated to give, which is the sum of base and bonus EXPs.
  #
  # @return [Integer] Maximum EXP awardable.
  def total_exp
    base_exp + time_bonus_exp + extra_bonus_exp
  end

  private

  # Sets default EXP values
  def set_default_values
    self.base_exp ||= 0
    self.time_bonus_exp ||= 0
    self.extra_bonus_exp ||= 0
  end
end
