class Course::Requirement::Achievement < ActiveRecord::Base
  acts_as :requirement, class_name: 'Course::Requirement'
  belongs_to :achievement, class_name: 'Course::Achievement', foreign_key: 'course_achievement_id'
end
