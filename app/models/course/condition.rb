class Course::Condition < ActiveRecord::Base
  actable

  belongs_to :course, inverse_of: false
  belongs_to :conditional, polymorphic: true

  delegate :satisfied_by?, to: :actable

  NAMES = ['achievement', 'level']
end
