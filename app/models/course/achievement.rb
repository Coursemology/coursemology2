class Course::Achievement < ActiveRecord::Base
  acts_as_conditional

  after_initialize :set_defaults, if: :new_record?

  belongs_to :course, inverse_of: :achievements

  default_scope { order(weight: :asc) }

  # Set default values
  def set_defaults
    self.weight ||= 10
  end
end
