class Course::Assessment::Submission < ActiveRecord::Base
  acts_as_experience_points_record

  belongs_to :assessment
  belongs_to :course_user
  has_many :answers
end
