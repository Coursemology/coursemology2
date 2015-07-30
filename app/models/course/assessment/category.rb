# Represents a category of assessments. This is typically 'Mission' and 'Training'.
class Course::Assessment::Category < ActiveRecord::Base
  belongs_to :course, inverse_of: :assessment_categories
  has_many :tabs, class_name: Course::Assessment::Tab.name, inverse_of: :category,
           dependent: :destroy
  has_many :assessments, through: :tabs
end
