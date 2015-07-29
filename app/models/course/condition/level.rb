class Course::Condition::Level < ActiveRecord::Base
  acts_as_condition
  validates :minimum_level, numericality: { greater_than: 0 }

  def title
    self.class.human_attribute_name('title.title', value: minimum_level)
  end
end
