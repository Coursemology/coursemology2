class CourseUser < ActiveRecord::Base
  belongs_to :user, inverse_of: :course_users
  belongs_to :course, inverse_of: :course_users
  enum role: { student: 0, teaching_assistant: 1, manager: 2, owner: 3 }
end
