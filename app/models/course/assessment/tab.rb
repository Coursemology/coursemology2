class Course::Assessment::Tab < ActiveRecord::Base
  belongs_to :category, class_name: Course::Assessment::Category.name, inverse_of: :tabs
  has_many :assessments, class_name: Course::Assessment.name
end
