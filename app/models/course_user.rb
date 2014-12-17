class CourseUser < ActiveRecord::Base
  enum role: { student: 0, teaching_assistant: 1, manager: 2, owner: 3 }
end
