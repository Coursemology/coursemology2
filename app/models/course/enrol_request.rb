class Course::EnrolRequest < ActiveRecord::Base
  stampable
  acts_as_paranoid

  scope :student, -> { where(role: CourseUser.roles[:student]) }
  scope :staff, -> { where(role: [CourseUser.roles[:teaching_assistant],
                                  CourseUser.roles[:manager]]) }

  enum role: CourseUser.roles

  belongs_to :course
  belongs_to :user

  # TODO notify lecturer method
end
