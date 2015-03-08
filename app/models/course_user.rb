class CourseUser < ActiveRecord::Base
  belongs_to :user, inverse_of: :course_users
  belongs_to :course, inverse_of: :course_users
  enum role: { student: 0, teaching_assistant: 1, manager: 2, owner: 3 }
  scope :student, -> { where(role: :student) }
  scope :teaching_assistant, -> { where(role: :teaching_assistant) }
  scope :manager, -> { where(role: :manager) }
  scope :owner, -> { where(role: :owner) }
  scope :staff, -> { where(role: :staff) }
end
