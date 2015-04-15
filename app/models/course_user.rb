class CourseUser < ActiveRecord::Base
  belongs_to :user, inverse_of: :course_users
  belongs_to :course, inverse_of: :course_users
  has_many :experience_points_records, class_name: Course::ExperiencePointsRecord.name,
                                       inverse_of: :course_user, dependent: :destroy

  enum role: { student: 0, teaching_assistant: 1, manager: 2, owner: 3 }
end
