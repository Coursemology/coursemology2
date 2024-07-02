# frozen_string_literal: true
class Course::GroupUser < ApplicationRecord
  after_initialize :set_defaults, if: :new_record?

  enum role: { normal: 0, manager: 1 }

  validate :course_user_and_group_in_same_course
  validates :role, presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :course_user, presence: true
  validates :group, presence: true
  validates :course_user_id, uniqueness: { scope: [:group_id], if: -> { group_id? && course_user_id_changed? } }
  validates :group_id, uniqueness: { scope: [:course_user_id], if: -> { course_user_id? && group_id_changed? } }

  belongs_to :course_user, inverse_of: :group_users
  belongs_to :group, class_name: 'Course::Group', inverse_of: :group_users

  scope :order_by_course_user_name, lambda {
                                      joins('LEFT OUTER JOIN course_users ON '\
                                            'course_users.id = course_group_users.course_user_id').
                                        order('name ASC')
                                    }

  private

  # Set default values
  def set_defaults
    self.role ||= :normal
  end

  # Checks if course_user and course_group belongs to the same course.
  def course_user_and_group_in_same_course
    return if group.group_category.course == course_user.course

    errors.add(:course_user, :not_enrolled)
  end
end
