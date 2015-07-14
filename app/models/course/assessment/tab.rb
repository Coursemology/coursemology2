class Course::Assessment::Tab < ActiveRecord::Base
  belongs_to :category, class_name: Course::Assessment::Category.name
  has_many :assessments, class_name: Course::Assessment.name
end
