# Represents a category of assessments. This is typically 'Mission' and 'Training'.
class Course::Assessment::Category < ActiveRecord::Base
  belongs_to :course
  has_many :tabs, class_name: Course::Assessment::Tab.name
  has_many :assessments, through: :tabs
end
