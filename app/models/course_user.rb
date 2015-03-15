class CourseUser < ActiveRecord::Base
  belongs_to :user, inverse_of: :course_users
  belongs_to :course, inverse_of: :course_users
  enum role: { student: 0, teaching_assistant: 1, manager: 2, owner: 3 }
  scope :student, -> { where(role: roles[:student]) }
  scope :teaching_assistant, -> { where(role: roles[:teaching_assistant]) }
  scope :manager, -> { where(role: roles[:manager]) }
  scope :owner, -> { where(role: roles[:owner]) }
  scope :staff, -> { where(role: [roles[:teaching_assistant], roles[:manager], roles[:owner]]) }
end
