class Course::Achievement < ActiveRecord::Base
  acts_as_conditional
  stampable

  after_initialize :set_defaults, if: :new_record?

  belongs_to :creator, class_name: User.name
  belongs_to :course, inverse_of: :achievements

  default_scope { order(weight: :asc) }

  # Set default values
  def set_defaults
    self.weight ||= 10
  end
end
