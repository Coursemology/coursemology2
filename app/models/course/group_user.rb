class Course::GroupUser < ActiveRecord::Base
  after_initialize :set_defaults, if: :new_record?

  enum role: { normal: 0, manager: 1 }

  validate :user_and_group_in_same_course

  belongs_to :user, inverse_of: :course_group_users
  belongs_to :course_group, class_name: Course::Group.name, inverse_of: :group_users

  alias_method :group, :course_group

  private

  # Set default values
  def set_defaults
    self.role ||= :normal
  end

  def user_and_group_in_same_course #:nodoc:
    return if user.courses.include?(group.course)
    errors.add(:user, I18n.t('activerecord.errors.models.course_group_user.not_enrolled'))
  end
end
