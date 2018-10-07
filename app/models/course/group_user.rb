# frozen_string_literal: true
class Course::GroupUser < ApplicationRecord
  after_initialize :set_defaults, if: :new_record?

  enum role: { normal: 0, manager: 1 }

  validate :course_user_and_group_in_same_course
  validates_presence_of :role
  validates_presence_of :creator
  validates_presence_of :updater
  validates_presence_of :course_user
  validates_presence_of :group
  validates_uniqueness_of :course_user_id, scope: [:group_id], allow_nil: true,
                                           if: -> { group_id? && course_user_id_changed? }
  validates_uniqueness_of :group_id, scope: [:course_user_id], allow_nil: true,
                                     if: -> { course_user_id? && group_id_changed? }

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
