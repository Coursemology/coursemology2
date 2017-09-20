# frozen_string_literal: true
class Course::GroupUser < ApplicationRecord
  after_initialize :set_defaults, if: :new_record?

  enum role: { normal: 0, manager: 1 }

  validate :course_user_and_group_in_same_course

  belongs_to :course_user, inverse_of: :group_users
  belongs_to :group, class_name: Course::Group.name, inverse_of: :group_users

  private

  # Set default values
  def set_defaults
    self.role ||= :normal
  end

  # Checks if course_user and course_group belongs to the same course.
  def course_user_and_group_in_same_course
    return if group.course == course_user.course
    errors.add(:course_user, :not_enrolled)
  end
end
